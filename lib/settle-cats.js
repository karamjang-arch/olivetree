export const SETTLE_CATS = [
  { key: "arrival", name: "도착", hue: "#2c4f7a", tint: "#e5edf6" },
  { key: "admin", name: "행정", hue: "#8a6a2d", tint: "#f4ecd8" },
  { key: "housing", name: "주거", hue: "#3f7f5a", tint: "#e4efe8" },
  { key: "daily_life", name: "생활", hue: "#b5524a", tint: "#f6e6e1" },
  { key: "education", name: "교육", hue: "#6a5a9a", tint: "#ece8f5" },
  { key: "healthcare", name: "의료", hue: "#2f7f8f", tint: "#e0f0f2" },
  { key: "pro_tips", name: "꿀팁", hue: "#9a6a2d", tint: "#f6ead8" },
];
export const settleCat = (k) => SETTLE_CATS.find((c) => c.key === k) || SETTLE_CATS[0];
