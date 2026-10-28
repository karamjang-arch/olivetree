"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import BookCover from "./BookCover";

export function BookCard({ b }) {
  return (
    <Link href={`/library/${b.id}`} className="bookcard">
      <BookCover b={b} />
      <div className="bk-meta">
        <div className="bk-title">{b.title}</div>
        <div className="bk-author">{b.author}{b.translator ? ` · ${b.translator} 옮김` : ""}</div>
        {b.line && <p className="bk-line">{b.line}</p>}
        <div className="bk-chips">{[b.kind, b.level].filter(Boolean).map((t) => <span key={t}>{t}</span>)}</div>
      </div>
    </Link>
  );
}

const norm = (s) => (s || "").toLowerCase().replace(/\s+/g, "");

export default function LibraryBrowser({ books }) {
  const [q, setQ] = useState("");
  const [f, setF] = useState({ kind: "", who: "", level: "", topic: "" });
  const opts = {
    kind: [...new Set(books.map((b) => b.kind).filter(Boolean))],
    who: [...new Set(books.flatMap((b) => b.who))],
    level: ["입문", "중급", "심화"].filter((l) => books.some((b) => b.level === l)),
    topic: [...new Set(books.flatMap((b) => b.topics))],
  };
  const LABEL = { kind: "분류", who: "대상", level: "난이도", topic: "주제" };
  const list = useMemo(() => {
    const ws = q.trim().split(/\s+/).filter(Boolean).map(norm);
    return books.filter((b) =>
      (!f.kind || b.kind === f.kind) && (!f.who || b.who.includes(f.who)) && (!f.level || b.level === f.level) && (!f.topic || b.topics.includes(f.topic)) &&
      (ws.length === 0 || ws.every((w) => norm([b.title, b.original, b.author, b.translator, b.publisher, b.line, b.kind, ...b.who, ...b.topics].join(" ")).includes(w))));
  }, [books, q, f]);
  const tog = (k, v) => setF((o) => ({ ...o, [k]: o[k] === v ? "" : v }));
  return (
    <div>
      <div className="bsearch">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="서재에서 찾기 — 제목, 저자, 주제" aria-label="서재 검색" />
        {q && <button onClick={() => setQ("")} aria-label="지우기">×</button>}
      </div>
      {Object.keys(opts).map((k) => opts[k].length > 1 && (
        <div key={k} className="frow">
          <span className="flabel">{LABEL[k]}</span>
          {opts[k].map((v) => <button key={v} className={`chip${f[k] === v ? " on" : ""}`} onClick={() => tog(k, v)}>{v}</button>)}
        </div>
      ))}
      {list.length === 0
        ? <div className="panel t-text"><h3>찾는 책이 없습니다</h3><p className="muted">다른 낱말이나 조건으로 찾아보세요.</p></div>
        : <div className="shelf">{list.map((b) => <BookCard key={b.id} b={b} />)}</div>}
    </div>
  );
}
