import Link from "next/link";
export default function Header() {
  return (
    <header className="top">
      <div className="wrap">
        <Link href="/" className="logo">Olive Tree</Link>
        <nav>
          <Link href="/">오늘</Link>
          <Link href="/#calendar">달력</Link>
        </nav>
      </div>
    </header>
  );
}
