"use client";
import Link from "next/link";
import { useState } from "react";
import { BLOG, metaOf } from "../lib/blog";

export function bg(x) {
  const l = [];
  if (x.cover) l.push(`url(/api/cover/${x.id})`);
  if (x.video) l.push(`url(https://img.youtube.com/vi/${x.video}/maxresdefault.jpg)`, `url(https://img.youtube.com/vi/${x.video}/mqdefault.jpg)`);
  return l.join(", ");
}

export function PostCard({ x }) {
  const m = metaOf(x.slug);
  const has = x.cover || x.video;
  return (
    <Link href={`/blog/p/${x.id}`} className="card pcard" style={{ "--hue": m.hue, "--tint": m.tint }}>
      <div className={`pthumb${has ? "" : " none"}`} style={has ? { backgroundImage: bg(x) } : undefined}>
        {!has && <span>{m.en}</span>}
      </div>
      <div className="pbody">
        <div className="ptag">{m.name}</div>
        <div className="ptitle">{x.title}</div>
        {x.summary && <p className="psum">{x.summary}</p>}
        <div className="pdate">{x.created}{x.pinned && x.pinned !== x.created ? ` · ${x.pinned}` : ""}</div>
      </div>
    </Link>
  );
}

export default function BlogBrowser({ posts }) {
  const [tab, setTab] = useState("all");
  const list = posts.filter((p) => tab === "all" || p.slug === tab);
  return (
    <div>
      <div className="tabs big">
        <button className={tab === "all" ? "on" : ""} onClick={() => setTab("all")}>전체</button>
        {BLOG.map((b) => (
          <button key={b.slug} className={tab === b.slug ? "on" : ""} onClick={() => setTab(b.slug)}>
            <b className="dot" style={{ background: b.hue }} />{b.name}
          </button>
        ))}
      </div>
      {tab === "recitation" && (
        <Link href="/blog/recitation" className="btn primary" style={{ marginBottom: 14, display: "inline-block" }}>새김D6 말씀 카드 전체 보기 →</Link>
      )}
      {list.length === 0
        ? <div className="panel t-text"><h3>준비 중</h3><p className="muted">아직 올라온 글이 없습니다.</p></div>
        : <div className="pgrid">{list.map((x) => <PostCard key={x.id} x={x} />)}</div>}
    </div>
  );
}
