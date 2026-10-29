// 카드 PNG용 글꼴: 구글 폰트에서 카드에 쓰인 글자만 잘라 TTF로 받는다(요청마다 캐시)
const cache = new Map();
async function one(family, weight, text) {
  const key = `${family}|${weight}|${text}`;
  if (cache.has(key)) return cache.get(key);
  const p = (async () => {
    const css = await (await fetch(`https://fonts.googleapis.com/css2?family=${family.replace(/ /g, "+")}:wght@${weight}&text=${encodeURIComponent(text)}`)).text();
    const url = css.match(/src:\s*url\(([^)]+)\)\s*format\('(?:truetype|opentype)'\)/)?.[1];
    if (!url) throw new Error("font " + family);
    return (await fetch(url)).arrayBuffer();
  })();
  cache.set(key, p);
  p.catch(() => cache.delete(key));
  return p;
}
export async function cardFonts(text) {
  const t = [...new Set(text + "0123456789/|·OliveTre—–-:., ")].join("");
  const spec = [["Noto Sans KR", 400], ["Noto Sans KR", 700], ["Noto Sans KR", 800], ["Noto Serif KR", 700]];
  const data = await Promise.all(spec.map(([f, w]) => one(f, w, t)));
  return spec.map(([f, w], i) => ({ name: f, weight: w, style: "normal", data: data[i] }));
}
