import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const BUCKET = "profile-media";
const MAX_FILE_SIZE = 4 * 1024 * 1024;
const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

function hasValidSignature(bytes: Uint8Array, type: string) {
  if (type === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (type === "image/png") return bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
  if (type === "image/gif") return String.fromCharCode(...bytes.slice(0, 6)).startsWith("GIF8");
  if (type === "image/webp") {
    return String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
  }
  return false;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Entre na sua conta para enviar uma foto." }, { status: 401 });

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Selecione uma imagem." }, { status: 400 });
  }

  const extension = EXTENSIONS[file.type];
  if (!extension) {
    return NextResponse.json({ error: "Use uma imagem JPG, PNG, WebP ou GIF." }, { status: 400 });
  }
  if (file.size === 0 || file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "A imagem deve ter no máximo 4 MB." }, { status: 400 });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!hasValidSignature(bytes, file.type)) {
    return NextResponse.json({ error: "O arquivo selecionado não é uma imagem válida." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: bucket } = await admin.storage.getBucket(BUCKET);
  if (!bucket) {
    const { error: bucketError } = await admin.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: MAX_FILE_SIZE,
      allowedMimeTypes: Object.keys(EXTENSIONS),
    });
    if (bucketError && !bucketError.message.toLowerCase().includes("already exists")) {
      return NextResponse.json({ error: "Não foi possível preparar o envio da imagem." }, { status: 500 });
    }
  }

  const path = `${user.id}/avatar-${Date.now()}.${extension}`;
  const { error: uploadError } = await admin.storage.from(BUCKET).upload(path, bytes, {
    contentType: file.type,
    cacheControl: "31536000",
    upsert: false,
  });
  if (uploadError) {
    return NextResponse.json({ error: "Não foi possível enviar a foto. Tente novamente." }, { status: 500 });
  }

  const avatarUrl = admin.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  const { error: profileError } = await admin
    .from("profiles")
    .update({ avatar_url: avatarUrl })
    .eq("id", user.id);

  if (profileError) {
    await admin.storage.from(BUCKET).remove([path]);
    return NextResponse.json({ error: "A foto foi enviada, mas não pôde ser salva no perfil." }, { status: 500 });
  }

  return NextResponse.json({ avatarUrl });
}
