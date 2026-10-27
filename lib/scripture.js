import krv from "../data/krv.json";

// "신명기 16–18장, 누가복음 13장" → [{book, chapter}, ...]
export function parsePassage(passage = "") {
  const out = [];
  for (const part of passage.split(",")) {
    const m = part.trim().match(/^(\S+)\s+(\d+)(?:\s*[–\-~]\s*(\d+))?\s*장?/);
    if (!m) continue;
    const [, book, a, b] = m;
    for (let c = Number(a); c <= Number(b || a); c++) out.push({ book, chapter: c });
  }
  return out;
}

// 개역개정 본문 (장 단위). 없는 장은 건너뛴다.
export function chaptersFor(passage) {
  return parsePassage(passage)
    .map(({ book, chapter }) => {
      const verses = krv[book]?.[String(chapter)];
      return verses ? { book, chapter, verses } : null;
    })
    .filter(Boolean);
}
