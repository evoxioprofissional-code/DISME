import { NextResponse } from "next/server";
import { isDiscordId } from "@/lib/discord";

export const runtime = "nodejs";

const ALLOWED_FORMATS = new Set(["gif", "webp", "png"]);

export async function GET(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id") ?? "";
  const hash = url.searchParams.get("hash") ?? "";
  const requestedFormat = url.searchParams.get("format") ?? (hash.startsWith("a_") ? "gif" : "webp");
  const format = ALLOWED_FORMATS.has(requestedFormat) ? requestedFormat : "webp";

  if (!isDiscordId(id) || !/^[a-zA-Z0-9_-]{2,128}$/.test(hash)) {
    return NextResponse.json({ error: "Asset Discord inválido." }, { status: 400 });
  }
  if (format !== "gif" && hash.startsWith("a_")) {
    return NextResponse.json({ error: "Avatares animados devem preservar o formato GIF." }, { status: 400 });
  }

  const assetUrl = `https://cdn.discordapp.com/avatars/${id}/${hash}.${format}?size=1024`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    const response = await fetch(assetUrl, { signal: controller.signal, cache: "no-store" });
    const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
    const contentLength = Number(response.headers.get("content-length") ?? 0);
    if (!response.ok || !contentType.startsWith("image/") || contentLength > 15 * 1024 * 1024) {
      return NextResponse.json({ error: "Avatar não disponível." }, { status: 404 });
    }
    const body = await response.arrayBuffer();
    if (body.byteLength > 15 * 1024 * 1024) {
      return NextResponse.json({ error: "Avatar excede o limite permitido." }, { status: 413 });
    }
    return new NextResponse(body, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="discord-avatar-${id}.${format}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "Não foi possível baixar o avatar." }, { status: 502 });
  } finally {
    clearTimeout(timeout);
  }
}