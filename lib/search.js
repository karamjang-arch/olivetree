import { sermonMeta, blogList, d6List, honeyDates } from "./content";
import { allBooks } from "./books";
import honeyIndex from "../data/honey-index.json";
import { metaOf } from "./blog";
import { settleAll, settleCat } from "./settle";

const norm = (s = "") => s.toLowerCase().replace(/\s+/g, " ").trim();

// 검색 대상 전체 목록 (종류별로 제목·본문·태그를 모아 둔다)
async function corpus() {
  const [sermons, posts, d6, settle] = await Promise.all([sermonMeta(), blogList(), d6List(), settleAll()]);
  const out = [];
  for (const s of sermons) {
    out.push({ kind: "설교", title: s.title, sub: `${s.date} · ${s.passage || ""}`, href: `/sermon/${s.id}`,
      text: [s.passage, s.bible, s.series, s.kind, s.date].join(" ") });
  }
  const passages = Object.fromEntries(honeyIndex.days.map((d) => [d.date, d.passage]));
  for (const d of honeyDates()) {
    out.push({ kind: "통독", title: `${d.slice(5).replace("-", "월 ")}일 · ${passages[d] || ""}`, sub: d, href: `/honey/${d}`,
      text: [passages[d], d].join(" ") });
  }
  for (const p of posts) {
    out.push({ kind: metaOf(p.slug).name, title: p.title, sub: [p.series ? `${p.series}${p.part ? ` ${p.part}편` : ""}` : "", p.created, p.author].filter(Boolean).join(" · "), href: `/blog/p/${p.id}`,
      text: [p.subtitle, p.summary, p.author, p.cat, p.series, ...(p.topics || []), ...(p.bibles || []), ...p.types, ...p.tags].join(" ") });
  }
  for (const c of d6) {
    out.push({ kind: "암송", title: c.ref, sub: c.text, href: `/d6/${c.id}`, text: c.text });
  }
  for (const z of settle) {
    out.push({ kind: "정착", title: z.title, sub: `${settleCat(z.category).name} · ${z.sub}`, href: `/settle/${z.id}`, text: [z.summary, ...(z.tags || [])].join(" ") });
  }
  for (const b of allBooks()) {
    out.push({ kind: "가스펠", title: b.ko.title, sub: b.en?.title || (b.series === "life" ? "가스펠 라이프" : ""), href: b.series === "life" ? "/gospel/life" : "/gospel", text: [b.en?.title || "", b.blurb, b.kind].join(" ") });
  }
  return out;
}

export async function searchAll(q) {
  const tokens = norm(q).split(" ").filter(Boolean);
  if (!tokens.length) return [];
  const hits = [];
  for (const it of await corpus()) {
    const title = norm(it.title);
    const hay = norm(`${it.title} ${it.sub || ""} ${it.text || ""}`);
    if (!tokens.every((t) => hay.includes(t))) continue;
    const score = tokens.reduce((n, t) => n + (title.includes(t) ? 3 : 0) + (norm(it.kind) === t ? 2 : 0), 0);
    hits.push({ ...it, score });
  }
  return hits.sort((a, b) => b.score - a.score).slice(0, 60).map(({ text, score, ...r }) => r);
}
