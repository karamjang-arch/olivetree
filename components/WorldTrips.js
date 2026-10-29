"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

// 올리브 가족 여정 지도: 세계지도 위 여행 썸네일 → 누르면 그 나라로 날아가 경로와 장소 썸네일이 차례로 → 장소를 누르면 그 편 글
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function routeD(pts) {
  if (pts.length < 2) return "";
  let d = `M${pts[0].x},${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i];
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2, dx = b.x - a.x, dy = b.y - a.y;
    d += ` Q${(mx - dy * 0.18).toFixed(2)},${(my + dx * 0.18).toFixed(2)} ${b.x},${b.y}`;
  }
  return d;
}

export default function WorldTrips({ trips }) {
  const W = trips[0].map.w, H = trips[0].map.h, img = trips[0].map.img;
  const WORLD = [80, 40, W - 160, H - 120]; // 남극·북극 끝을 조금 잘라 낸 세계
  const [vb, setVb] = useState(WORLD);
  const [sel, setSel] = useState(null); // 고른 여행 번호
  const [phase, setPhase] = useState("world"); // world → fly → draw → open → back
  const [shown, setShown] = useState(0);
  const [active, setActive] = useState(null);
  const [pos, setPos] = useState(null);
  const [small, setSmall] = useState(false);
  const svg = useRef(null), box = useRef(null), route = useRef(null), raf = useRef(0), vbRef = useRef(WORLD);

  useEffect(() => {
    const q = window.matchMedia("(max-width: 700px)");
    const f = () => setSmall(q.matches); f();
    q.addEventListener("change", f); return () => q.removeEventListener("change", f);
  }, []);
  useEffect(() => { vbRef.current = vb; }, [vb]);
  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const reduce = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // 화면 상자(viewBox)를 부드럽게 옮김: 배율은 기하적으로, 중심은 곧게
  const fly = (to, ms, done) => {
    cancelAnimationFrame(raf.current);
    const from = vbRef.current;
    if (reduce()) { setVb(to); done?.(); return; }
    const t0 = performance.now();
    const c0 = [from[0] + from[2] / 2, from[1] + from[3] / 2], c1 = [to[0] + to[2] / 2, to[1] + to[3] / 2];
    const step = (now) => {
      const t = Math.min(1, (now - t0) / ms), e = ease(t);
      const w = from[2] * Math.pow(to[2] / from[2], e);
      const asp = from[2] / from[3] + (to[2] / to[3] - from[2] / from[3]) * e;
      const h = w / asp, cx = c0[0] + (c1[0] - c0[0]) * e, cy = c0[1] + (c1[1] - c0[1]) * e;
      setVb([cx - w / 2, cy - h / 2, w, h]);
      if (t < 1) raf.current = requestAnimationFrame(step); else done?.();
    };
    raf.current = requestAnimationFrame(step);
  };

  const open = (i) => {
    const t = trips[i];
    setSel(i); setActive(null); setShown(0); setPhase("fly");
    fly(small ? t.map.zoomM : t.map.zoom, 1900, () => {
      setPhase("draw");
      const n = t.map.stops.length;
      const len = route.current?.getTotalLength?.() || 1;
      if (route.current) { route.current.style.strokeDasharray = len; route.current.style.strokeDashoffset = len; }
      if (reduce()) { if (route.current) route.current.style.strokeDashoffset = 0; setShown(n); setPhase("open"); return; }
      const t0 = performance.now(), D = 1400 + n * 180;
      const step = (now) => {
        const k = Math.min(1, (now - t0) / D);
        if (route.current) route.current.style.strokeDashoffset = len * (1 - ease(k));
        setShown(Math.min(n, Math.floor(k * (n + 0.6))));
        if (k < 1) raf.current = requestAnimationFrame(step); else { setShown(n); setPhase("open"); }
      };
      raf.current = requestAnimationFrame(step);
    });
  };
  const back = () => { setActive(null); setPhase("back"); fly(WORLD, 1500, () => { setSel(null); setPhase("world"); }); };

  const t = sel != null ? trips[sel] : null;
  const zoomed = t && phase !== "fly" && phase !== "back";
  const u = t ? (small ? t.map.uM * 1.5 : t.map.u) : 1;
  const cur = t?.map.stops.find((s) => s.id === active);

  // 고른 장소 위에 카드
  useEffect(() => {
    if (!cur || !svg.current || !box.current) { setPos(null); return; }
    const place = () => {
      const p = svg.current.createSVGPoint(); p.x = cur.x; p.y = cur.y;
      const sp = p.matrixTransform(svg.current.getScreenCTM());
      const r = box.current.getBoundingClientRect();
      setPos({ x: sp.x - r.left, y: sp.y - r.top, W: r.width });
    };
    place(); window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [active, phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const R = small ? 46 : 34; // 세계지도 위 썸네일 반지름(지도 단위)
  return (
    <>
    <div className="wt-ctl">
      {t && phase === "open" ? (
        <>
          <button onClick={back}>← 세계지도</button>
          <b>{t.name}</b>
          <Link href={t.href}>여정 전체 보기 →</Link>
        </>
      ) : <span>{t ? "그 여행으로 날아가는 중…" : "사진을 누르면 그 여행으로 들어갑니다"}</span>}
    </div>
    <div className={`wtrips ${t ? "in" : ""}`} ref={box}>
      <svg ref={svg} viewBox={vb.join(" ")} preserveAspectRatio="xMidYMid meet" role="img" aria-label="올리브 가족 여정 지도">
        <defs>
          <filter id="wt-sh" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="1.5" stdDeviation="2.2" floodColor="#173b63" floodOpacity=".28" /></filter>
        </defs>
        <rect x={-W} y={-H} width={W * 3} height={H * 3} fill="#a8d5e8" />
        <image href={img} x="0" y="0" width={W} height={H} />

        {/* 세계: 여행마다 떠 있는 썸네일 */}
        {trips.map((x, i) => (
          <g key={x.name} className={`wt-trip ${t ? "hide" : ""}`} transform={`translate(${x.cx} ${x.cy - R * 0.4})`}
            onClick={() => !t && open(i)} role="button" tabIndex={t ? -1 : 0} aria-label={`${x.name} 여정 열기`}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && !t && open(i)}>
            <circle r={R * 1.5} className="wt-pulse" />
            <g className="wt-float">
              <pattern id={`wt-c${i}`} patternContentUnits="objectBoundingBox" width="1" height="1"><image href={x.thumb} width="1" height="1" preserveAspectRatio="xMidYMid slice" /></pattern>
              <circle r={R + 3.5} fill="#fff" filter="url(#wt-sh)" />
              <circle r={R} fill={`url(#wt-c${i})`} />
              <g transform={`translate(0 ${R + 18})`}>
                <rect x={-R * 1.9} y={-12} width={R * 3.8} height={26} rx={13} className="wt-tag" />
                <text y={6} className="wt-label" fontSize={small ? 17 : 13}>{x.country} · {x.when}</text>
              </g>
            </g>
          </g>
        ))}

        {/* 나라: 경로와 장소 썸네일 */}
        {t && (
          <g style={{ opacity: zoomed ? 1 : 0, transition: "opacity .5s" }}>
            <path ref={route} d={routeD([t.map.start, ...t.map.stops].filter(Boolean))} className="tm-route" strokeWidth={u * 0.42} />
            {t.map.start && <g><circle cx={t.map.start.x} cy={t.map.start.y} r={u * 0.9} className="wt-start" /><text x={t.map.start.x} y={t.map.start.y - u * 1.6} className="wt-geo" fontSize={u * 1.3}>{t.map.start.t}</text></g>}
            {t.map.labels.map((l) => <text key={l.t} x={l.x} y={l.y} className={`wt-geo ${l.k}`} fontSize={l.k === "sea" ? u * 1.7 : u * 2.6}>{l.t}</text>)}
            {t.map.stops.map((s, i) => {
              const r = u * (active === s.id ? 3.6 : 3);
              return (
                <g key={s.id} className={`wt-stop ${i < shown ? "in" : ""} ${active === s.id ? "on" : ""}`} transform={`translate(${s.x} ${s.y})`}
                  onMouseEnter={() => setActive(s.id)} onClick={() => setActive(s.id)}
                  role="button" tabIndex={i < shown ? 0 : -1} aria-label={`${s.n}편 ${s.place || s.title}`}
                  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setActive(s.id)}>
                  <g className="pop">
                    {s.thumb && <pattern id={`wt-s${s.id}`} patternContentUnits="objectBoundingBox" width="1" height="1"><image href={s.thumb} width="1" height="1" preserveAspectRatio="xMidYMid slice" /></pattern>}
                    <circle r={r + u * 0.45} cy={u * 0.35} fill="rgba(23,59,99,.22)" />
                    <circle r={r + u * 0.45} fill="#fff" />
                    <circle r={r} fill={s.thumb ? `url(#wt-s${s.id})` : "#2f7a78"} />
                    <circle cx={r * 0.78} cy={-r * 0.78} r={u * 1.05} className="wt-n" />
                    <text x={r * 0.78} y={-r * 0.78 + u * 0.38} fontSize={u * 1.1} className="wt-nt">{s.n}</text>
                  </g>
                </g>
              );
            })}
          </g>
        )}
      </svg>

      {cur && pos && phase === "open" && (
        <Link href={cur.href} className={`tm-card ${pos.y < 170 ? "below" : ""}`} style={{ left: Math.min(Math.max(pos.x, 130), pos.W - 130), top: pos.y }}>
          {cur.thumb && <img src={cur.thumb} alt="" />}
          <span className="tm-cardbody">
            <small>{cur.n}편 · {cur.place}</small>
            <b>{cur.title}</b>
            <i>글 읽기 →</i>
          </span>
        </Link>
      )}
    </div>
    </>
  );
}
