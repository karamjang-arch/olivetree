import Link from "next/link";
import { notFound } from "next/navigation";
import { getBook } from "../../../../lib/books";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const b = getBook(slug);
  return { title: b ? `${b.ko.title} · Olive Tree` : "Olive Tree" };
}

export default async function Reader({ params, searchParams }) {
  const { slug } = await params;
  const sp = await searchParams;
  const b = getBook(slug);
  if (!b) notFound();
  const lang = sp?.lang === "en" && b.en ? "en" : "ko";
  const cur = b[lang];

  return (
    <div className="reader">
      <div className="reader-bar">
        <Link href={b.series === "life" ? "/gospel/life" : "/gospel"}>‹ 가스펠</Link>
        <span className="rt">{cur.title}</span>
        <span className="rl">
          <Link href={`/gospel/read/${slug}?lang=ko`} className={lang === "ko" ? "on" : ""}>KO</Link>
          {b.en && <Link href={`/gospel/read/${slug}?lang=en`} className={lang === "en" ? "on" : ""}>EN</Link>}
          <a href={cur.file} target="_blank" rel="noreferrer">새 창</a>
        </span>
      </div>
      <iframe key={cur.file} src={cur.file} title={cur.title} className="reader-frame" />
    </div>
  );
}
