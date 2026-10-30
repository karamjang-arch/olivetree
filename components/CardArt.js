// 카드뉴스 한 장 (next/og로 PNG가 됨 — 인라인 스타일과 flex만 쓴다)
// 규격: 퍼듀 조판기 카드뉴스 판형(1080×1350) · Rooted 틸 · 퍼듀 금
const K = { deep: "#1D343C", paper: "#F5EDE0", ink: "#23302F", body: "#5B625F", badge: "#2F5D62", accentInk: "#3F7470", gold: "#BB9B42" };
const SANS = "Noto Sans KR", SERIF = "Noto Serif KR";
const X = 90, W = 900;

function Leaf({ size = 34 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path d="M4 20C4 11 10 5 20 4c-1 10-7 16-16 16z" fill={K.accentInk} />
      <path d="M4 20L14 10" stroke={K.paper} strokeWidth="1.6" />
    </svg>
  );
}

// 어절 단위로 끊어 배치한다(문장부호가 홀로 줄을 넘지 않게)
const Words = ({ l, style }) => (
  <div style={{ ...style, display: "flex", flexWrap: "wrap" }}>
    {l.split(/\s+/).filter(Boolean).map((w, k, a) => <span key={k} style={{ marginRight: k < a.length - 1 ? "0.27em" : 0 }}>{w}</span>)}
  </div>
);
function Lines({ text = "", style }) {
  // 빈 줄은 문단 사이 띄움, 한 줄 바꿈은 그대로
  const paras = text.split("\n\n");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: style.paraGap ?? 22 }}>
      {paras.map((p, i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column" }}>
          {p.split("\n").map((l, j) => <Words key={j} l={l} style={style} />)}
        </div>
      ))}
    </div>
  );
}

function Picture({ img, h, fade }) {
  if (!img) return null;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: h, display: "flex" }}>
      <img src={img} width={1080} height={h} style={{ objectFit: "cover", objectPosition: "center 40%" }} />
      <div style={{ position: "absolute", left: 0, top: h - fade, width: 1080, height: fade, display: "flex", backgroundImage: `linear-gradient(to bottom, rgba(245,237,224,0), ${K.paper})` }} />
    </div>
  );
}

function Footer({ c, total }) {
  return (
    <div style={{ position: "absolute", left: X, bottom: 56, width: W, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", height: 2, background: "rgba(187,155,66,.5)", marginBottom: 20 }} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", fontFamily: SANS, fontSize: 26, color: K.body }}>{c.ref || ""}</div>
        <div style={{ display: "flex", alignItems: "center", fontFamily: SANS }}>
          <span style={{ fontSize: 27, color: K.body }}>Olive Tree</span>
          <span style={{ width: 2, height: 26, background: K.gold, margin: "0 16px" }} />
          <span style={{ fontSize: 28, fontWeight: 700, color: K.ink }}>{c.n} / {total}</span>
        </div>
      </div>
    </div>
  );
}

function Cover({ c, img }) {
  return (
    <>
      <Picture img={img} h={790} fade={300} />
      <div style={{ position: "absolute", left: X, bottom: 150, width: W, display: "flex", flexDirection: "column" }}>
        {c.label && <div style={{ display: "flex", fontFamily: SANS, fontWeight: 700, fontSize: 34, color: K.accentInk }}>{c.label}</div>}
        <div style={{ display: "flex", width: 112, height: 5, background: K.gold, margin: "22px 0 28px" }} />
        <Lines text={c.title} style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 86, lineHeight: 1.24, color: K.ink, letterSpacing: -1 }} />
        {c.sub && <div style={{ display: "flex", marginTop: 24 }}><Lines text={c.sub} style={{ fontFamily: SANS, fontSize: 42, lineHeight: 1.5, color: K.body }} /></div>}
        {c.ref && <div style={{ display: "flex", marginTop: 26, fontFamily: SANS, fontWeight: 700, fontSize: 50, color: K.badge }}>{c.ref}</div>}
        {c.meta && <div style={{ display: "flex", marginTop: 12, fontFamily: SANS, fontSize: 32, color: K.body }}>{c.meta}</div>}
      </div>
      <div style={{ position: "absolute", left: 0, bottom: 56, width: 1080 - X, display: "flex", justifyContent: "flex-end", alignItems: "center", height: 66 }}>
        <Leaf size={40} />
        <span style={{ marginLeft: 12, fontFamily: SERIF, fontWeight: 700, fontSize: 34, color: K.deep }}>Olive Tree</span>
      </div>
    </>
  );
}

