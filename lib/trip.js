// 여행 시리즈 지도: 글의 위도·경도 → 지도 좌표 (서버에서 계산)
import { geoNaturalEarth1 } from "d3-geo";
import geo from "../data/geo-tr.json";

const proj = geoNaturalEarth1().scale(geo.scale).translate(geo.translate);
const P = (lon, lat) => proj([lon, lat]);

// 지원하는 지도 (지금은 튀르키예 하나)
const MAPS = {
  turkey: {
    img: "/maps/turkey.svg",
    bounds: [[25.4, 42.5], [45.2, 35.4]], // 북서, 남동 (경도, 위도)
    labels: [
      { t: "흑해", at: [34.5, 42.75], k: "sea" },
      { t: "지중해", at: [31.6, 35.2], k: "sea" },
      { t: "에게해", at: [25.9, 37.0], k: "sea" },
      { t: "튀르키예", at: [37.4, 39.6], k: "land" },
    ],
    start: { t: "이스탄불 도착", at: [28.95, 41.01] },
    country: "튀르키예",
    thumb: (n) => (n >= 1 && n <= 9 ? `/trips/turkey/${String(n).padStart(2, "0")}.jpg` : ""), // 영상 캡처
  },
};

export const ytThumb = (id) => (id ? `https://i.ytimg.com/vi/${id}/mqdefault.jpg` : "");

export function tripMap(posts, key = "turkey") {
  const m = MAPS[key];
  const stops = posts.filter((p) => p.lat != null && p.lon != null && (p.part ?? 0) > 0).sort((a, b) => a.part - b.part);
  if (!stops.length) return null;
  const [a, b] = [P(...m.bounds[0]), P(...m.bounds[1])];
  let zoom = [a[0], a[1], b[0] - a[0], b[1] - a[1]];
  // 화면 비율 16:10에 맞춰 상자를 넓힘
  const want = 16 / 10;
  if (zoom[2] / zoom[3] < want) { const w = zoom[3] * want; zoom = [zoom[0] - (w - zoom[2]) / 2, zoom[1], w, zoom[3]]; }
  else { const h = zoom[2] / want; zoom = [zoom[0], zoom[1] - (h - zoom[3]) / 2, zoom[2], h]; }
  const u = zoom[2] / 100; // 지도 단위
  // 휴대폰: 경로가 지나간 곳만 가깝게 (4:3.4)
  const xs0 = stops.map((p) => P(p.lon, p.lat));
  const bx = [Math.min(...xs0.map((q) => q[0])), Math.min(...xs0.map((q) => q[1])), Math.max(...xs0.map((q) => q[0])), Math.max(...xs0.map((q) => q[1]))];
  const pad = u * 7;
  let zm = [bx[0] - pad, bx[1] - pad, bx[2] - bx[0] + pad * 2, bx[3] - bx[1] + pad * 2];
  const wm = 4 / 3.4;
  if (zm[2] / zm[3] < wm) { const w = zm[3] * wm; zm = [zm[0] - (w - zm[2]) / 2, zm[1], w, zm[3]]; }
  else { const h = zm[2] / wm; zm = [zm[0], zm[1] - (h - zm[3]) / 2, zm[2], h]; }

  const pts = stops.map((p) => { const [x, y] = P(p.lon, p.lat); return { x, y, ox: x, oy: y }; });
  // 가까운 핀끼리 겹치지 않게 살짝 밀어냄
  const min = u * 3.6;
  for (let it = 0; it < 120; it++) {
    for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
      const dx = pts[j].x - pts[i].x, dy = pts[j].y - pts[i].y;
      const d = Math.hypot(dx, dy) || 0.001;
      if (d < min) { const k = (min - d) / 2 / d; pts[i].x -= dx * k; pts[i].y -= dy * k; pts[j].x += dx * k; pts[j].y += dy * k; }
    }
  }
  const r1 = (n) => Math.round(n * 100) / 100;
  return {
    img: m.img, w: geo.w, h: geo.h, zoom: zoom.map(r1), zoomM: zm.map(r1), u: r1(u), uM: r1(zm[2] / 100),
    labels: m.labels.map((l) => { const [x, y] = P(...l.at); return { ...l, x: r1(x), y: r1(y) }; }),
    start: m.start && (() => { const [x, y] = P(...m.start.at); return { t: m.start.t, x: r1(x), y: r1(y) }; })(),
    stops: stops.map((p, i) => ({
      id: p.id, n: p.part, title: p.title, sub: p.subtitle, place: p.place,
      x: r1(pts[i].x), y: r1(pts[i].y), ox: r1(pts[i].ox), oy: r1(pts[i].oy),
      thumb: p.thumb || (p.cover ? `/api/cover/${p.id}` : ytThumb(p.video)) || m.thumb?.(p.part) || "",
      href: `/blog/p/${p.id}`,
    })),
  };
}

// 올리브 가족 세계지도: 여행 시리즈마다 나라 위에 썸네일 하나
export function familyTrips(posts) {
  const names = [...new Set(posts.filter((p) => p.series && p.lat != null).map((p) => p.series))];
  return names.map((name) => {
    const list = posts.filter((p) => p.series === name);
    const map = tripMap(list);
    if (!map) return null;
    const intro = list.find((p) => p.part === 0);
    const xs = map.stops.map((s) => s.ox), ys = map.stops.map((s) => s.oy);
    const when = (intro?.pinned || list.map((p) => p.pinned).filter(Boolean).sort()[0] || "").slice(0, 7).replace("-", ". ");
    return {
      name, when, country: MAPS.turkey.country,
      href: `/blog/s/${encodeURIComponent(name)}`,
      intro: intro ? `/blog/p/${intro.id}` : null,
      thumb: (intro && (intro.cover ? `/api/cover/${intro.id}` : intro.video ? `https://i.ytimg.com/vi/${intro.video}/mqdefault.jpg` : "")) || map.stops[0].thumb,
      cx: (Math.min(...xs) + Math.max(...xs)) / 2, cy: (Math.min(...ys) + Math.max(...ys)) / 2,
      map,
    };
  }).filter(Boolean);
}
