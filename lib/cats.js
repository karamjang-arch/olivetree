// 설교 종류 → 달력 점 색·필터 분류
export const CATS = {
  dawn:    { label: "새벽", color: "#3f7cac" },
  sunday:  { label: "주일", color: "#d08a2e" },
  friday:  { label: "금요", color: "#8a5a8c" },
  special: { label: "특별", color: "#c4564f" },
  etc:     { label: "기타", color: "#9aa092" },
  recitation: { label: "암송", color: "#b5524a" },
  lecture:    { label: "특강", color: "#2c4f7a" },
  family:     { label: "올리브 가족", color: "#4f9a6a" },
  journal:    { label: "저널", color: "#a8893a" },
};
export const HONEY_COLOR = "#6f9a6a";

export function catOf(kind = "") {
  if (kind === "새벽설교") return "dawn";
  if (kind === "주일설교") return "sunday";
  if (kind === "금요설교") return "friday";
  if (["특별설교", "특별새벽기도회", "부흥회"].includes(kind)) return "special";
  return "etc";
}

export const colorOf = (key) => { const k = key.replace("~", ""); return k === "honey" ? HONEY_COLOR : CATS[k]?.color || "#9aa092"; };
