"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BLOG, metaOf } from "../lib/blog";
import { bg, Poster, SeriesCard, collapseSeries } from "./PostArt";
import WorldTrips from "./WorldTrips";
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

export default function BlogBrowser({ posts, decks = [], trips = [] }) {
  const [f, setF] = useState({ cat: "all", topic: "", series: "", tag: "", bible: "", q: "" });
  const [more, setMore] = useState(false);
  const [view, setView] = useState("card"); // card | table
  const [order, setOrder] = useState("new");
  const [page, setPage] = useState(1);
  const [viewer, setViewer] = useState(null); // { x, count, i }
  const PER = 15;
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    let v = sp.get("view");
    if (!v) { try { v = localStorage.getItem("blogView"); } catch {} }
    if (v === "table" || v === "card" || (v === "news" && decks.length)) setView(v);
    // 홈에서 ?card=<id>&i=<장>으로 들어오면 그 카드뉴스를 바로 연다
    const cid = sp.get("card"), d = decks.find((x) => x.id === cid), x = posts.find((y) => y.id === cid);
    if (d && x) { setView("news"); setViewer({ x, count: d.count, i: Math.min(d.count, Math.max(1, Number(sp.get("i")) || 1)) }); }
  }, []);
  const pickView = (v) => { setView(v); try { localStorage.setItem("blogView", v); } catch {} };
  useEffect(() => setPage(1), [f, order, view]);

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

  const deckOf = Object.fromEntries(decks.map((d) => [d.id, d.count]));
  const newsList = list.filter((p) => deckOf[p.id]);
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

      {f.cat === "family" && trips.length > 0 && !active.length && (
        <section className="wt-wrap">
          <div className="wt-head"><b>여정 지도</b><span>우리 가족이 걸어 온 길</span></div>
          <WorldTrips trips={trips} />
        </section>
      )}

      <div className="bviewbar">
        <span className="bcount">{view === "news" ? `카드뉴스 ${newsList.length}편` : `${list.length}개의 글`}</span>
        {view === "table" && (
          <select value={order} onChange={(e) => setOrder(e.target.value)} aria-label="정렬">
            <option value="new">최신순</option>
            <option value="old">오래된순</option>
          </select>
        )}
        <div className="bseg" role="tablist" aria-label="보기 방식">
          <button className={view === "card" ? "on" : ""} onClick={() => pickView("card")} aria-pressed={view === "card"}>
            <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><rect x="1" y="1" width="6" height="6" rx="1.5"/><rect x="9" y="1" width="6" height="6" rx="1.5"/><rect x="1" y="9" width="6" height="6" rx="1.5"/><rect x="9" y="9" width="6" height="6" rx="1.5"/></svg>카드
          </button>
          <button className={view === "table" ? "on" : ""} onClick={() => pickView("table")} aria-pressed={view === "table"}>
            <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><rect x="1" y="2" width="14" height="2.2" rx="1"/><rect x="1" y="6.9" width="14" height="2.2" rx="1"/><rect x="1" y="11.8" width="14" height="2.2" rx="1"/></svg>표
          </button>
          {decks.length > 0 && (
            <button className={view === "news" ? "on" : ""} onClick={() => pickView("news")} aria-pressed={view === "news"}>
              <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><rect x="4" y="1" width="9" height="11" rx="1.5"/><rect x="2" y="3.5" width="9" height="11" rx="1.5" opacity=".55"/></svg>카드뉴스
            </button>
          )}
        </div>
      </div>

      {f.cat === "recitation" && (
        <Link href="/blog/recitation" className="btn primary" style={{ marginBottom: 14, display: "inline-block" }}>새김D6 말씀 카드 전체 보기 →</Link>
      )}
      {view === "news"
        ? (newsList.length === 0
            ? <div className="panel t-text"><h3>카드뉴스가 없습니다</h3><p className="muted">이 조건에 맞는 카드뉴스가 아직 없습니다.</p></div>
            : <div className="cngrid">{newsList.map((x) => (
                <button key={x.id} className="cncover" onClick={() => setViewer({ x, count: deckOf[x.id], i: 1 })}>
                  <img src={`/api/card/${x.id}/1`} alt={x.title} loading="lazy" width={1080} height={1350} />
                  <b>{x.title}</b>
                  <i>{metaOf(x.slug).name} · {x.created.replaceAll("-", ".")} · {deckOf[x.id]}장</i>
                </button>
              ))}</div>)
        : list.length === 0
        ? <div className="panel t-text"><h3>{active.length ? "찾는 글이 없습니다" : "준비 중"}</h3><p className="muted">{active.length ? "다른 낱말이나 주제로 찾아보세요." : "아직 올라온 글이 없습니다."}</p></div>
        : view === "card"
          ? <div className="pgrid">{(f.series || f.q ? list.map((x) => ({ post: x })) : collapseSeries(list)).map((it) =>
              it.post ? <PostCard key={it.post.id} x={it.post} /> : <SeriesCard key={it.series.name} s={it.series} m={metaOf(it.series.slug)} />)}</div>
          : (() => {
              const rows = order === "new" ? list : [...list].reverse();
              const pages = Math.max(1, Math.ceil(rows.length / PER));
              const cur = rows.slice((page - 1) * PER, page * PER);
              return (
                <>
                  <table className="btable">
                    <thead><tr><th className="c-no">번호</th><th className="c-cat">분류</th><th>제목</th><th className="c-src">출처</th><th className="c-date">날짜</th></tr></thead>
                    <tbody>
                      {cur.map((x, i) => {
                        const m = metaOf(x.slug);
                        const no = order === "new" ? list.length - ((page - 1) * PER + i) : (page - 1) * PER + i + 1;
                        return (
                          <tr key={x.id}>
                            <td className="c-no">{no}</td>
                            <td className="c-cat"><button style={{ "--hue": m.hue, "--tint": m.tint }} onClick={() => setF((o) => ({ ...o, cat: x.slug }))}>{m.name}</button></td>
                            <td className="c-title">
                              <Link href={`/blog/p/${x.id}`}>
                                {x.series && <span className="tser">{x.series}{x.part ? ` ${x.part}` : ""}</span>}
                                <b>{x.title}</b>
                              </Link>
                              {x.subtitle && <span className="tsub">{x.subtitle}</span>}
                              <span className="tmeta">{x.author ? `${x.author} · ` : ""}{x.created.replaceAll("-", ".")}</span>
                            </td>
                            <td className="c-src">{x.author || "—"}</td>
                            <td className="c-date">{x.created.replaceAll("-", ".")}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {pages > 1 && (
                    <div className="bpager">
                      <button disabled={page === 1} onClick={() => setPage(page - 1)}>‹</button>
                      {Array.from({ length: pages }, (_, k) => k + 1).map((n) => <button key={n} className={n === page ? "on" : ""} onClick={() => setPage(n)}>{n}</button>)}
                      <button disabled={page === pages} onClick={() => setPage(page + 1)}>›</button>
                    </div>
                  )}
                </>
              );
            })()}
      {viewer && <CardViewer v={viewer} setV={setViewer} />}
    </div>
  );
}

// 카드뉴스 넘겨 보기 (모아 보기 → 카드뉴스 탭)
function CardViewer({ v, setV }) {
  const { x, count, i } = v;
  const go = (d) => setV((o) => ({ ...o, i: Math.min(count, Math.max(1, o.i + d)) }));
  useEffect(() => {
    const k = (e) => { if (e.key === "Escape") setV(null); if (e.key === "ArrowRight") go(1); if (e.key === "ArrowLeft") go(-1); };
    window.addEventListener("keydown", k);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", k); document.body.style.overflow = ""; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const [sx, setSx] = useState(null);
  return (
    <div className="cnview" role="dialog" aria-modal="true" aria-label={x.title} onClick={(e) => e.target === e.currentTarget && setV(null)}>
      <div className="cnv-box">
        <div className="cnv-top">
          <span>{i} / {count}</span>
          <button onClick={() => setV(null)} aria-label="닫기">×</button>
        </div>
        <div className="cnv-stage" onTouchStart={(e) => setSx(e.touches[0].clientX)} onTouchEnd={(e) => { if (sx == null) return; const d = e.changedTouches[0].clientX - sx; if (Math.abs(d) > 40) go(d < 0 ? 1 : -1); setSx(null); }}>
          <button className="cnv-nav prev" onClick={() => go(-1)} disabled={i === 1} aria-label="이전 장">‹</button>
          <img key={i} src={`/api/card/${x.id}/${i}`} alt={`${i} / ${count}`} width={1080} height={1350} />
          {i < count && <link rel="preload" as="image" href={`/api/card/${x.id}/${i + 1}`} />}
          <button className="cnv-nav next" onClick={() => go(1)} disabled={i === count} aria-label="다음 장">›</button>
        </div>
        <div className="cnv-dots">{Array.from({ length: count }, (_, k) => <button key={k} className={k + 1 === i ? "on" : ""} onClick={() => setV((o) => ({ ...o, i: k + 1 }))} aria-label={`${k + 1}장`} />)}</div>
        <div className="cnv-foot">
          <Link href={`/blog/p/${x.id}`} className="btn primary">본문 읽기 →</Link>
          <a href={`/api/card/${x.id}/${i}?dl=1`}>이 장 저장</a>
          <a href={`/api/card/${x.id}/zip`}>전체 ZIP</a>
        </div>
      </div>
    </div>
  );
}
