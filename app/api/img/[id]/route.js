import { hasNotion, notionImageUrl } from "../../../../lib/notion";

// 노션 본문 이미지를 대신 받아 내려준다(원본 주소는 1시간 뒤 만료). 하루 동안 캐시.
export async function GET(_req, { params }) {
  const { id } = await params;
  if (!hasNotion() || !/^[0-9a-f]{32}$/.test(id)) return new Response(null, { status: 404 });
  try {
    const url = await notionImageUrl(id);
    if (!url) return new Response(null, { status: 404 });
    const img = await fetch(url);
    if (!img.ok) return new Response(null, { status: 404 });
    return new Response(await img.arrayBuffer(), {
      headers: {
        "Content-Type": img.headers.get("content-type") || "image/jpeg",
        "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  } catch {
    return new Response(null, { status: 404 });
  }
}
