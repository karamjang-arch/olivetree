import Link from "next/link";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import { d6List } from "../../../lib/content";

export const revalidate = 3600;
export const metadata = { title: "암송 · Olive Tree" };

export default async function Recitation() {
  const cards = await d6List();
  return (
    <>
      <Header />
      <main className="wrap">
        <div className="narrow-top">
          <div className="label">Blog · Memory</div>
          <h1 className="serif page-title">암송</h1>
        </div>
        <Link href="/blog" className="back">← 블로그로</Link>

        <section className="block">
          <div className="label">새김 D6</div>
          <h2>말씀 카드</h2>
          <div className="mcards grid">
            {cards.map((c) => (
              <Link key={c.id} href={`/d6/${c.id}`} className="card mcard">
                <div className="mref">{c.ref}</div>
                <div className="mtext">{c.text}</div>
                <span className="more">새김D6 자세히 →</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="block">
          <div className="label">Card News</div>
          <h2>카드뉴스</h2>
          <div className="panel t-text"><h3>준비 중</h3><p className="muted">카드뉴스가 올라오면 이곳에 함께 모입니다.</p></div>
        </section>
        <Footer />
      </main>
    </>
  );
}
