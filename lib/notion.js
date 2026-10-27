// Notion 읽기 전용 연결. NOTION_TOKEN이 없거나 오류가 나면 null을 돌려주고, 호출한 쪽에서 내장 데이터로 대체한다.
const TOKEN = process.env.NOTION_TOKEN;
const SERMON_DB = "16fef6b3-672f-801a-af51-cf6b04f0f10a";
const HONEY_DB = "528e438a-6ad7-4594-bcf6-4d917e04ab6c";
export const PREACHER = "장가람 목사"; // 개인 홈페이지에는 이 설교자의 설교만 보인다

export const hasNotion = () => Boolean(TOKEN);

async function nf(path, body) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const r = await fetch(`https://api.notion.com/v1${path}`, {
      method: body ? "POST" : "GET",
      headers: { Authorization: `Bearer ${TOKEN}`, "Notion-Version": "2022-06-28", "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
      next: { revalidate: 3600 },
    });
    if (r.status === 429) { await new Promise((s) => setTimeout(s, 1200 * (attempt + 1))); continue; }
    if (!r.ok) throw new Error(`Notion ${r.status} ${path}`);
    return r.json();
  }
  throw new Error("Notion rate limited");
}

const plain = (rt = []) => rt.map((t) => t.plain_text).join("");

export function parseSermonPage(p) {
  const pr = p.properties || {};
  return {
    id: p.id.replace(/-/g, ""),
    date: pr.Date?.date?.start?.slice(0, 10) || null,
    kind: (pr["설교"]?.multi_select || []).map((x) => x.name)[0] || "설교",
    title: plain(pr.Name?.title),
    passage: plain(pr["본문"]?.rich_text),
    series: pr["시리즈"]?.select?.name || "",
    preacher: pr["설교자"]?.select?.name || "",
  };
}

export function youtubeId(url = "") {
  const m = url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
  return m ? m[1] : null;
}

// 블록들에서 영상 · 요약 · 적용질문 추출 (콜아웃 안쪽까지)
export function extractFromBlocks(flat) {
  let video = null, summary = "", questions = [];
  for (const b of flat) {
    if (b.kind === "video" && !video) video = youtubeId(b.url);
    if (b.kind !== "callout") continue;
    const text = b.text.trim();
    const icon = b.icon || "";
    if (/설교\s*요약/.test(text)) {
      const [s, q] = text.replace(/^.*?설교\s*요약\s*/s, "").split(/적용\s*질문/);
      summary = (s || "").trim();
      if (q) questions = q.split("\n").map((l) => l.trim()).filter((l) => /^\d+\./.test(l)).map((l) => l.replace(/^\d+\.\s*/, ""));
    } else if (icon.includes("drafts") && !summary) {
      summary = text;
    } else if ((icon.includes("thought-dialogue") || /^\s*1\.\s/.test(text)) && !questions.length) {
      questions = text.split("\n").map((l) => l.trim()).filter((l) => /^\d+\./.test(l)).map((l) => l.replace(/^\d+\.\s*/, ""));
    }
  }
  return { video, summary, questions };
}

async function children(id) {
  const out = [];
  let cursor;
  do {
    const r = await nf(`/blocks/${id}/children?page_size=100${cursor ? `&start_cursor=${cursor}` : ""}`);
    out.push(...r.results);
    cursor = r.has_more ? r.next_cursor : null;
  } while (cursor);
  return out;
}

// 블록 → 평탄화 목록 ({kind,text,url,icon}); 콜아웃은 안쪽 텍스트와 영상까지 포함
async function flatten(id) {
  const top = await children(id);
  const flat = [];
  for (const b of top) {
    if (b.type === "video") {
      flat.push({ kind: "video", url: b.video?.external?.url || b.video?.file?.url || "" });
    } else if (b.type === "callout") {
      const icon = b.callout.icon?.external?.url || b.callout.icon?.type || "";
      let text = plain(b.callout.rich_text);
      if (b.has_children) {
        for (const c of await children(b.id)) {
          if (c.type === "video") flat.push({ kind: "video", url: c.video?.external?.url || "" });
          else if (c.type === "quote" || c.type === "paragraph") {
            text += "\n" + plain(c[c.type].rich_text);
            if (c.has_children) for (const cc of await children(c.id)) if (cc[cc.type]?.rich_text) text += "\n" + plain(cc[cc.type].rich_text);
          } else if (c[c.type]?.rich_text) text += "\n" + plain(c[c.type].rich_text);
        }
      }
      flat.push({ kind: "callout", text, icon });
    }
  }
  return flat;
}

