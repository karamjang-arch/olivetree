import { hasNotion, notionLibAll, notionLibPost } from "./notion";

export const COVER = {
  남색: ["#1d3557", "#2c4f7a"], 녹색: ["#2f5d46", "#3f7f5a"], 적갈색: ["#7a2e2a", "#a8473f"],
  황토: ["#7c5a1e", "#a97c2f"], 보라: ["#46386b", "#6a5a9a"], 회청: ["#3c4f5c", "#5b7383"],
};
export const coverOf = (c) => COVER[c] || COVER["남색"];

export async function libAll() {
  if (!hasNotion()) return [];
  try { return await notionLibAll(); } catch (e) { console.error("lib", e.message); return []; }
}
export async function libGet(id) {
  if (!hasNotion()) return null;
  try { return await notionLibPost(id); } catch (e) { console.error("libpost", e.message); return null; }
}
