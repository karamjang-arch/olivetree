import { hasNotion, notionSettleAll, notionSettlePost } from "./notion";

export { SETTLE_CATS, settleCat } from "./settle-cats";

// 검증을 마친(공개 체크된) 안내만 노션에서 읽는다
export async function settleAll() {
  if (!hasNotion()) return [];
  try { return await notionSettleAll(); } catch (e) { console.error("settle", e.message); return []; }
}
export async function settleGet(id) {
  if (!hasNotion()) return null;
  try { return await notionSettlePost(id); } catch (e) { console.error("settlepost", e.message); return null; }
}
