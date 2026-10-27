import honeyIndex from "../data/honey-index.json";
import sermons from "../data/sermons.json";
import audio from "../data/audio.json";

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

export function honeyAudio(date) {
  return audio[date] || null;
}

export function sermonsOn(date) {
  return sermons.filter((s) => s.date === date);
}

export function getSermon(id) {
  return sermons.find((s) => s.id === id) || null;
}

export function allSermons() {
  return sermons;
}

// 달력 점 표시용
export function calendarEvents() {
  const ev = {};
  for (const d of honeyDates()) (ev[d] ||= []).push("honey");
  for (const s of sermons) (ev[s.date] ||= []).push("sermon");
  return ev;
}

export function fmtDate(date) {
  const [y, m, d] = date.split("-").map(Number);
  const w = ["일", "월", "화", "수", "목", "금", "토"][new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  return `${m}월 ${d}일 ${w}요일`;
}
