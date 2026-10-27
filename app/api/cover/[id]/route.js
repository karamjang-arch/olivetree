import { hasNotion, notionCoverUrl } from "../../../../lib/notion";

// 노션 설교 페이지 커버 이미지를 대신 받아서 내려준다(원본 주소는 1시간 뒤 만료되기 때문).
export async function GET(_req, { params }) {
  const { id } = await params;
  if (!hasNotion() || !/^[0-9a-f]{32}$/.test(id)) return new Response(null, { status: 404 });
  try {
    const url = await notionCoverUrl(id);
    if (!url) return new Response(null, { status: 404 });
    const img = await fetch(url);
    if (!img.ok) return new Response(null, { status: 404 });
    return new Response(await img.arrayBuffer(), {
      headers: {
        "Content-Type": img.headers.get("content-type") || "image/png",
        "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  } catch {
    return new Response(null, { status: 404 });
  }
}
