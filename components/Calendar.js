"use client";
import Link from "next/link";
import { useState } from "react";
import { CATS, HONEY_COLOR, colorOf } from "../lib/cats";

const BLOG_KEYS = ["recitation", "lecture", "family", "book", "journal"];
const SERMON_KEYS = ["dawn", "sunday", "friday", "special", "etc"];
const TABS = {
  all: [["all", "전체"], ["honey", "꿀보다성경"], ["dawn", "새벽"], ["sunday", "주일"], ["friday", "금요"], ["special", "특별"]],
  sermon: [["all", "전체"], ["dawn", "새벽"], ["sunday", "주일"], ["friday", "금요"], ["special", "특별"]],
  honey: [],
  blog: [["all", "전체"], ["recitation", "암송"], ["lecture", "특강"], ["family", "올리브 가족"], ["book", "도서"], ["journal", "저널"]],
};

// mode: "all" | "sermon" | "honey" — 보여줄 종류의 범위
// links: { "YYYY-MM-DD": href } 가 있으면 그 날짜만 눌러서 이동
export default function Calendar({ events, today, selected, mode = "all", links }) {
  const base = (selected || today).split("-").map(Number);
  const [ym, setYm] = useState({ y: base[0], m: base[1] });
  const [tab, setTab] = useState("all");

  const allowed = mode === "honey" ? ["honey"] : mode === "sermon" ? SERMON_KEYS : mode === "blog" ? BLOG_KEYS : ["honey", ...SERMON_KEYS];
  const keep = (k) => { const b = k.replace("~", ""); return allowed.includes(b) && (tab === "all" || b === tab); };

  const first = new Date(Date.UTC(ym.y, ym.m - 1, 1)).getUTCDay();
  const days = new Date(Date.UTC(ym.y, ym.m, 0)).getUTCDate();
  const cells = [...Array(first).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  const key = (d) => `${ym.y}-${String(ym.m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  const move = (n) => {
    const t = new Date(Date.UTC(ym.y, ym.m - 1 + n, 1));
    setYm({ y: t.getUTCFullYear(), m: t.getUTCMonth() + 1 });
  };
  const tabs = TABS[mode];

  return (
    <div className="cal">
      <div className="cal-head">
        <button onClick={() => move(-1)} aria-label="이전 달">‹</button>
        <strong className="serif">{ym.y}년 {ym.m}월</strong>
        <button onClick={() => move(1)} aria-label="다음 달">›</button>
      </div>
      {tabs.length > 0 && (
        <div className="tabs">
          {tabs.map(([k, l]) => (
            <button key={k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>{l}</button>
          ))}
        </div>
      )}
      <div className="cal-grid">
        {["일", "월", "화", "수", "목", "금", "토"].map((w) => <div key={w} className="dow">{w}</div>)}
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const k = key(d);
          const ev = [...new Set((events[k] || []).filter(keep))];
          const cls = `day${k === today ? " today" : ""}${k === selected ? " sel" : ""}`;
          const inner = (
            <>
              <span>{d}</span>
              <i>{ev.map((e) => e.endsWith("~")
                ? <b key={e} className="dot ring" style={{ borderColor: colorOf(e) }} />
                : <b key={e} className="dot" style={{ background: colorOf(e) }} />)}</i>
            </>
          );
          const href = links ? links[k] : k === today ? "/" : `/d/${k}`;
          return href && (links ? ev.length > 0 : true)
            ? <Link key={i} href={href} className={cls}>{inner}</Link>
            : <div key={i} className={`${cls} off`}>{inner}</div>;
        })}
      </div>
      <div className="legend">
        {allowed.map((k) => (
          <span key={k}><b className="dot" style={{ background: colorOf(k) }} /> {k === "honey" ? "꿀보다성경" : CATS[k].label}</span>
        ))}
        {mode === "blog" && <span className="sep"><b className="dot" style={{ background: "#6b7463" }} /> 쓴 날 <b className="dot ring" style={{ borderColor: "#6b7463" }} /> 지정한 날</span>}
      </div>
    </div>
  );
}
