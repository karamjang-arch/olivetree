import Link from "next/link";
import { BLOG } from "../lib/blog";

export default function BlogTabs({ current }) {
  return (
    <div className="page-tabs">
      <Link href="/blog" className={!current ? "on" : ""}>전체</Link>
      {BLOG.map((b) => <Link key={b.slug} href={b.href} className={current === b.slug ? "on" : ""}>{b.title}</Link>)}
    </div>
  );
}
