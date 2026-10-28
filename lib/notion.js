// Notion 읽기 전용 연결. NOTION_TOKEN이 없거나 오류가 나면 null을 돌려주고, 호출한 쪽에서 내장 데이터로 대체한다.
const TOKEN = process.env.NOTION_TOKEN;
const SERMON_DB = "16fef6b3-672f-801a-af51-cf6b04f0f10a";
const HONEY_DB = "528e438a-6ad7-4594-bcf6-4d917e04ab6c";
export const PREACHER = "장가람 목사"; // 개인 홈페이지에는 이 설교자의 설교만 보인다

export const hasNotion = () => Boolean(TOKEN);

// 같은 서버 안에서 동시에 같은 목록을 부르면 한 번만 읽어 함께 쓴다(노션 요청 제한 방지)
const memoStore = new Map();
function memo(key, ttlMs, fn) {
  const hit = memoStore.get(key);
  if (hit && Date.now() - hit.at < ttlMs) return hit.p;
  const p = fn().catch((e) => { memoStore.delete(key); throw e; });
  memoStore.set(key, { at: Date.now(), p });
  return p;
}

async function nf(path, body) {
  for (let attempt = 0; attempt < 6; attempt++) {
    const r = await fetch(`https://api.notion.com/v1${path}`, {
      method: body ? "POST" : "GET",
      headers: { Authorization: `Bearer ${TOKEN}`, "Notion-Version": "2022-06-28", "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
      next: { revalidate: 3600 },
    });
    if (r.status === 429) {
      const wait = Number(r.headers.get("retry-after")) || 1.5 * (attempt + 1);
      await new Promise((x) => setTimeout(x, Math.min(wait, 8) * 1000));
      continue;
    }
    if (!r.ok) throw new Error(`Notion ${r.status} ${path}`);
    return r.json();
  }
  throw new Error("Notion rate limited");
}

const plain = (rt = []) => rt.map((t) => t.plain_text).join("");

// 블록 목록 → 텍스트 줄. 노션 API는 번호 목록의 숫자를 주지 않으므로 연속된 numbered_list_item에 번호를 붙인다.
export function linesOf(blocks) {
  const out = [];
  let n = 0;
  for (const c of blocks) {
    const rt = c[c.type]?.rich_text;
    if (!rt) continue;
    const t = plain(rt);
    if (c.type === "numbered_list_item") { n += 1; out.push(`${n}. ${t}`); }
    else { n = 0; out.push(t); }
  }
  return out;
}

export function parseSermonPage(p) {
  const pr = p.properties || {};
  return {
    id: p.id.replace(/-/g, ""),
    date: pr.Date?.date?.start?.slice(0, 10) || null,
    kind: (pr["설교"]?.multi_select || []).map((x) => x.name)[0] || "설교",
    title: plain(pr.Name?.title),
    passage: plain(pr["본문"]?.rich_text),
    series: pr["시리즈"]?.select?.name || "",
    bible: pr["성경"]?.select?.name || "",
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
        const kids = await children(b.id);
        const extra = [];
        for (const c of kids) {
          if (c.type === "video") flat.push({ kind: "video", url: c.video?.external?.url || "" });
          else if (c.type === "quote" || c.type === "paragraph") {
            const grand = c.has_children ? await children(c.id) : [];
            extra.push({ type: c.type, [c.type]: c[c.type] }, ...grand);
          } else extra.push(c);
        }
        const more = linesOf(extra);
        if (more.length) text += "\n" + more.join("\n");
      }
      flat.push({ kind: "callout", text, icon });
    }
  }
  return flat;
}

