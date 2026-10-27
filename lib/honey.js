const BASE = "https://karamjang-arch.github.io/honeybible/days";

// 오늘 날짜 (미국 동부 기준) YYYY-MM-DD
export function todayKey() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Indianapolis" }).format(new Date());
}

export async function getDay(date) {
  try {
    const r = await fetch(`${BASE}/${date}.json`, { next: { revalidate: 3600 } });
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  }
}
