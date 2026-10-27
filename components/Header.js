import Link from "next/link";
import { BREAD, OLIVE } from "../lib/bread";

export default function Header() {
  return (
    <header className="top">
      <div className="wrap">
        <Link href="/" className="logo">Olive Tree</Link>
        <Link href="/" className="brand" aria-label="Our Daily Bread">
          <svg viewBox="0 0 1040 760" aria-hidden="true">
            {BREAD.map((p, i) => <path key={"b" + i} d={p} className="base" />)}
            <path d={OLIVE} className="glow" pathLength="100" />
          </svg>
          <span>Our Daily Bread</span>
        </Link>
        <nav>
          <Link href="/">오늘</Link>
          <Link href="/sermon">설교</Link>
          <Link href="/honey">통독</Link>
          <Link href="/gospel">가스펠</Link>
          <Link href="/benaiah">브나야</Link>
          <Link href="/blog">블로그</Link>
          <Link href="/settle">정착</Link>
          <Link href="/search" className="sicon" aria-label="검색"><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg></Link>
        </nav>
      </div>
    </header>
  );
}