export const notionSermonMetaAll = () => memo("sermons", 120000, sermonMetaAllRaw);
async function sermonMetaAllRaw() {
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

// 연결 점검용 (비밀키는 노출하지 않음)
export async function notionDiagnose() {
  const out = { token: Boolean(TOKEN), steps: [] };
  if (!TOKEN) return out;
  const step = async (name, fn) => {
    try { out.steps.push({ name, ok: true, info: await fn() }); }
    catch (e) { out.steps.push({ name, ok: false, info: e.message }); }
  };
  await step("설교 DB 읽기 (장가람 목사)", async () => {
    const all = await notionSermonMetaAll();
    return `${all.length}건 · 최신 ${all[0]?.date} ${all[0]?.title}`;
  });
  await step("설교 DB 읽기 (전체 설교자, 첫 100건 기준)", async () => {
    const r = await nf(`/databases/${SERMON_DB}/query`, { page_size: 100 });
    return `${r.results.length}건${r.has_more ? " 이상" : ""}`;
  });
  await step("꿀보다성경 DB 읽기", async () => {
    const r = await nf(`/databases/${HONEY_DB}/query`, { page_size: 1 });
    return `${r.results.length ? "읽힘" : "비어 있음"}`;
  });
  await step("오늘 설교 페이지 내용(영상·요약)", async () => {
    const all = await notionSermonMetaAll();
    const d = await notionSermonDetail(all[0]);
    return `영상 ${d.video ? "있음" : "없음"} · 요약 ${d.summary ? d.summary.length + "자" : "없음"} · 질문 ${d.questions.length}개`;
  });
  await step("이 사이트가 쓰는 노션 연결 이름", async () => {
    const r = await nf("/users/me");
    return `${r.name || "(이름 없음)"} · ${r.bot?.workspace_name || "워크스페이스 불명"}`;
  });
  await step("블로그 글 DB 읽기", async () => {
    const r = await nf(`/databases/${BLOG_DB}/query`, { page_size: 1 });
    return `읽힘 (${r.results.length ? "글 있음" : "글 없음"})`;
  });
  await step("댓글 DB 읽기", async () => {
    const r = await nf(`/databases/${COMMENT_DB}/query`, { page_size: 1 });
    return `읽힘 (댓글 ${r.results.length ? "있음" : "없음"})`;
  });
  await step("정착 안내 DB 읽기", async () => {
    const r = await nf(`/databases/${SETTLE_DB}/query`, { page_size: 100, filter: { property: "공개", checkbox: { equals: true } } });
    return `공개 ${r.results.length}건${r.has_more ? "+" : ""}`;
  });
  await step("새김D6 DB 목록 읽기", async () => {
    const list = await notionD6All();
    return `${list.length}건`;
  });
  return out;
}

// 설교 페이지 커버(썸네일) 주소. 서명 URL은 곧 만료되므로 캐시하지 않고 그때그때 읽는다.
export async function notionCoverUrl(id) {
  const r = await fetch(`https://api.notion.com/v1/pages/${id}`, {
    headers: { Authorization: `Bearer ${TOKEN}`, "Notion-Version": "2022-06-28" },
    cache: "no-store",
  });
  if (!r.ok) return null;
  const p = await r.json();
  return p.cover?.file?.url || p.cover?.external?.url || null;
}

// 새김D6 전체 목록(암송 탭용). 실패하면 호출한 쪽에서 내장 데이터로 대체한다.
const D6_DB = "2dbef6b3672f80198f87da78c50f9a4e"; // 데이터베이스 주소의 ID (데이터 소스 ID와 다름)
export const notionD6All = () => memo("d6all", 300000, d6AllRaw);
async function d6AllRaw() {
  const out = [];
  let cursor;
  for (let i = 0; i < 10; i++) {
    const r = await nf(`/databases/${D6_DB}/query`, { page_size: 100, ...(cursor ? { start_cursor: cursor } : {}) });
    for (const p of r.results) {
      const pr = p.properties;
      const ref = titleOf(pr) || plain(pr["Verses"]?.rich_text);
      if (!ref) continue;
      out.push({ id: p.id.replace(/-/g, ""), ref, text: plain(pr["개역개정"]?.rich_text).replace(/\s*\([^)]*\)\s*$/, "") });
    }
    if (!r.has_more) break;
    cursor = r.next_cursor;
  }
  return out;
}

// ───────── 블로그 글 DB (홈페이지용) ─────────
export const BLOG_DB = process.env.BLOG_DB || "af125186a4ac4c2986f6d9dd5b933791";

function parseBlogPage(p) {
  const pr = p.properties;
  return {
    id: p.id.replace(/-/g, ""),
    title: titleOf(pr) || "제목 없음",
    cat: pr["카테고리"]?.select?.name || "",
    created: (p.created_time || "").slice(0, 10),
    pinned: pr["지정일"]?.date?.start?.slice(0, 10) || "",
    summary: plain(pr["요약"]?.rich_text),
    author: plain(pr["저자"]?.rich_text),
    types: (pr["유형"]?.multi_select || []).map((o) => o.name),
    tags: (pr["태그"]?.multi_select || []).map((o) => o.name),
    video: youtubeId(pr["영상"]?.url || ""),
    cover: Boolean(p.cover),
  };
}

export const notionBlogAll = () => memo("blog", 60000, blogAllRaw);
async function blogAllRaw() {
  const out = [];
  let cursor;
  for (let i = 0; i < 5; i++) {
    const r = await nf(`/databases/${BLOG_DB}/query`, {
      page_size: 100,
      filter: { property: "공개", checkbox: { equals: true } },
      sorts: [{ timestamp: "created_time", direction: "descending" }],
      ...(cursor ? { start_cursor: cursor } : {}),
    });
    out.push(...r.results.map(parseBlogPage));
    if (!r.has_more) break;
    cursor = r.next_cursor;
  }
  return out;
}

// 글 하나: 메타 + 본문 블록(1단계 하위 포함)
async function pageBlocks(id) {
  const blocks = await children(id);
  for (const b of blocks) {
    if (b.has_children && ["toggle", "callout", "quote", "bulleted_list_item", "numbered_list_item", "table"].includes(b.type)) {
      b.kids = await children(b.id);
    }
  }
  return blocks;
}

export async function notionBlogPost(id) {
  const p = await nf(`/pages/${id}`);
  if (!p.properties["공개"]?.checkbox) return null;
  return { ...parseBlogPage(p), blocks: await pageBlocks(id) };
}

