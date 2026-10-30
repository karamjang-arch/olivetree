import { ImageResponse } from "next/og";
import { getBlogPost } from "../../../../../lib/content";
import { cardsFromBlocks, CARD_W, CARD_H } from "../../../../../lib/cards";
import { cardFonts } from "../../../../../lib/cardfont";
import { makeZip } from "../../../../../lib/zip";
import { Card } from "../../../../../components/CardArt";

// /api/card/<글 id>/<장 번호>  → 1080×1350 PNG  (?dl 붙이면 내려받기)
// /api/card/<글 id>/zip        → 전체 장 ZIP
async function render(c, total, base, cat) {
  let img = null;
  if (c.img) {
    try {
      const r = await fetch(new URL(c.img, base));
      if (r.ok) img = `data:${r.headers.get("content-type") || "image/jpeg"};base64,${Buffer.from(await r.arrayBuffer()).toString("base64")}`;
    } catch {}
  }
  const text = Object.values(c).filter((v) => typeof v === "string").join("");
  return new ImageResponse(<Card c={c} total={total} img={img} cat={cat} />, { width: CARD_W, height: CARD_H, fonts: await cardFonts(text) });
}

export async function GET(req, { params }) {
  const { id, n } = await params;
  if (!/^[0-9a-f]{32}$/.test(id)) return new Response(null, { status: 404 });
  const p = await getBlogPost(id);
  const cards = p ? cardsFromBlocks(p.blocks) : [];
  const cache = "public, max-age=300, s-maxage=300, stale-while-revalidate=86400";
  const day = (p?.created || "").slice(0, 10);
  if (n === "zip") {
    if (!cards.length) return new Response(null, { status: 404 });
    const files = [];
    for (const c of cards) files.push({ name: `${day}_카드뉴스_${String(c.n).padStart(2, "0")}.png`, data: Buffer.from(await (await render(c, cards.length, req.url, p?.slug)).arrayBuffer()) });
    return new Response(makeZip(files), { headers: { "Content-Type": "application/zip", "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(`${day}_카드뉴스.zip`)}`, "Cache-Control": cache } });
  }
  const c = cards[Number(n) - 1];
  if (!c) return new Response(null, { status: 404 });
  const res = await render(c, cards.length, req.url, p?.slug);
  res.headers.set("Cache-Control", cache);
  if (new URL(req.url).searchParams.has("dl")) res.headers.set("Content-Disposition", `attachment; filename*=UTF-8''${encodeURIComponent(`${day}_카드뉴스_${String(n).padStart(2, "0")}.png`)}`);
  return res;
}
