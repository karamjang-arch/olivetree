import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import Blocks from "../../../components/Blocks";
import BookCover from "../../../components/BookCover";
import Comments from "../../../components/Comments";
import { BookCard } from "../../../components/LibraryBrowser";
import { PostCard } from "../../../components/BlogBrowser";
import { libGet, libAll } from "../../../lib/library";
import { blogList } from "../../../lib/content";

export const revalidate = 300;

export async function generateMetadata({ params }) {
  const { id } = await params;
  const b = await libGet(id);
  return b ? { title: `${b.title} · 서재 · Olive Tree`, description: b.line } : { title: "서재 · Olive Tree" };
}

const headOf = (blocks) => blocks.filter((x) => x.type === "heading_2" || x.type === "heading_1").map((x) => (x[x.type].rich_text || []).map((t) => t.plain_text).join(""));

export default async function Book({ params }) {
  const { id } = await params;
  const [b, all, posts] = await Promise.all([libGet(id), libAll(), blogList()]);
  if (!b) notFound();
  const toc = headOf(b.blocks);
  const withBooks = all.filter((x) => x.id !== b.id && b.withBooks.includes(x.id));
  const related = posts.filter((p) => b.posts.includes(p.id) || p.books?.includes(b.id));
  const facts = [
    ["저자", b.author], ["옮긴이", b.translator], ["출판사", b.publisher], ["출간", b.year], ["쪽수", b.pages ? `${b.pages}쪽` : ""], ["정리한 날", b.noted ? b.noted.replaceAll("-", ". ") : ""],
  ].filter(([, v]) => v);
  return (
    <>
      <Header />
      <main className="wrap bookpage">
        <Link href="/library" className="back">← 서재</Link>
        <section className="bookhero">
          <BookCover b={b} size="xl" />
          <div className="bh-info">
            <div className="label">{b.kind}{b.status === "출간 예정" ? " · 출간 예정" : ""}</div>
            <h1 className="serif post-title">{b.title}</h1>
            {b.original && <div className="bk-orig">{b.original}</div>}
            <dl className="facts">{facts.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
            <div className="bk-chips">{[b.level, ...b.who].filter(Boolean).map((t) => <span key={t}>{t}</span>)}</div>
            {b.buy && <a className="btn primary" href={b.buy} target="_blank" rel="noreferrer">책 구하기</a>}
          </div>
        </section>

        {b.line && (
          <blockquote className="bigline">
            <p>{b.line}</p>
            {b.lineSrc && <cite>{b.lineSrc}</cite>}
          </blockquote>
        )}

        <div className={`bookbody${toc.length > 2 ? " withtoc" : ""}`}>
          {toc.length > 2 && (
            <nav className="btoc" aria-label="차례">
              <div className="label">Contents</div>
              <ol>{toc.map((t) => <li key={t}><a href={`#${encodeURIComponent(t)}`}>{t}</a></li>)}</ol>
            </nav>
          )}
          <article className="post article-body" style={{ "--hue": "#2c4f7a", "--tint": "#e5edf6" }}>
            <Blocks blocks={b.blocks} anchors />
          </article>
        </div>

        {related.length > 0 && (
          <section className="block">
            <div className="label">Blog</div>
            <h2>이 책에 관한 글</h2>
            <div className="pgrid">{related.map((x) => <PostCard key={x.id} x={x} />)}</div>
          </section>
        )}
        {withBooks.length > 0 && (
          <section className="block">
            <div className="label">Shelf</div>
            <h2>함께 읽을 책</h2>
            <div className="shelf">{withBooks.map((x) => <BookCard key={x.id} b={x} />)}</div>
          </section>
        )}
        <div className="panel t-comment">
          <h3>댓글</h3>
          <Comments target={`book:${b.id}`} label={b.title} />
        </div>
        <Footer />
      </main>
    </>
  );
}
