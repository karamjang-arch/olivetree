"use client";
import Link from "next/link";
import { useState } from "react";

const FILTERS = [["all", "전체"], ["honey", "꿀보다성경"], ["sermon", "설교"]];

// mode: "all"(필터 탭 표시) | "honey" | "sermon" (해당 종류만 표시)
// links: { "YYYY-MM-DD": href } 가 있으면 그 날짜만 눌러서 이동
export default function Calendar({ events, today, selected, mode = "all", links }) {
  const base = (selected || today).split("-").map(Number);
  const [ym, setYm] = useState({ y: base[0], m: base[1] });
  const [tab, setTab] = useState("all");
  const filter = mode === "all" ? tab : mode;

  const first = new Date(Date.UTC(ym.y, ym.m - 1, 1)).getUTCDay();
  const days = new Date(Date.UTC(ym.y, ym.m, 0)).getUTCDate();
  const cells = [...Array(first).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  const key = (d) => `${ym.y}-${String(ym.m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  const move = (n) => {
    const t = new Date(Date.UTC(ym.y, ym.m - 1 + n, 1));
    setYm({ y: t.getUTCFullYear(), m: t.getUTCMonth() + 1 });
  };

  return (
    <div className="cal">
      <div className="cal-head">
        <button onClick={() => move(-1)} aria-label="이전 달">‹</button>
        <strong className="serif">{ym.y}년 {ym.m}월</strong>
        <button onClick={() => move(1)} aria-label="다음 달">›</button>
      </div>
      {mode === "all" && (
        <div className="tabs">
          {FILTERS.map(([k, l]) => (
            <button key={k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>{l}</button>
          ))}
        </div>
      )}
      <div className="cal-grid">
        {["일", "월", "화", "수", "목", "금", "토"].map((w) => <div key={w} className="dow">{w}</div>)}
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const k = key(d);
          const ev = (events[k] || []).filter((e) => filter === "all" || e === filter);
          const cls = `day${k === today ? " today" : ""}${k === selected ? " sel" : ""}`;
          const inner = (
            <>
              <span>{d}</span>
              <i>{ev.includes("honey") && <b className="dot h" />}{ev.includes("sermon") && <b className="dot s" />}</i>
            </>
          );
          const href = links ? links[k] : k === today ? "/" : `/d/${k}`;
          return href && (links ? ev.length > 0 : true)
            ? <Link key={i} href={href} className={cls}>{inner}</Link>
            : <div key={i} className={`${cls} off`}>{inner}</div>;
        })}
      </div>
      <div className="legend">
        {filter !== "sermon" && <span><b className="dot h" /> 꿀보다성경</span>}
        {filter !== "honey" && <span><b className="dot s" /> 설교</span>}
      </div>
    </div>
  );
}
