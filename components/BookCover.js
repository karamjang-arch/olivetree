import { coverOf } from "../lib/library";

// 출판사 표지 대신 쓰는 타이포 표지 (책등 느낌)
export default function BookCover({ b, size = "md" }) {
  const [c1, c2] = coverOf(b.color);
  return (
    <div className={`bcover ${size}`} style={{ "--c1": c1, "--c2": c2 }} aria-label={`${b.title} 표지`}>
      <span className="spine" />
      <div className="bc-in">
        <div className="bc-rule" />
        <div className="bc-title">{b.title}</div>
        {b.original && <div className="bc-orig">{b.original}</div>}
        <div className="bc-author">{b.author}</div>
      </div>
      {b.status === "출간 예정" && <span className="bc-soon">출간 예정</span>}
    </div>
  );
}
