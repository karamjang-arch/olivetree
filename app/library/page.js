import Link from "next/link";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import BookCover from "../../components/BookCover";
import LibraryBrowser from "../../components/LibraryBrowser";
import { libAll } from "../../lib/library";

export const revalidate = 300;
export const metadata = { title: "서재 · Olive Tree", description: "함께 읽고 싶은 책과 우리가 쓴 책" };

export default async function Library() {
  const all = await libAll();
  const ours = all.filter((b) => b.kind === "우리가 쓴 책");
  const books = all.filter((b) => b.kind !== "우리가 쓴 책");
  return (
    <>
      <Header />
      <main className="wrap">
        <div className="narrow-top">
          <div className="label">Library</div>
          <h1 className="serif page-title">서재</h1>
          <p className="muted">한 권을 오래 곁에 두고 읽을 수 있도록, 책마다 읽는 길을 정리해 둡니다.</p>
        </div>

        {ours.length > 0 && (
          <section className="block" id="ours">
            <div className="label">Our Books</div>
            <h2>우리가 쓴 책</h2>
            <div className="ourshelf">
              {ours.map((b) => (
                <Link key={b.id} href={`/library/${b.id}`} className="ourbook">
                  <BookCover b={b} size="lg" />
                  <div>
                    <div className="bk-title big">{b.title}</div>
                    {b.original && <div className="bk-orig">{b.original}</div>}
                    <div className="bk-author">{b.author}</div>
                    {b.line && <p className="bk-line">{b.line}</p>}
                    <span className="more">자세히 →</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="block">
          <div className="label">Shelf</div>
          <h2>함께 읽고 싶은 책</h2>
          {books.length === 0
            ? <div className="panel t-text"><h3>준비 중</h3><p className="muted">한 권씩 정리해 올립니다.</p></div>
            : <LibraryBrowser books={books} />}
        </section>
        <Footer />
      </main>
    </>
  );
}
