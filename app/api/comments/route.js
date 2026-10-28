import { hasNotion, notionComments, notionAddComment } from "../../../lib/notion";

const OK = /^(honey|blog|sermon|d6|book):[A-Za-z0-9-]{1,40}$/;
const hits = new Map(); // IP별 간단한 도배 방지(서버가 꺼졌다 켜지면 초기화되는 느슨한 방식)

// 새 댓글이 달리면 휴대폰 알림(ntfy). NTFY_TOPIC이 없으면 건너뛴다.
async function notify({ name, text, target, label }) {
  const topic = process.env.NTFY_TOPIC;
  if (!topic) return;
  const [kind, id] = target.split(":");
  const path = kind === "honey" ? `/honey/${id}` : kind === "blog" ? `/blog/p/${id}` : kind === "sermon" ? `/sermon/${id}` : `/d6/${id}`;
  try {
    await fetch("https://ntfy.sh/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, title: `댓글 · ${name}`, message: `${text}\n— ${label || kind}`, click: `https://o-live-tree.vercel.app${path}` }),
      signal: AbortSignal.timeout(3000),
    });
  } catch {}
}

const json = (o, status = 200, extra = {}) =>
  new Response(JSON.stringify(o), { status, headers: { "Content-Type": "application/json", ...extra } });

export async function GET(req) {
  const target = new URL(req.url).searchParams.get("target") || "";
  if (!OK.test(target) || !hasNotion()) return json({ comments: [] });
  try {
    return json({ comments: await notionComments(target) }, 200, { "Cache-Control": "public, s-maxage=20, stale-while-revalidate=60" });
  } catch {
    return json({ comments: [] });
  }
}

export async function POST(req) {
  if (!hasNotion()) return json({ error: "댓글 기능을 아직 쓸 수 없습니다." }, 503);
  let b;
  try { b = await req.json(); } catch { return json({ error: "잘못된 요청입니다." }, 400); }
  const name = String(b.name || "").trim().slice(0, 30);
  const text = String(b.text || "").trim().slice(0, 600);
  const target = String(b.target || "");
  const label = String(b.label || "").slice(0, 100);
  if (b.website) return json({ ok: true, comment: null }); // 숨은 칸이 채워지면 자동 입력 → 조용히 무시
  if (!name) return json({ error: "이름(실명)을 적어 주세요." }, 400);
  if (!text) return json({ error: "내용을 적어 주세요." }, 400);
  if (!OK.test(target)) return json({ error: "잘못된 대상입니다." }, 400);
  if (/https?:\/\//i.test(text)) return json({ error: "링크가 들어간 댓글은 남길 수 없습니다." }, 400);

  const ip = (req.headers.get("x-forwarded-for") || "x").split(",")[0].trim();
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < 10 * 60 * 1000);
  if (recent.length >= 5) return json({ error: "잠시 후에 다시 남겨 주세요." }, 429);
  hits.set(ip, [...recent, now]);

  try {
    const comment = await notionAddComment({ name, text, target, label });
    await notify({ name, text, target, label });
    return json({ ok: true, comment });
  } catch (e) {
    console.error("comment", e.message);
    const why = e.status === 404 ? "노션 댓글 DB에 연결(Connections)이 필요합니다"
      : e.status === 403 ? "노션 연결에 입력(Insert content) 권한이 필요합니다"
      : e.status === 400 ? "댓글 DB의 칸 이름이 달라졌는지 확인이 필요합니다"
      : "잠시 후 다시 시도해 주세요";
    return json({ error: `저장하지 못했습니다 (${e.status || "오류"}). ${why}.` }, 500);
  }
}
