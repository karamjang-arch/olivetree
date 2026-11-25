import { revalidatePath } from "next/cache";
import { after } from "next/server";

// 정해진 시각(새벽설교 후 7:10, 자정 직후)에 GitHub Actions가 불러 사이트 전체를 새로 그리게 한다.
// 비밀값 없이 열려 있으므로 같은 인스턴스에서 1분에 한 번만 받는다.
// 새로 그린 뒤 첫 방문자가 오래 기다리지 않도록, 응답을 보낸 다음 주요 화면을 미리 한 번씩 열어 둔다.
let last = 0;
const WARM = ["/", "/blog", "/sermon", "/honey", "/gospel", "/library", "/settle"];
export const maxDuration = 60;

export async function GET(req) {
  const now = Date.now();
  if (now - last < 60000) return Response.json({ ok: false, reason: "too soon" }, { status: 429 });
  last = now;
  revalidatePath("/", "layout");
  const origin = new URL(req.url).origin;
  after(async () => {
    await new Promise((r) => setTimeout(r, 1500));
    await Promise.all(WARM.map((p) => fetch(origin + p, { cache: "no-store" }).catch(() => null)));
  });
  return Response.json({ ok: true, at: new Date(now).toISOString() }, { headers: { "Cache-Control": "no-store" } });
}
