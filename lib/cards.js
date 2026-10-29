// 블로그 카드뉴스: 노션 글 안의 「카드뉴스」 토글(코드 블록) → 카드 목록
//
// [표지]                         [본문]                  [말씀]              [마무리]
// 머리표: 배움 · 웰스프링 2026     소제목: …               인용: …             소제목: …
// 제목: 첫 줄                     본문: …                 성경: 요한복음 11:35  본문: …
// 둘째 줄                         성경: (꼬리말 왼쪽)      그림: (선택)         작은글: …
// 부제: …                         그림: /blog/cards/…                         그림: …
// 성경: 요한복음 11:35
// 날짜: 2026. 10. 22 · 뉴하모니
// 그림: /blog/cards/grief/1.jpg
//
// 맨 위 「스타일: 그림」(수채 창 그림) 또는 「스타일: 아치」(에디토리얼 아치 판형)로 판형을 고른다.
// 키가 없는 줄은 앞 키에 줄바꿈으로 이어 붙이고, 빈 줄은 문단 나눔이 된다.

export const CARD_W = 1080;
export const CARD_H = 1350;

const TYPES = { 표지: "cover", 본문: "section", 말씀: "verse", 마무리: "end" };
const KEYS = { 머리표: "label", 제목: "title", 부제: "sub", 성경: "ref", 날짜: "meta", 그림: "img", 소제목: "head", 본문: "body", 인용: "quote", 작은글: "note" };

export function parseCards(text = "") {
  const cards = [];
  let cur = null, key = null, gap = false, style = "그림";
  for (const raw of text.replace(/\r/g, "").split("\n")) {
    const line = raw.trim();
    const st = !cur && line.match(/^스타일\s*[:：]\s*(그림|아치)/);
    if (st) { style = st[1]; continue; }
    const t = line.match(/^\[(표지|본문|말씀|마무리)\]$/);
    if (t) { cur = { type: TYPES[t[1]] }; cards.push(cur); key = null; gap = false; continue; }
    if (!cur) continue;
    if (!line) { gap = true; continue; }
    const kv = line.match(/^(머리표|제목|부제|성경|날짜|그림|소제목|본문|인용|작은글)\s*[:：]\s*(.*)$/);
    if (kv) { key = KEYS[kv[1]]; cur[key] = kv[2]; gap = false; continue; }
    if (key) { cur[key] = (cur[key] ? cur[key] + (gap ? "\n\n" : "\n") : "") + line; gap = false; }
  }
  return cards.map((c, i) => ({ ...c, n: i + 1, style: style === "아치" ? "arch" : "paint", warn: overflow(c) }));
}

// 노션 블록에서 「카드뉴스」 토글을 찾아 그 안의 글을 꺼낸다
const plain = (rt = []) => rt.map((x) => x.plain_text).join("");
export const isCardToggle = (b) => b.type === "toggle" && /^카드\s*뉴스$/.test(plain(b.toggle.rich_text).trim());
export function cardsFromBlocks(blocks = []) {
  const tg = blocks.find(isCardToggle);
  if (!tg) return [];
  const text = (tg.kids || []).map((k) => plain(k[k.type]?.rich_text)).join("\n");
  return parseCards(text);
}

// 넘침 어림: 줄 수 × 줄 높이로 글 높이를 셈해, 하단 140px 안쪽으로 들어오는지 본다
function lines(s = "", size, width = 900) {
  const per = Math.max(1, Math.floor(width / (size * 0.98)));
  return s.split("\n").reduce((a, p) => a + Math.max(1, Math.ceil([...p].length / per)), 0);
}
function overflow(c) {
  const bottom = CARD_H - 140;
  if (c.type === "cover") {
    const h = 34 * 1.5 + 30 + lines(c.title, 86) * 86 * 1.24 + (c.sub ? 24 + lines(c.sub, 42) * 42 * 1.5 : 0) + (c.ref ? 20 + 60 : 0) + (c.meta ? 12 + 44 : 0);
    return 820 * 0.62 + h > CARD_H - 150 ? "제목·부제가 길어 그림을 덮습니다" : "";
  }
  if (c.type === "verse") {
    const top = c.img ? 590 : 300;
    return top + lines(c.quote, 44) * 44 * 1.62 + 80 > bottom ? "인용이 깁니다" : "";
  }
  const top = c.img ? 590 : 200;
  const h = (c.head ? lines(c.head, 54) * 54 * 1.3 + 28 : 0) + lines(c.body, 36) * 36 * 1.72 + (c.note ? 30 + lines(c.note, 28) * 28 * 1.6 : 0);
  return top + h > bottom ? `본문이 넘칩니다(약 ${Math.round(top + h - bottom)}px)` : "";
}
