import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
const MAX = 4 * 1024 * 1024;
const EXT: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif" };

function valid(bytes: Uint8Array, type: string) {
  if (type === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (type === "image/png") return bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
  if (type === "image/gif") return String.fromCharCode(...bytes.slice(0, 6)).startsWith("GIF8");
  return type === "image/webp" && String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Entre para adicionar uma capa." }, { status: 401 });
  const file = (await request.formData()).get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Selecione uma imagem." }, { status: 400 });
  const extension = EXT[file.type];
  if (!extension) return NextResponse.json({ error: "Use JPG, PNG, WebP ou GIF." }, { status: 400 });
  if (!file.size || file.size > MAX) return NextResponse.json({ error: "A capa deve ter no máximo 4 MB." }, { status: 400 });
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!valid(bytes, file.type)) return NextResponse.json({ error: "O arquivo não é uma imagem válida." }, { status: 400 });
  const admin = createAdminClient();
  const path = `${user.id}/banner-${Date.now()}.${extension}`;
  const { error: uploadError } = await admin.storage.from("profile-media").upload(path, bytes, { contentType: file.type, cacheControl: "31536000" });
  if (uploadError) return NextResponse.json({ error: "Não foi possível enviar a capa." }, { status: 500 });
  const bannerUrl = admin.storage.from("profile-media").getPublicUrl(path).data.publicUrl;
  const { error } = await admin.from("profiles").update({ banner_url: bannerUrl }).eq("id", user.id);
  if (error) {
    await admin.storage.from("profile-media").remove([path]);
    return NextResponse.json({ error: "A capa foi enviada, mas não pôde ser salva." }, { status: 500 });
  }
  return NextResponse.json({ bannerUrl });
}
