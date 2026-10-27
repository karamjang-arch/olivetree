import Link from "next/link";
export default function Header() {
  return (
    <header className="top">
      <div className="wrap">
        <Link href="/" className="logo">Olive Tree</Link>
        <nav>
          <Link href="/">오늘</Link>
          <Link href="/sermon">설교</Link>
          <Link href="/honey">통독</Link>
          <Link href="/gospel">가스펠</Link>
          <Link href="/#calendar">달력</Link>
        </nav>
      </div>
    </header>
  );
}
