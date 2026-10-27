"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { CATS, catOf, colorOf } from "../lib/cats";
import { refOrder } from "../lib/bible";

const TABS = [["all", "전체"], ["dawn", "새벽"], ["sunday", "주일"], ["friday", "금요"], ["special", "특별"]];
const PAGE = 40;

export default function SermonBrowser({ sermons }) {
  const [tab, setTab] = useState("all");
  const [book, setBook] = useState("");
  const [sort, setSort] = useState("new");
  const [shown, setShown] = useState(PAGE);

  const books = useMemo(
    () => [...new Set(sermons.map((s) => s.bible).filter(Boolean))].sort((a, b) => refOrder(a) - refOrder(b)),
    [sermons]
  );
  const list = useMemo(() => {
    const f = sermons.filter((s) => (tab === "all" || catOf(s.kind) === tab) && (!book || s.bible === book));
    return f.sort((a, b) => (sort === "new" ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date)));
  }, [sermons, tab, book, sort]);

  const reset = (fn) => (v) => { fn(v); setShown(PAGE); };

  return (
    <div className="sb">
      <div className="tabs big">
        {TABS.map(([k, l]) => (
          <button key={k} className={tab === k ? "on" : ""} onClick={() => reset(setTab)(k)}>
            {k !== "all" && <b className="dot" style={{ background: colorOf(k) }} />}{l}
          </button>
        ))}
      </div>
      <div className="sb-tools">
        <select value={book} onChange={(e) => reset(setBook)(e.target.value)} aria-label="성경별">
          <option value="">성경 전체</option>
          {books.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
        <select value={sort} onChange={(e) => reset(setSort)(e.target.value)} aria-label="정렬">
          <option value="new">최신순</option>
          <option value="old">오래된순</option>
        </select>
        <span className="count">{list.length}편</span>
      </div>
      <div className="rows">
        {list.slice(0, shown).map((s) => (
          <Link key={s.id} href={`/sermon/${s.id}`} className="row">
            <span className="rd">{s.date}</span>
            <span className="rtitle"><b className="dot" style={{ background: colorOf(catOf(s.kind)) }} />{s.title}</span>
            <span className="rp">{s.passage}</span>
          </Link>
        ))}
        {list.length === 0 && <div className="row empty">조건에 맞는 설교가 없습니다.</div>}
      </div>
      {shown < list.length && (
        <button className="btn more-btn" onClick={() => setShown(shown + PAGE)}>더 보기 ({list.length - shown}편 남음)</button>
      )}
    </div>
  );
}
