"use client";
import { useEffect, useState } from "react";

const when = (iso) => (iso ? new Date(iso).toLocaleDateString("ko-KR", { month: "long", day: "numeric", timeZone: "America/Indianapolis" }) : "");

// target: "honey:2026-10-27" | "blog:<id>" | "sermon:<id>"
export default function Comments({ target, label, prompt = "" }) {
  const [list, setList] = useState(null);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [all, setAll] = useState(false);

  useEffect(() => {
    try { setName(localStorage.getItem("ot-name") || ""); } catch {}
    fetch(`/api/comments?target=${encodeURIComponent(target)}`).then((r) => r.json()).then((j) => setList(j.comments || [])).catch(() => setList([]));
  }, [target]);

  async function send(e) {
    e.preventDefault();
    setErr("");
    if (!name.trim()) return setErr("이름(실명)을 적어 주세요.");
    if (!text.trim()) return setErr("내용을 적어 주세요.");
    setBusy(true);
    try {
      const r = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, text, target, label, website: e.target.website.value }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "저장하지 못했습니다.");
      try { localStorage.setItem("ot-name", name.trim()); } catch {}
      if (j.comment) setList((l) => [...(l || []), j.comment]);
      setText("");
    } catch (x) {
      setErr(x.message);
    }
    setBusy(false);
  }

  const shown = list ? (all ? list : list.slice(-5)) : [];
  return (
    <div className="comments">
      <div className="clist">
        {list === null && <p className="muted tiny">불러오는 중…</p>}
        {list && list.length === 0 && <p className="muted tiny">첫 한마디를 남겨 보세요.</p>}
        {list && list.length > 5 && !all && <button type="button" className="cmore" onClick={() => setAll(true)}>이전 댓글 {list.length - 5}개 더 보기</button>}
        {shown.map((c) => (
          <div key={c.id} className="cm">
            <b>{c.name}</b>
            <span className="ct">{c.text}</span>
            <i>{when(c.at)}</i>
          </div>
        ))}
      </div>
      <form onSubmit={send} className="cform">
        <input name="website" tabIndex={-1} autoComplete="off" className="hp" aria-hidden="true" />
        <div className="crow">
          <input className="cname" value={name} onChange={(e) => setName(e.target.value)} maxLength={30} placeholder="이름(실명)" aria-label="이름" />
          <input className="ctext" value={text} onChange={(e) => setText(e.target.value)} maxLength={600} placeholder={prompt} aria-label="댓글" />
          <button className="csend" disabled={busy} aria-label="남기기">{busy ? "…" : "남기기"}</button>
        </div>
        <div className="cnote">실명을 적어 주세요. 이름이 없거나 부적절한 댓글은 삭제될 수 있습니다.</div>
        {err && <div className="cerr">{err}</div>}
      </form>
    </div>
  );
}
