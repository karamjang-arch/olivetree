import { revalidatePath } from "next/cache";

// 정해진 시각(새벽설교 후 7:10, 자정 직후)에 GitHub Actions가 불러 사이트 전체를 새로 그리게 한다.
// 비밀값 없이 열려 있으므로 같은 인스턴스에서 1분에 한 번만 받는다.
let last = 0;

export async function GET() {
  const now = Date.now();
  if (now - last < 60000) return Response.json({ ok: false, reason: "too soon" }, { status: 429 });
  last = now;
  revalidatePath("/", "layout");
  return Response.json({ ok: true, at: new Date(now).toISOString() }, { headers: { "Cache-Control": "no-store" } });
}
