"use client";
import Link from "next/link";
import { useState } from "react";

const FILTERS = [["all", "전체"], ["honey", "꿀보다성경"], ["sermon", "설교"]];

export default function Calendar({ events, today, selected }) {
  const base = (selected || today).split("-").map(Number);
  const [ym, setYm] = useState({ y: base[0], m: base[1] });
  const [filter, setFilter] = useState("all");

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
      <div className="tabs">
        {FILTERS.map(([k, l]) => (
          <button key={k} className={filter === k ? "on" : ""} onClick={() => setFilter(k)}>{l}</button>
        ))}
      </div>
      <div className="cal-grid">
        {["일", "월", "화", "수", "목", "금", "토"].map((w) => <div key={w} className="dow">{w}</div>)}
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const k = key(d);
          const ev = (events[k] || []).filter((e) => filter === "all" || e === filter);
          return (
            <Link key={i} href={k === today ? "/" : `/d/${k}`} className={`day${k === today ? " today" : ""}${k === selected ? " sel" : ""}`}>
              <span>{d}</span>
              <i>{ev.includes("honey") && <b className="dot h" />}{ev.includes("sermon") && <b className="dot s" />}</i>
            </Link>
          );
        })}
      </div>
      <div className="legend"><span><b className="dot h" /> 꿀보다성경</span><span><b className="dot s" /> 설교</span></div>
    </div>
  );
}