// 본문 이미지: 블록 id로 현재 유효한 파일 주소를 받아온다(서명 주소는 1시간 뒤 만료)
export async function notionImageUrl(blockId) {
  const r = await fetch(`https://api.notion.com/v1/blocks/${blockId}`, {
    headers: { Authorization: `Bearer ${TOKEN}`, "Notion-Version": "2022-06-28" },
    cache: "no-store",
  });
  if (!r.ok) return null;
  const b = await r.json();
  return b.image?.file?.url || b.image?.external?.url || null;
}

// ───────── 댓글 (노션 "댓글 (홈페이지용)" DB) ─────────
export const COMMENT_DB = process.env.COMMENT_DB || "baeecbdfa0c9450484dd71e85d97ba31";

export async function notionComments(target) {
  const r = await fetch(`https://api.notion.com/v1/databases/${COMMENT_DB}/query`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Notion-Version": "2022-06-28", "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({
      page_size: 100,
      filter: { and: [
        { property: "대상", rich_text: { equals: target } },
        { property: "숨김", checkbox: { equals: false } },
      ] },
      sorts: [{ timestamp: "created_time", direction: "ascending" }],
    }),
  });
  if (!r.ok) throw new Error(`Notion ${r.status} comments`);
  const j = await r.json();
  return j.results.map((p) => ({
    id: p.id,
    name: plain(p.properties["이름"]?.title),
    text: plain(p.properties["내용"]?.rich_text),
    at: p.created_time,
  }));
}

export async function notionAddComment({ name, text, target, label }) {
  const body = JSON.stringify({
    parent: { database_id: COMMENT_DB },
    properties: {
      "이름": { title: [{ text: { content: name } }] },
      "내용": { rich_text: [{ text: { content: text } }] },
      "대상": { rich_text: [{ text: { content: target } }] },
      "글 제목": { rich_text: [{ text: { content: label || "" } }] },
    },
  });
  let last;
  for (let i = 0; i < 4; i++) {
    const r = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: { Authorization: `Bearer ${TOKEN}`, "Notion-Version": "2022-06-28", "Content-Type": "application/json" },
      body,
    });
    if (r.ok) {
      const p = await r.json();
      return { id: p.id, name, text, at: p.created_time };
    }
    last = r;
    if (r.status !== 429) break;
    const wait = Math.min(Number(r.headers.get("retry-after")) || 1, 4);
    await new Promise((x) => setTimeout(x, wait * 1000));
  }
  const t = await last.text();
  const e = new Error(`Notion ${last.status} add comment ${t.slice(0, 200)}`);
  e.status = last.status;
  throw e;
}

// ───────── 정착 안내 DB (홈페이지용) ─────────
export const SETTLE_DB = process.env.SETTLE_DB || "90c3844e78684331981eab6ea26886eb";
const SETTLE_KEYS = { 도착: "arrival", 행정: "admin", 주거: "housing", 생활: "daily_life", 교육: "education", 의료: "healthcare", 꿀팁: "pro_tips" };
const SHELF = { 매년: "yearly", 수시: "monthly", "변함 적음": "stable" };

function parseSettlePage(p) {
  const pr = p.properties;
  const links = plain(pr["공식 링크"]?.rich_text).split("\n").map((l) => l.trim()).filter(Boolean).map((l) => {
    const [a, ...b] = l.split("|");
    const url = (b.join("|") || a).trim();
    return /^https?:\/\//.test(url) ? { label: b.length ? a.trim() : url, url } : null;
  }).filter(Boolean);
  return {
    id: p.id.replace(/-/g, ""),
    title: titleOf(pr) || "제목 없음",
    category: SETTLE_KEYS[pr["카테고리"]?.select?.name] || "pro_tips",
    sub: plain(pr["세부"]?.rich_text),
    church: pr["대상"]?.select?.name === "퍼듀" ? "purdue" : "all",
    summary: plain(pr["요약"]?.rich_text),
    verified: pr["확인일"]?.date?.start?.slice(0, 10) || "",
    shelf: SHELF[pr["갱신 주기"]?.select?.name] || "stable",
    tags: (pr["태그"]?.multi_select || []).map((o) => o.name),
    links,
    cover: !!(p.cover?.file?.url || p.cover?.external?.url),
    credit: plain(pr["이미지 출처"]?.rich_text),
  };
}

export const notionSettleAll = () => memo("settle", 60000, async () => {
  const out = [];
  let cursor;
  for (let i = 0; i < 5; i++) {
    const r = await nf(`/databases/${SETTLE_DB}/query`, {
      page_size: 100,
      filter: { property: "공개", checkbox: { equals: true } },
      ...(cursor ? { start_cursor: cursor } : {}),
    });
    out.push(...r.results.map(parseSettlePage));
    if (!r.has_more) break;
    cursor = r.next_cursor;
  }
  return out;
});

export async function notionSettlePost(id) {
  const p = await nf(`/pages/${id}`);
  if (!p.properties["공개"]?.checkbox) return null;
  return { ...parseSettlePage(p), blocks: await pageBlocks(id) };
}