function Section({ c, img, total }) {
  const top = img ? 590 : 200;
  if (!img) {
    // 그림 없는 장: 가운데 정렬, 잎 하나와 조금 큰 소제목으로 여백을 살린다
    return (
      <>
        <div style={{ position: "absolute", left: X, top: 0, width: W, height: 1200, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ display: "flex", marginBottom: 34 }}><Leaf size={64} /></div>
          {c.head && <div style={{ display: "flex", marginBottom: 34 }}><Lines text={c.head} style={{ fontFamily: SANS, fontWeight: 800, fontSize: 62, lineHeight: 1.3, color: K.ink, letterSpacing: -0.5 }} /></div>}
          <div style={{ display: "flex", width: 66, height: 4, background: K.gold, marginBottom: 34 }} />
          {c.body && <Lines text={c.body} style={{ fontFamily: SANS, fontSize: 40, lineHeight: 1.75, color: K.body }} />}
          {c.note && <div style={{ display: "flex", marginTop: 30, paddingTop: 22, borderTop: `2px solid rgba(91,98,95,.18)` }}><Lines text={c.note} style={{ fontFamily: SANS, fontSize: 28, lineHeight: 1.6, color: K.body }} /></div>}
        </div>
        <Footer c={c} total={total} />
      </>
    );
  }
  return (
    <>
      <Picture img={img} h={540} fade={200} />
      {!img && <div style={{ position: "absolute", left: X, top: 110, display: "flex" }}><Leaf size={40} /></div>}
      <div style={{ position: "absolute", left: X, top, width: W, display: "flex", flexDirection: "column" }}>
        {c.head && <div style={{ display: "flex", marginBottom: 28 }}><Lines text={c.head} style={{ fontFamily: SANS, fontWeight: 800, fontSize: 54, lineHeight: 1.3, color: K.ink, letterSpacing: -0.5 }} /></div>}
        {c.body && <Lines text={c.body} style={{ fontFamily: SANS, fontSize: 38, lineHeight: 1.7, color: K.body }} />}
        {c.note && <div style={{ display: "flex", marginTop: 30, paddingTop: 22, borderTop: `2px solid rgba(91,98,95,.18)` }}><Lines text={c.note} style={{ fontFamily: SANS, fontSize: 28, lineHeight: 1.6, color: K.body }} /></div>}
      </div>
      <Footer c={c} total={total} />
    </>
  );
}

function Verse({ c, img, total }) {
  return (
    <>
      <Picture img={img} h={540} fade={200} />
      <div style={{ position: "absolute", left: X, top: img ? 560 : 0, width: W, height: img ? 640 : 1200, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ display: "flex", fontFamily: SERIF, fontWeight: 700, fontSize: 150, lineHeight: 0.8, color: K.gold, height: 90 }}>“</div>
        <Lines text={c.quote} style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 48, lineHeight: 1.62, color: K.ink }} />
        {c.ref && (
          <div style={{ display: "flex", alignItems: "center", marginTop: 34, fontFamily: SANS, fontWeight: 700, fontSize: 32, color: K.badge }}>
            <span style={{ width: 40, height: 3, background: K.gold, marginRight: 16 }} />{c.ref}
          </div>
        )}
      </div>
      <Footer c={{ ...c, ref: "" }} total={total} />
    </>
  );
}

// ───────── 아치 판형 (에디토리얼: 큰 명조 제목 · 테라코타 아치 · 짙은 초록 사분원) ─────────
const ARCH = { paper: "#F2E8DA", ink: "#37392B", body: "#5E5A4E", terra: "#D58A60", green: "#3F4A36", cream: "#F7F0E4" };

