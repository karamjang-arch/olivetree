// 서버·클라이언트 양쪽에서 쓰는 글 카드 그림 (훅 없음)
export function bg(x) {
  const l = [];
  if (x.cover) l.push(`url(/api/cover/${x.id})`);
  if (x.video) l.push(`url(https://img.youtube.com/vi/${x.video}/maxresdefault.jpg)`, `url(https://img.youtube.com/vi/${x.video}/mqdefault.jpg)`);
  return l.join(", ");
}

// 커버가 없는 글: 글의 물음(부제)을 크게 담은 포스터
export function Poster({ x, m }) {
  const hook = x.subtitle || x.title;
  return (
    <span className="poster">
      <span className="pk">{x.series || m.en}</span>
      {x.series && x.part ? <span className="pn">{x.part}</span> : null}
      <svg className="pleaf" viewBox="0 0 120 120" aria-hidden="true">
        <path d="M10 110 C 40 80, 70 60, 112 14" />
        <path d="M34 86 c -4 -14 2 -26 14 -30 c 2 14 -4 25 -14 30z M54 68 c 12 -6 25 -3 30 8 c -13 4 -24 1 -30 -8z M60 60 c -4 -14 2 -26 14 -30 c 2 14 -4 25 -14 30z M80 42 c 12 -6 25 -3 30 8 c -13 4 -24 1 -30 -8z" />
      </svg>
      <span className="ph">{hook}</span>
      <span className="pf">{m.name}{x.series ? ` · ${x.part ? `${x.part}편` : ""}` : ""}</span>
    </span>
  );
}

// ───────── 연재(시리즈) 묶음 ─────────
const LEAF = (
  <svg className="pleaf" viewBox="0 0 120 120" aria-hidden="true">
    <path d="M10 110 C 40 80, 70 60, 112 14" />
    <path d="M34 86 c -4 -14 2 -26 14 -30 c 2 14 -4 25 -14 30z M54 68 c 12 -6 25 -3 30 8 c -13 4 -24 1 -30 -8z M60 60 c -4 -14 2 -26 14 -30 c 2 14 -4 25 -14 30z M80 42 c 12 -6 25 -3 30 8 c -13 4 -24 1 -30 -8z" />
  </svg>
);

// 글 목록 → 연재별 묶음 (편 순서대로, 0편은 대문)
export function groupSeries(posts) {
  const map = new Map();
  for (const p of posts) {
    if (!p.series) continue;
    if (!map.has(p.series)) map.set(p.series, []);
    map.get(p.series).push(p);
  }
  return [...map.entries()].map(([name, list]) => {
    const all = [...list].sort((a, b) => (a.part ?? 99) - (b.part ?? 99));
    const parts = all.filter((x) => x.part !== 0);
    const intro = all.find((x) => x.part === 0) || null;
    const face = [intro, ...parts].find((x) => x && (x.cover || x.video)) || null;
    const latest = all.reduce((m, x) => (x.created > m ? x.created : m), "");
    return { name, all, parts, intro, face, latest, slug: all[0].slug, href: `/blog/s/${encodeURIComponent(name)}` };
  }).sort((a, b) => b.latest.localeCompare(a.latest));
}

// 목록에서 같은 연재 글을 한 자리(가장 최근 글 자리)로 접기
export function collapseSeries(list) {
  const groups = new Map(groupSeries(list).map((g) => [g.name, g]));
  const seen = new Set();
  const out = [];
  for (const x of list) {
    if (!x.series || groups.get(x.series).all.length < 2) { out.push({ post: x }); continue; }
    if (seen.has(x.series)) continue;
    seen.add(x.series);
    out.push({ series: groups.get(x.series) });
  }
  return out;
}

export function SeriesPoster({ s, m }) {
  return (
    <span className="poster sposter">
      <span className="pk">연재</span>
      <span className="pn">{s.parts.length}</span>
      {LEAF}
      <span className="ph">{s.name}</span>
      <span className="pf">{m.name} · {s.parts.length}편</span>
    </span>
  );
}

// 최근 글 자리: 연재의 가장 최근 편을 맨 위에 얹은 스택
export function LatestStack({ s, m }) {
  const top = [...s.parts].sort((a, b) => b.created.localeCompare(a.created) || (b.part ?? 0) - (a.part ?? 0))[0];
  const has = top.cover || top.video;
  return (
    <a href={`/blog/p/${top.id}`} className="card pcard scardstack" style={{ "--hue": m.hue, "--tint": m.tint }}>
      <div className={`pthumb${has ? "" : " none"}`} style={has ? { backgroundImage: bg(top) } : undefined}>
        {!has && <Poster x={top} m={m} />}
        <span className="sbadge">새 글 · {top.part} / {s.parts.length}</span>
      </div>
      <div className="pbody">
        <div className="ptag">{m.name} · {s.name}</div>
        <div className="ptitle">{top.title}</div>
        {top.subtitle && <div className="psub">{top.subtitle}</div>}
        <ol className="slist">
          {s.parts.map((x) => <li key={x.id} className={x.id === top.id ? "on" : ""}><b>{x.part}</b>{x.title}</li>)}
        </ol>
        <div className="pdate">{top.created}</div>
      </div>
    </a>
  );
}

export function SeriesCard({ s, m }) {
  const show = s.parts.slice(0, 4);
  return (
    <a href={s.href} className="card pcard scardstack" style={{ "--hue": m.hue, "--tint": m.tint }}>
      <div className={`pthumb${s.face ? "" : " none"}`} style={s.face ? { backgroundImage: bg(s.face) } : undefined}>
        {!s.face && <SeriesPoster s={s} m={m} />}
        {s.face && <span className="sbadge">연재 · {s.parts.length}편</span>}
      </div>
      <div className="pbody">
        <div className="ptag">{m.name} · 연재</div>
        <div className="ptitle">{s.name}</div>
        <ol className="slist">
          {show.map((x) => <li key={x.id}><b>{x.part}</b>{x.title}</li>)}
          {s.parts.length > show.length && <li className="more">외 {s.parts.length - show.length}편</li>}
        </ol>
        <div className="pdate">처음부터 읽기 →</div>
      </div>
    </a>
  );
}
