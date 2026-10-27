import Link from "next/link";
export default function GospelTabs({ active }) {
  return (
    <div className="tabs page-tabs">
      <Link href="/gospel" className={active === "story" ? "on" : ""}>가스펠 스토리</Link>
      <Link href="/gospel/life" className={active === "life" ? "on" : ""}>가스펠 라이프</Link>
    </div>
  );
}