function LineLeaf({ size = 260, color = "rgba(247,240,228,.85)" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round">
      <path d="M10 92 C30 70 50 48 88 14" />
      {[[22, 79, 8, 62], [32, 68, 20, 48], [42, 57, 34, 36], [53, 46, 50, 26], [64, 36, 66, 18]].map(([x, y, tx, ty], i) => (
        <path key={i} d={`M${x} ${y} C${tx - 6} ${y - 4} ${tx - 4} ${ty + 4} ${tx} ${ty} C${tx + 8} ${ty + 6} ${x + 4} ${y - 6} ${x} ${y}`} />
      ))}
      {[[28, 74, 46, 80], [38, 63, 58, 68], [49, 52, 70, 56], [60, 41, 80, 44]].map(([x, y, tx, ty], i) => (
        <path key={"r" + i} d={`M${x} ${y} C${x + 6} ${y + 8} ${tx - 6} ${ty + 4} ${tx} ${ty} C${tx - 4} ${ty - 8} ${x + 8} ${y - 4} ${x} ${y}`} />
      ))}
    </svg>
  );
}

function ArchFooter({ c, total, dark, A }) {
  const fg = dark ? "rgba(247,240,228,.75)" : A.body;
  return (
    <div style={{ position: "absolute", left: 80, bottom: 56, width: 920, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", height: 2, background: A.terra, opacity: dark ? 0.6 : 0.45, marginBottom: 20 }} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", fontFamily: SANS, fontSize: 26, color: fg }}>{c.ref || ""}</div>
        <div style={{ display: "flex", alignItems: "center", fontFamily: SANS }}>
          <span style={{ fontSize: 27, color: fg }}>Olive Tree</span>
          <span style={{ width: 2, height: 26, background: A.terra, margin: "0 16px" }} />
          <span style={{ fontSize: 28, fontWeight: 700, color: dark ? A.cream : A.ink }}>{c.n} / {total}</span>
        </div>
      </div>
    </div>
  );
}

function ArchCover({ c, img, A }) {
  return (
    <>
      <div style={{ position: "absolute", left: 500, top: 130, width: 780, height: 1400, borderRadius: 390, background: A.terra, display: "flex" }} />
      {img && <img src={img} width={760} height={760} style={{ position: "absolute", left: 340, top: 590, objectFit: "contain" }} />}
      <div style={{ position: "absolute", left: -260, bottom: -260, width: 720, height: 720, borderRadius: 360, background: A.green, display: "flex" }} />
      <div style={{ position: "absolute", left: 40, bottom: 34, display: "flex" }}><LineLeaf size={250} /></div>
      <div style={{ position: "absolute", left: 80, top: 130, width: 560, display: "flex", flexDirection: "column" }}>
        {c.label && <div style={{ display: "flex", fontFamily: SANS, fontWeight: 700, fontSize: 30, color: A.body, marginBottom: 26, letterSpacing: 1 }}>{c.label}</div>}
        <Lines text={c.title} style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 112, lineHeight: 1.1, color: A.ink, letterSpacing: -2 }} />
        <div style={{ display: "flex", width: 66, height: 4, background: A.terra, margin: "44px 0 30px" }} />
        {c.sub && <div style={{ display: "flex", width: 410 }}><Lines text={c.sub} style={{ fontFamily: SANS, fontWeight: 500, fontSize: 30, lineHeight: 1.6, color: A.ink, letterSpacing: 1 }} /></div>}
        {c.meta && <div style={{ display: "flex", marginTop: 18, fontFamily: SANS, fontSize: 26, color: A.body, letterSpacing: 1 }}>{c.meta}</div>}
      </div>
      <div style={{ position: "absolute", left: 0, top: 60, width: 1010, display: "flex", justifyContent: "flex-end", fontFamily: SERIF, fontWeight: 700, fontSize: 32, color: A.ink }}>Olive Tree</div>
    </>
  );
}

