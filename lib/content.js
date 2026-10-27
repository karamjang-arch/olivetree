import honeyIndex from "../data/honey-index.json";
import sermons from "../data/sermons.json";
import audio from "../data/audio.json";
import { hasNotion, notionSermonMetaAll, notionSermonDetail, notionSermonById, notionHoneyAudio } from "./notion";

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

export async function honeyAudio(date) {
  if (hasNotion()) {
    try {
      const u = await notionHoneyAudio(date);
      if (u) return u;
    } catch (e) { console.error("honeyAudio", e.message); }
  }
  return audio[date] || null;
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
  for (const s of await sermonMeta()) (ev[s.date] ||= []).push("sermon");
  return ev;
}

export function fmtDate(date) {
  const [y, m, d] = date.split("-").map(Number);
  const w = ["일", "월", "화", "수", "목", "금", "토"][new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  return `${m}월 ${d}일 ${w}요일`;
}
