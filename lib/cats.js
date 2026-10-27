// 설교 종류 → 달력 점 색·필터 분류
export const CATS = {
  dawn:    { label: "새벽", color: "#3f7cac" },
  sunday:  { label: "주일", color: "#d08a2e" },
  friday:  { label: "금요", color: "#8a5a8c" },
  special: { label: "특별", color: "#c4564f" },
  etc:     { label: "기타", color: "#9aa092" },
};
export const HONEY_COLOR = "#6f9a6a";

export function catOf(kind = "") {
  if (kind === "새벽설교") return "dawn";
  if (kind === "주일설교") return "sunday";
  if (kind === "금요설교") return "friday";
  if (["특별설교", "특별새벽기도회", "부흥회"].includes(kind)) return "special";
  return "etc";
}

export const colorOf = (key) => (key === "honey" ? HONEY_COLOR : CATS[key]?.color || "#9aa092");
