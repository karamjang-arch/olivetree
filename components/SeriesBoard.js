"use client";
// 최근 글 자리의 연재 스택: 누르면 연재 전체가 보드처럼 펼쳐진다
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Poster, bg } from "./PostArt";
import { partName, partMark, mainCount } from "../lib/part";

export default function SeriesBoard({ s, m, covers = {} }) {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const stackRef = useRef(null);
  const top = [...s.parts].sort((a, b) => b.created.localeCompare(a.created) || (b.part ?? 0) - (a.part ?? 0))[0];
  const has = top.cover || top.video;
  const vars = { "--hue": m.hue, "--tint": m.tint };

  const close = () => {
    setClosing(true);
    setTimeout(() => { setOpen(false); setClosing(false); stackRef.current?.focus(); }, 260);
  };

  return (
    <>
      <div
        ref={stackRef}
        role="button"
        tabIndex={0}
        aria-haspopup="dialog"
        aria-label={`${s.name} 전체 보기`}
        className="card pcard scardstack sboard-open"
        style={vars}
        onClick={() => setOpen(true)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen(true); } }}
      >
        <div className={`pthumb${has ? "" : " none"}`} style={has ? { backgroundImage: bg(top) } : undefined}>
          {!has && <Poster x={top} m={m} />}
          <span className="sbadge">새 글 · {top.partLabel || `${top.part} / ${mainCount(s.parts)}`}</span>
        </div>
        <div className="pbody">
          <div className="ptag">{m.name} · {s.name}</div>
          <div className="ptitle">{top.title}</div>
          {top.subtitle && <div className="psub">{top.subtitle}</div>}
          <ol className="slist">
            {s.parts.map((x) => <li key={x.id} className={x.id === top.id ? "on" : ""}><b>{partMark(x)}</b>{x.title}</li>)}
          </ol>
          <div className="pdate sboard-cta">전체 {s.parts.length}편 펼쳐 보기 <span aria-hidden="true">→</span></div>
        </div>
      </div>
      {open && <Board s={s} m={m} covers={covers} topId={top.id} from={stackRef} closing={closing} onClose={close} />}
    </>
  );
}

function Board({ s, m, covers, topId, from, closing, onClose }) {
  const gridRef = useRef(null);
  const [ready, setReady] = useState(false);

  // 스택 자리에서 카드들이 펼쳐져 나오도록: 각 카드를 스택 위치에서 출발시킨다
  useLayoutEffect(() => {
    const grid = gridRef.current, src = from.current;
    if (!grid || !src) { setReady(true); return; }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const r = src.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + Math.min(r.height, 420) / 2;
    grid.querySelectorAll(".sb-card").forEach((el, i) => {
      if (reduce) return;
      const c = el.getBoundingClientRect();
      const dx = cx - (c.left + c.width / 2), dy = cy - (c.top + c.height / 2);
      el.style.setProperty("--fx", `${dx}px`);
      el.style.setProperty("--fy", `${dy}px`);
      el.style.setProperty("--d", `${Math.min(i, 18) * 32}ms`);
      el.style.setProperty("--r", `${((i % 5) - 2) * 2.5}deg`);
    });
    requestAnimationFrame(() => requestAnimationFrame(() => setReady(true)));
  }, [from]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, [onClose]);

  const intro = s.intro;
  const list = intro ? [intro, ...s.parts] : s.parts;

  return createPortal(
    <div className={`sboard${ready ? " in" : ""}${closing ? " out" : ""}`} style={{ "--hue": m.hue, "--tint": m.tint }} role="dialog" aria-modal="true" aria-label={s.name} onClick={onClose}>
      <div className="sb-panel" onClick={(e) => e.stopPropagation()}>
        <header className="sb-head">
          <div>
            <div className="sb-kicker">{m.name} · 연재</div>
            <h2 className="sb-title serif">{s.name}</h2>
            <div className="sb-meta">본편 {mainCount(s.parts)}편 · 함께 읽는 글 {list.length - mainCount(s.parts)}편</div>
          </div>
          <button type="button" className="sb-close" onClick={onClose} aria-label="닫기">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </header>
        <div className="sb-grid" ref={gridRef}>
          {list.map((x) => {
            const img = covers[x.id];
            const art = img ? { backgroundImage: `url(${img})` } : (x.cover || x.video) ? { backgroundImage: bg(x) } : null;
            return (
              <a key={x.id} href={`/blog/p/${x.id}`} className={`sb-card${x.id === topId ? " new" : ""}`}>
                <div className={`sb-art${art ? "" : " none"}`} style={art || undefined}>
                  {!art && <Poster x={x} m={m} />}
                  <span className="sb-no">{x.part === 0 ? "여는 글" : partName(x)}</span>
                  {x.id === topId && <span className="sb-new">새 글</span>}
                </div>
                <div className="sb-body">
                  <div className="sb-q">{x.title}</div>
                  {x.summary && <p className="sb-sum">{x.summary}</p>}
                  <div className="sb-foot"><span>{x.created}</span><span className="sb-go" aria-hidden="true">읽기 →</span></div>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </div>,
    document.body
  );
}
