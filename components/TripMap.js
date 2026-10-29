"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

// 세계지도 → 튀르키예로 확대 → 경로가 그려지고 핀이 차례로 찍힘
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function routeD(pts) {
  if (pts.length < 2) return "";
  let d = `M${pts[0].x},${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i];
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
    const dx = b.x - a.x, dy = b.y - a.y;
    const k = 0.18; // 살짝 휘는 곡선
    d += ` Q${(mx - dy * k).toFixed(2)},${(my + dx * k).toFixed(2)} ${b.x},${b.y}`;
  }
  return d;
}

export default function TripMap({ map, active, setActive }) {
  const { w, h, stops, labels, start, img } = map;
  const [small, setSmall] = useState(false);
  useEffect(() => {
    const q = window.matchMedia("(max-width: 700px)");
    const f = () => setSmall(q.matches); f();
    q.addEventListener("change", f); return () => q.removeEventListener("change", f);
  }, []);
  const zoom = small ? map.zoomM : map.zoom;
  const u = small ? map.uM * 1.45 : map.u;
  const svg = useRef(null);
  const box = useRef(null);
  const route = useRef(null);
  const [phase, setPhase] = useState("idle"); // idle → zoom → draw → done
  const [shown, setShown] = useState(0);
  const [vb, setVb] = useState([0, 0, w, h]);
  const [run, setRun] = useState(0);
  const [pos, setPos] = useState(null);

  const pts = [start ? { x: start.x, y: start.y } : null, ...stops].filter(Boolean);
  const d = routeD(pts);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finish = () => { setVb(zoom); setShown(stops.length); setPhase("done"); if (route.current) route.current.style.strokeDashoffset = 0; };
    if (reduce) { finish(); return; }
    let raf, cancelled = false, started = false;
    const go = () => {
      if (started) return; started = true;
      setPhase("zoom"); setShown(0); setVb([0, 0, w, h]);
      const len = route.current?.getTotalLength() || 1;
      if (route.current) { route.current.style.strokeDasharray = len; route.current.style.strokeDashoffset = len; }
      const T0 = performance.now() + 500, TZ = 2200, TD = 2600;
      const from = [0, 0, w, h];
      const cx0 = from[0] + from[2] / 2, cy0 = from[1] + from[3] / 2, cx1 = zoom[0] + zoom[2] / 2, cy1 = zoom[1] + zoom[3] / 2;
      const step = (now) => {
        if (cancelled) return;
        const t = Math.min(1, Math.max(0, (now - T0) / TZ));
        if (t < 1) {
          const e = ease(t);
          const ww = from[2] * Math.pow(zoom[2] / from[2], e); // 배율은 기하적으로
          const asp = from[2] / from[3] + (zoom[2] / zoom[3] - from[2] / from[3]) * e;
          const hh = ww / asp;
          const cx = cx0 + (cx1 - cx0) * e, cy = cy0 + (cy1 - cy0) * e;
          setVb([cx - ww / 2, cy - hh / 2, ww, hh]);
          raf = requestAnimationFrame(step); return;
        }
        setVb(zoom); setPhase("draw");
        const t2 = Math.min(1, (now - T0 - TZ) / TD);
        if (route.current) route.current.style.strokeDashoffset = len * (1 - ease(t2));
        setShown(Math.min(stops.length, Math.floor(t2 * (stops.length + 0.6))));
        if (t2 < 1) { raf = requestAnimationFrame(step); return; }
        setShown(stops.length); setPhase("done");
      };
      raf = requestAnimationFrame(step);
    };
    const io = new IntersectionObserver((es) => es.some((e) => e.isIntersecting) && go(), { threshold: 0.35 });
    if (box.current) io.observe(box.current);
    return () => { cancelled = true; cancelAnimationFrame(raf); io.disconnect(); };
  }, [run, small]); // eslint-disable-line react-hooks/exhaustive-deps

  // 선택한 핀 위에 카드 위치 계산
  useEffect(() => {
    const s = stops.find((x) => x.id === active);
    if (!s || !svg.current || !box.current || phase !== "done") { setPos(null); return; }
    const place = () => {
      const p = svg.current.createSVGPoint(); p.x = s.x; p.y = s.y;
      const sp = p.matrixTransform(svg.current.getScreenCTM());
      const r = box.current.getBoundingClientRect();
      setPos({ x: sp.x - r.left, y: sp.y - r.top, W: r.width });
    };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [active, phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const cur = stops.find((x) => x.id === active);
  const zoomed = phase === "draw" || phase === "done";
  const r = u * 1.45;

  return (
    <div className={`tripmap ${zoomed ? "z" : ""}`} ref={box}>
      <svg ref={svg} viewBox={vb.join(" ")} preserveAspectRatio="xMidYMid meet" role="img" aria-label="여행 경로 지도">
        <rect x={-w} y={-h} width={w * 3} height={h * 3} fill="#a8d5e8" />
        <image href={img} x="0" y="0" width={w} height={h} />
        <g className="tm-labels" style={{ opacity: zoomed ? 1 : 0 }}>
          {labels.map((l) => (
            <text key={l.t} x={l.x} y={l.y} className={l.k} fontSize={l.k === "sea" ? u * 1.7 : u * 2.6}>{l.t}</text>
          ))}
        </g>
        <path ref={route} d={d} className="tm-route" strokeWidth={u * 0.42} />
        <path d={d} className="tm-route-dash" strokeWidth={u * 0.16} strokeDasharray={`${u * 0.3} ${u * 0.75}`} style={{ opacity: phase === "done" ? 1 : 0 }} />
        {start && zoomed && (
          <g className="tm-start">
            <circle cx={start.x} cy={start.y} r={r * 1.55} />
          </g>
        )}
        {stops.map((s, i) => (
          <g key={s.id} className={`tm-pin ${i < shown ? "in" : ""} ${active === s.id ? "on" : ""}`}
            transform={`translate(${s.x} ${s.y})`}
            onMouseEnter={() => setActive(s.id)} onClick={() => setActive(s.id)}
            tabIndex={i < shown ? 0 : -1} role="button" aria-label={`${s.n}편 ${s.place || s.title}`}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setActive(s.id)}>
            <g className="pop">
              <circle r={r * 1.9} className="halo" />
              <circle r={r} className="dot" />
              <text y={r * 0.36} fontSize={r * 1.05}>{s.n}</text>
            </g>
          </g>
        ))}
      </svg>

      {phase !== "done" && phase !== "idle" ? null : phase === "done" && (
        <button className="tm-replay" onClick={() => { setActive(null); setRun((x) => x + 1); }}>세계지도에서 다시 보기</button>
      )}
      {phase === "idle" && <div className="tm-hint">지도를 펼치는 중</div>}

      {cur && pos && (
        <Link href={cur.href} className={`tm-card ${pos.y < 170 ? "below" : ""}`}
          style={{ left: Math.min(Math.max(pos.x, 130), pos.W - 130), top: pos.y }}>
          {cur.thumb && <img src={cur.thumb} alt="" />}
          <span className="tm-cardbody">
            <small>{cur.n}편 · {cur.place}</small>
            <b>{cur.title}</b>
            <i>글 읽기 →</i>
          </span>
        </Link>
      )}
    </div>
  );
}
