"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BLOG, metaOf } from "../lib/blog";
import { bg, Poster, SeriesCard, collapseSeries } from "./PostArt";
export { bg, Poster };



export function PostCard({ x }) {
  const m = metaOf(x.slug);
  const has = x.cover || x.video;
  return (
    <Link href={`/blog/p/${x.id}`} className="card pcard" style={{ "--hue": m.hue, "--tint": m.tint }}>
      <div className={`pthumb${has ? "" : " none"}`} style={has ? { backgroundImage: bg(x) } : undefined}>
        {!has && <Poster x={x} m={m} />}
      </div>
      <div className="pbody">
        <div className="ptag">{m.name}{x.series ? ` · ${x.series}${x.part ? ` ${x.part}편` : ""}` : ""}{x.author ? ` · ${x.author}` : ""}</div>
        <div className="ptitle">{x.title}</div>
        {x.subtitle && <div className="psub">{x.subtitle}</div>}
        {x.summary && <p className="psum">{x.summary}</p>}
        {(x.topics?.length > 0 || x.tags?.length > 0) && <div className="ptags">{[...(x.topics || []), ...(x.tags || [])].slice(0, 4).map((t) => <span key={t}>{t}</span>)}</div>}
        <div className="pdate">{x.created}{x.pinned && x.pinned !== x.created ? ` · ${x.pinned}` : ""}</div>
      </div>
    </Link>
  );
}

const norm = (s) => (s || "").toLowerCase().replace(/\s+/g, "");
const KEYS = ["cat", "topic", "series", "tag", "bible", "q"];

export default function BlogBrowser({ posts }) {
  const [f, setF] = useState({ cat: "all", topic: "", series: "", tag: "", bible: "", q: "" });
  const [more, setMore] = useState(false);

  // 주소의 ?topic= 등으로 바로 들어올 수 있게
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const init = {};
    KEYS.forEach((k) => { if (sp.get(k)) init[k] = sp.get(k); });
    if (Object.keys(init).length) {
      setF((o) => ({ ...o, ...init }));
      if (init.tag || init.bible) setMore(true);
      document.getElementById("archive")?.scrollIntoView({ block: "start" });
    }
  }, []);
  useEffect(() => {
    const sp = new URLSearchParams();
    KEYS.forEach((k) => { if (f[k] && f[k] !== "all") sp.set(k, f[k]); });
    const q = sp.toString();
    window.history.replaceState(null, "", q ? `?${q}#archive` : window.location.pathname);
  }, [f]);

  const set = (k, v) => setF((o) => ({ ...o, [k]: o[k] === v ? (k === "cat" ? "all" : "") : v }));
  const inCat = posts.filter((p) => f.cat === "all" || p.slug === f.cat);
  const topics = [...new Set(posts.flatMap((p) => p.topics || []))];
  const seriesList = [...new Set(inCat.map((p) => p.series).filter(Boolean))];
  const tagList = [...new Set(inCat.flatMap((p) => [...p.types, ...p.tags]))];
  const bibleList = [...new Set(inCat.flatMap((p) => p.bibles || []))];

  const list = useMemo(() => {
    const words = f.q.trim().split(/\s+/).filter(Boolean).map(norm);
    return inCat.filter((p) =>
      (!f.topic || p.topics?.includes(f.topic)) &&
      (!f.series || p.series === f.series) &&
      (!f.tag || p.types.includes(f.tag) || p.tags.includes(f.tag)) &&
      (!f.bible || p.bibles?.includes(f.bible)) &&
      (words.length === 0 || words.every((w) => norm([p.title, p.subtitle, p.summary, p.series, p.author, ...(p.topics || []), ...p.tags, ...p.types, ...(p.bibles || [])].join(" ")).includes(w)))
    );
  }, [posts, f]);

  const active = ["topic", "series", "tag", "bible", "q"].filter((k) => f[k]);
  const clear = () => setF({ cat: f.cat, topic: "", series: "", tag: "", bible: "", q: "" });

  return (
    <div className="bbrowse">
      <div className="bsearch">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
        <input value={f.q} onChange={(e) => setF((o) => ({ ...o, q: e.target.value }))} placeholder="블로그에서 찾기 — 제목, 주제, 성경, 저자, 태그" aria-label="블로그 검색" />
        {f.q && <button onClick={() => setF((o) => ({ ...o, q: "" }))} aria-label="지우기">×</button>}
      </div>

      <div className="tabs big">
        <button className={f.cat === "all" ? "on" : ""} onClick={() => setF((o) => ({ ...o, cat: "all" }))}>전체</button>
        {BLOG.map((b) => (
          <button key={b.slug} className={f.cat === b.slug ? "on" : ""} onClick={() => setF((o) => ({ ...o, cat: b.slug }))}>
            <b className="dot" style={{ background: b.hue }} />{b.name}
          </button>
        ))}
      </div>

      {(topics.length > 0 || seriesList.length > 0) && (
        <div className="frow">
          {topics.length > 0 && <span className="flabel">주제</span>}
          {topics.map((t) => <button key={t} className={`chip${f.topic === t ? " on" : ""}`} onClick={() => set("topic", t)}>{t}</button>)}
          {seriesList.length > 0 && <span className="flabel">연재</span>}
          {seriesList.map((t) => <button key={t} className={`chip series${f.series === t ? " on" : ""}`} onClick={() => set("series", t)}>{t}</button>)}
          {(tagList.length > 0 || bibleList.length > 0) && <button className="chip ghost" onClick={() => setMore(!more)}>{more ? "접기" : "태그·성경 더 보기"}</button>}
        </div>
      )}
      {more && (
        <div className="frow sub">
          {bibleList.length > 0 && <span className="flabel">성경</span>}
          {bibleList.map((t) => <button key={t} className={`chip${f.bible === t ? " on" : ""}`} onClick={() => set("bible", t)}>{t}</button>)}
          {tagList.length > 0 && <span className="flabel">태그</span>}
          {tagList.map((t) => <button key={t} className={`chip${f.tag === t ? " on" : ""}`} onClick={() => set("tag", t)}>#{t}</button>)}
        </div>
      )}

      {active.length > 0 && (
        <div className="fstate">
          <span>{list.length}개의 글</span>
          {active.map((k) => <button key={k} onClick={() => setF((o) => ({ ...o, [k]: "" }))}>{k === "q" ? `"${f.q}"` : k === "tag" ? `#${f[k]}` : f[k]} ×</button>)}
          <button className="clear" onClick={clear}>모두 지우기</button>
        </div>
      )}

      {f.cat === "recitation" && (
        <Link href="/blog/recitation" className="btn primary" style={{ marginBottom: 14, display: "inline-block" }}>새김D6 말씀 카드 전체 보기 →</Link>
      )}
      {list.length === 0
        ? <div className="panel t-text"><h3>{active.length ? "찾는 글이 없습니다" : "준비 중"}</h3><p className="muted">{active.length ? "다른 낱말이나 주제로 찾아보세요." : "아직 올라온 글이 없습니다."}</p></div>
        : <div className="pgrid">{(f.series || f.q ? list.map((x) => ({ post: x })) : collapseSeries(list)).map((it) =>
            it.post ? <PostCard key={it.post.id} x={it.post} /> : <SeriesCard key={it.series.name} s={it.series} m={metaOf(it.series.slug)} />)}</div>}
    </div>
  );
}