export async function notionSermonMetaAll() {
  const out = [];
  let cursor;
  do {
    const r = await nf(`/databases/${SERMON_DB}/query`, {
      filter: { property: "설교자", select: { equals: PREACHER } },
      sorts: [{ property: "Date", direction: "descending" }],
      page_size: 100,
      ...(cursor ? { start_cursor: cursor } : {}),
    });
    out.push(...r.results.map(parseSermonPage).filter((s) => s.date));
    cursor = r.has_more ? r.next_cursor : null;
  } while (cursor);
  return out;
}

export async function notionSermonDetail(meta) {
  const flat = await flatten(meta.id);
  return { ...meta, ...extractFromBlocks(flat) };
}

export async function notionSermonById(id) {
  const p = await nf(`/pages/${id}`);
  return notionSermonDetail(parseSermonPage(p));
}

export async function notionHoneyAudio(date) {
  const r = await nf(`/databases/${HONEY_DB}/query`, { filter: { property: "날짜", date: { equals: date } }, page_size: 1 });
  const p = r.results[0];
  return p?.properties?.["음원"]?.url || null;
}

// ── 꿀성경 하루: 음원 + D6 암송 연결 ──
export async function notionHoneyMeta(date) {
  const r = await nf(`/databases/${HONEY_DB}/query`, { filter: { property: "날짜", date: { equals: date } }, page_size: 1 });
  const p = r.results[0];
  if (!p) return null;
  return {
    audio: p.properties?.["음원"]?.url || null,
    d6: (p.properties?.["D6 암송"]?.relation || []).map((x) => x.id.replace(/-/g, "")),
  };
}

const titleOf = (props) => {
  for (const k of Object.keys(props)) if (props[k].type === "title") return plain(props[k].title);
  return "";
};

// D6 카드(목록용): 구절 + 개역개정 본문
export async function notionD6Card(id) {
  const p = await nf(`/pages/${id}`);
  const pr = p.properties;
  const ref = titleOf(pr) || plain(pr["Verses"]?.rich_text);
  const text = plain(pr["개역개정"]?.rich_text).replace(/\s*\([^)]*\)\s*$/, "");
  return { id, ref, text };
}

// D6 상세: 구절·영어·오디오·본문 섹션
export async function notionD6Detail(id) {
  const p = await nf(`/pages/${id}`);
  const pr = p.properties;
  const ref = titleOf(pr) || plain(pr["Verses"]?.rich_text);
  const verse = plain(pr["개역개정"]?.rich_text);
  const nkjv = plain(pr["NKJV"]?.rich_text);
  const audios = [];
  const sections = [];
  for (const b of await children(id)) {
    if (b.type !== "callout") continue;
    let text = plain(b.callout.rich_text);
    if (b.has_children) {
      for (const c of await children(b.id)) {
        if (c.type === "audio") audios.push({ url: c.audio?.external?.url || c.audio?.file?.url, label: plain(c.audio?.caption) || "" });
        else if (c[c.type]?.rich_text) text += "\n" + plain(c[c.type].rich_text);
      }
    }
    text = text.trim();
    if (!text) continue;
    const lines = text.split("\n");
    const first = lines[0].trim();
    const known = ["들어가며", "본문의 자리", "성경의 숲", "신학 인사이트", "원어 설명", "삶의 자리"];
    if (known.includes(first)) sections.push({ title: first, body: lines.slice(1).join("\n").trim() });
  }
  return { id, ref, verse, nkjv, audios, sections };
}
