"use client";
import Link from "next/link";
import { useState } from "react";
import { SETTLE_CATS, settleCat } from "../lib/settle-cats";

export default function SettleBrowser({ items }) {
  const [tab, setTab] = useState("all");
  const cats = SETTLE_CATS.filter((c) => items.some((i) => i.category === c.key));
  const list = items.filter((i) => tab === "all" || i.category === tab);

  if (items.length === 0) {
    return <div className="panel t-text"><h3>준비 중</h3><p className="muted">정확한 확인을 마친 안내부터 차례로 올라옵니다.</p></div>;
  }
  return (
    <div>
      <div className="tabs big">
        <button className={tab === "all" ? "on" : ""} onClick={() => setTab("all")}>전체</button>
        {cats.map((c) => (
          <button key={c.key} className={tab === c.key ? "on" : ""} onClick={() => setTab(c.key)}>
            <b className="dot" style={{ background: c.hue }} />{c.name}
          </button>
        ))}
      </div>
      <div className="pgrid">
        {list.map((i) => {
          const c = settleCat(i.category);
          return (
            <Link key={i.id} href={`/settle/${i.id}`} className="card scard" style={{ "--hue": c.hue, "--tint": c.tint }}>
              <div className="stop"><span>{c.name}</span><span>{i.sub}</span></div>
              <div className="sbody">
                <div className="ptitle">{i.title}</div>
                <p className="psum">{i.summary}</p>
                <div className="pdate">확인 {i.verified}</div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
