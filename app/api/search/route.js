import { searchAll } from "../../../lib/search";

export async function GET(req) {
  const q = (new URL(req.url).searchParams.get("q") || "").slice(0, 60);
  try {
    return new Response(JSON.stringify({ results: await searchAll(q) }), {
      headers: { "Content-Type": "application/json", "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
    });
  } catch {
    return new Response(JSON.stringify({ results: [] }), { headers: { "Content-Type": "application/json" } });
  }
}
