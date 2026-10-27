// 노션 "카테고리" 값 ↔ 사이트 분류
export const BLOG = [
  { slug: "recitation", name: "암송", en: "Memory", hue: "#b5524a", tint: "#f6e6e1", desc: "새김D6 말씀 카드와 카드뉴스" },
  { slug: "lecture", name: "특강", en: "Lectures", hue: "#2c4f7a", tint: "#e5edf6", desc: "배운 주제와 가르친 주제" },
  { slug: "family", name: "올리브 가족", en: "Olive Family", hue: "#3f7f5a", tint: "#e4efe8", desc: "우리 가족의 사진과 이야기" },
  { slug: "book", name: "도서", en: "Books", hue: "#6a5a9a", tint: "#ece8f5", desc: "읽은 책, 추천하는 책" },
  { slug: "journal", name: "저널", en: "Journal", hue: "#8a6a2d", tint: "#f4ecd8", desc: "일상과 영적 여정의 기록" },
];
export const slugOf = (name) => BLOG.find((b) => b.name === name)?.slug || "journal";
export const metaOf = (slug) => BLOG.find((b) => b.slug === slug) || BLOG[4];
