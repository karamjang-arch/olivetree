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
