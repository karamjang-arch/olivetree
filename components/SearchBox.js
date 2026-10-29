"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

const HUE = { 설교: "#c08a3e", 통독: "#6f9a6a", 암송: "#b5524a", 특강: "#2c4f7a", 강의: "#2c4f7a", 배움: "#2f7a78", "올리브 가족": "#4f9a6a", 도서: "#6a5a9a", 저널: "#a8893a", 가스펠: "#173b63", 정착: "#3f7f5a" };

export default function SearchBox({ initial = "" }) {
  const [q, setQ] = useState(initial);
  const [res, setRes] = useState(null);
  const [kind, setKind] = useState("전체");

  useEffect(() => {
    const t = q.trim();
    if (!t) { setRes(null); return; }
    const id = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(t)}`).then((r) => r.json()).then((j) => setRes(j.results || [])).catch(() => setRes([]));
      try { history.replaceState(null, "", `/search?q=${encodeURIComponent(t)}`); } catch {}
    }, 250);
    return () => clearTimeout(id);
  }, [q]);

  const kinds = res ? ["전체", ...new Set(res.map((r) => r.kind))] : [];
  const list = res ? res.filter((r) => kind === "전체" || r.kind === kind) : [];

  return (
    <div className="sbox">
      <div className="sinput">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
        <input autoFocus value={q} onChange={(e) => { setQ(e.target.value); setKind("전체"); }} placeholder="말씀, 제목, 태그, 저자…" aria-label="검색" />
      </div>
      {res && kinds.length > 2 && (
        <div className="tabs big">
          {kinds.map((k) => <button key={k} className={kind === k ? "on" : ""} onClick={() => setKind(k)}>{k}</button>)}
        </div>
      )}
      {res && <div className="scount">{list.length}건</div>}
      <div className="rows">
        {list.map((r, i) => (
          <Link key={r.href + i} href={r.href} className="row srow">
            <span className="stag" style={{ color: HUE[r.kind] || "#557565", background: (HUE[r.kind] || "#557565") + "1f" }}>{r.kind}</span>
            <span className="stitle">{r.title}</span>
            {r.sub && <span className="ssub">{r.sub}</span>}
          </Link>
        ))}
        {res && list.length === 0 && <div className="row empty">검색 결과가 없습니다.</div>}
      </div>
    </div>
  );
}
