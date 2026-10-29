import honeyIndex from "../data/honey-index.json";
import sermons from "../data/sermons.json";
import audio from "../data/audio.json";
import { hasNotion, notionSermonMetaAll, notionSermonDetail, notionSermonById, notionHoneyMeta, notionD6Card, notionD6Detail, notionD6All, notionBlogAll, notionBlogPost } from "./notion";
import d6snap from "../data/d6.json";
import { refOrder, normRef } from "./bible";
import { catOf } from "./cats";
import { slugOf } from "./blog";

const BASE = "https://karamjang-arch.github.io/honeybible/days";

// 오늘 날짜 (West Lafayette 기준)
export function todayKey() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Indianapolis" }).format(new Date());
}

export async function getHoneyDay(date) {
  try {
    const r = await fetch(`${BASE}/${date}.json`, { next: { revalidate: 3600 } });
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  }
}

export function honeyDates() {
  return honeyIndex.days.map((d) => d.date).sort();
}

export function honeyNeighbors(date) {
  const all = honeyDates();
  const i = all.indexOf(date);
  return { prev: i > 0 ? all[i - 1] : null, next: i >= 0 && i < all.length - 1 ? all[i + 1] : null };
}

async function honeyMeta(date) {
  if (!hasNotion()) return null;
  try { return await notionHoneyMeta(date); } catch (e) { console.error("honeyMeta", e.message); return null; }
}

export async function honeyAudio(date) {
  const m = await honeyMeta(date);
  return m?.audio || audio[date] || null;
}

// 오늘의 암송 카드: 새김D6 연결 카드 + (D6에 없는) 꿀성경 JSON 암송, 구약 → 신약 순
export async function honeyMemoryCards(date, memory) {
  const m = await honeyMeta(date);
  let cards = [];
  if (m?.d6?.length) {
    cards = (await Promise.all(m.d6.map(async (id) => {
      try { return await notionD6Card(id); } catch (e) { console.error("d6card", e.message); return null; }
    }))).filter(Boolean);
  } else {
    cards = (d6snap.byDate[date] || []).map((id) => d6snap.cards[id]).filter(Boolean);
  }
  if (memory && !cards.some((c) => normRef(c.ref) === normRef(memory.cite))) {
    cards.push({ id: null, ref: normRef(memory.cite), text: memory.text });
  }
  return cards.sort((a, b) => refOrder(a.ref) - refOrder(b.ref));
}

export async function getD6(id) {
  if (hasNotion()) {
    try { return await notionD6Detail(id); } catch (e) { console.error("getD6", e.message); }
  }
  return d6snap.details[id] || null;
}

// 설교 메타(제목·날짜 등) 전체. 영상·요약은 포함하지 않는다.
export async function sermonMeta() {
  if (hasNotion()) {
    try { return await notionSermonMetaAll(); } catch (e) { console.error("sermonMeta", e.message); }
  }
  return [...sermons].sort((a, b) => b.date.localeCompare(a.date));
}

async function detail(m) {
  if (m.video !== undefined) return m;
  try { return await notionSermonDetail(m); } catch (e) { console.error("sermonDetail", e.message); return m; }
}

export async function sermonsOn(date) {
  const metas = (await sermonMeta()).filter((s) => s.date === date);
  return Promise.all(metas.map(detail));
}

// 최근 설교 n건은 영상·요약까지, 나머지는 제목만
export async function sermonList(n = 12) {
  const metas = await sermonMeta();
  const head = await Promise.all(metas.slice(0, n).map(detail));
  return [...head, ...metas.slice(n)];
}

export async function getSermon(id) {
  const snap = sermons.find((s) => s.id === id);
  if (hasNotion()) {
    try { return await notionSermonById(id); } catch (e) { console.error("getSermon", e.message); }
  }
  return snap || null;
}

export async function calendarEvents() {
  const ev = {};
  for (const d of honeyDates()) (ev[d] ||= []).push("honey");
  for (const s of await sermonMeta()) (ev[s.date] ||= []).push(catOf(s.kind));
  return ev;
}

export function fmtDate(date) {
  const [y, m, d] = date.split("-").map(Number);
  const w = ["일", "월", "화", "수", "목", "금", "토"][new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  return `${m}월 ${d}일 ${w}요일`;
}

// 설교 탭 상단 두 창: 가장 가까운 새벽설교 / 주일설교 (오늘 이전)
export async function sermonFeatured() {
  const t = todayKey();
  const metas = (await sermonMeta()).filter((s) => s.date <= t);
  const pick = (kind) => metas.find((s) => s.kind === kind) || null;
  const [dawn, sunday] = [pick("새벽설교"), pick("주일설교")];
  return {
    dawn: dawn ? await detail(dawn) : null,
    sunday: sunday ? await detail(sunday) : null,
  };
}

// 달력 링크: 그날 설교가 하나면 설교 페이지로, 여럿이면 그날 화면으로
export async function sermonCalendarLinks() {
  const by = {};
  for (const s of await sermonMeta()) (by[s.date] ||= []).push(s);
  const links = {};
  for (const [d, arr] of Object.entries(by)) links[d] = arr.length === 1 ? `/sermon/${arr[0].id}` : `/d/${d}`;
  return links;
}

export function honeyCalendarLinks() {
  return Object.fromEntries(honeyDates().map((d) => [d, `/honey/${d}`]));
}

// 암송 탭: 새김D6 전체 (성경 순서)
export async function d6List() {
  let list = [];
  if (hasNotion()) {
    try { list = await notionD6All(); } catch (e) { console.error("d6list", e.message); }
  }
  if (!list.length) list = Object.values(d6snap.cards || {});
  return list.sort((a, b) => refOrder(a.ref) - refOrder(b.ref));
}

// 블로그 글 (공개된 것만, 최신순)
export async function blogList() {
  if (!hasNotion()) return [];
  // 글이 가리키는 날짜(쓴 날, 없으면 올린 날) 기준 최신순
  try { return (await notionBlogAll()).map((x) => ({ ...x, slug: slugOf(x.cat) })).sort((a, b) => b.created.localeCompare(a.created) || b.posted.localeCompare(a.posted)); }
  catch (e) { console.error("bloglist", e.message); return []; }
}
export async function getBlogPost(id) {
  if (!hasNotion()) return null;
  try { const p = await notionBlogPost(id); return p ? { ...p, slug: slugOf(p.cat) } : null; }
  catch (e) { console.error("blogpost", e.message); return null; }
}
// 달력: 쓴 날은 속이 찬 점, 지정한 날은 빈 점
export function blogEvents(list) {
  const ev = {};
  for (const x of list) {
    (ev[x.created] ||= []).push(x.slug);
    if (x.pinned && x.pinned !== x.created) (ev[x.pinned] ||= []).push(x.slug + "~");
  }
  return ev;
}
export function blogLinks(list) {
  const l = {};
  for (const x of list) {
    l[x.created] ||= `/blog/p/${x.id}`;
    if (x.pinned) l[x.pinned] ||= `/blog/p/${x.id}`;
  }
  return l;
}