function ArchSection({ c, img, total, A }) {
  return (
    <>
      {img && (
        <div style={{ position: "absolute", left: 640, top: 90, width: 360, height: 470, borderTopLeftRadius: 180, borderTopRightRadius: 180, overflow: "hidden", display: "flex", background: A.terra }}>
          <img src={img} width={360} height={470} style={{ objectFit: "cover" }} />
        </div>
      )}
      <div style={{ position: "absolute", left: 80, top: img ? 110 : 150, width: img ? 520 : 920, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", fontFamily: SERIF, fontWeight: 700, fontSize: 40, color: A.terra, marginBottom: 18 }}>{String(c.n).padStart(2, "0")}</div>
        {c.head && <Lines text={c.head} style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 64, lineHeight: 1.25, color: A.ink, letterSpacing: -1 }} />}
      </div>
      <div style={{ position: "absolute", left: 80, top: img ? 620 : 470, width: 920, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", width: 66, height: 4, background: A.terra, marginBottom: 34 }} />
        {c.body && <Lines text={c.body} style={{ fontFamily: SANS, fontSize: 38, lineHeight: 1.7, color: A.body }} />}
        {c.note && <div style={{ display: "flex", marginTop: 28, paddingTop: 20, borderTop: "2px solid rgba(94,90,78,.18)" }}><Lines text={c.note} style={{ fontFamily: SANS, fontSize: 28, lineHeight: 1.6, color: A.body }} /></div>}
      </div>
      <ArchFooter c={c} total={total} A={A} />
    </>
  );
}

function ArchVerse({ c, total, A }) {
  return (
    <>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1350, background: A.green, display: "flex" }} />
      <div style={{ position: "absolute", right: -220, top: -220, width: 620, height: 620, borderRadius: 310, background: A.terra, opacity: 0.9, display: "flex" }} />
      <div style={{ position: "absolute", left: 40, bottom: 150, display: "flex" }}><LineLeaf size={300} color="rgba(247,240,228,.28)" /></div>
      <div style={{ position: "absolute", left: 90, top: 0, width: 900, height: 1200, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ display: "flex", fontFamily: SERIF, fontWeight: 700, fontSize: 150, lineHeight: 0.8, color: A.terra, height: 90 }}>“</div>
        <Lines text={c.quote} style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 52, lineHeight: 1.6, color: A.cream }} />
        {c.ref && <div style={{ display: "flex", alignItems: "center", marginTop: 36, fontFamily: SANS, fontWeight: 700, fontSize: 32, color: A.soft }}><span style={{ width: 40, height: 3, background: A.terra, marginRight: 16 }} />{c.ref}</div>}
      </div>
      <ArchFooter c={{ ...c, ref: "" }} total={total} dark A={A} />
    </>
  );
}

// 아치 판형의 강조색: 블로그 분류마다 하나씩 (종이·잉크·초록은 공통)
export const ARCH_ACCENT = {
  recitation: ["#D58A60", "#E9B08F"], // 암송: 테라코타
  lecture: ["#6F8DB0", "#A9C0DA"],    // 강의: 먼지 낀 파랑
  notes: ["#5E9C97", "#9CCBC6"],      // 배움: 청록
  family: ["#8FA86F", "#C3D6A6"],     // 올리브 가족: 세이지
  book: ["#9488B8", "#C6BEDD"],       // 도서: 라벤더
  journal: ["#C79A4E", "#E3C48C"],    // 저널: 황토
};

export function Card({ c, total, img, cat }) {
  if (c.style === "arch") {
    const [terra, soft] = ARCH_ACCENT[cat] || ARCH_ACCENT.recitation;
    const A = { ...ARCH, terra, soft };
    return (
      <div style={{ width: 1080, height: 1350, display: "flex", position: "relative", background: ARCH.paper, fontFamily: SANS, overflow: "hidden" }}>
        {c.type === "cover" ? <ArchCover c={c} img={img} A={A} /> : c.type === "verse" ? <ArchVerse c={c} total={total} A={A} /> : <ArchSection c={c} img={img} total={total} A={A} />}
      </div>
    );
  }
  return (
    <div style={{ width: 1080, height: 1350, display: "flex", position: "relative", background: K.paper, fontFamily: SANS }}>
      {c.type === "cover" ? <Cover c={c} img={img} /> : c.type === "verse" ? <Verse c={c} img={img} total={total} /> : <Section c={c} img={img} total={total} />}
    </div>
  );
}
