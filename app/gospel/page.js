import Link from "next/link";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import GospelTabs from "../../components/GospelTabs";
import { allBooks } from "../../lib/books";

export const metadata = { title: "가스펠 스토리 · Olive Tree" };

export default function GospelStory() {
  const books = allBooks().filter((b) => b.series === "story");
  return (
    <>
      <Header />
      <main className="wrap">
        <div className="narrow-top">
          <div className="label">Gospel</div>
          <h1 className="serif page-title">가스펠</h1>
          <GospelTabs active="story" />
        </div>
        <div className="cards list">
          {books.map((b) => (
            <div key={b.slug} className={`card book ${b.kind === "교재" ? "t-text" : "t-audio"}`}>
              <h3 className="bandh">{b.kind === "교재" ? "가스펠 교재" : "가스펠 스토리 · 책"}</h3>
              <div className="body">
                <div className="ctitle">{b.ko.title}</div>
                <div className="cmeta">{b.en.title}</div>
                <p className="excerpt">{b.blurb}</p>
                <div className="btns">
                  <Link className="btn primary" href={`/gospel/read/${b.slug}?lang=ko`}>한국어로 읽기</Link>
                  <Link className="btn" href={`/gospel/read/${b.slug}?lang=en`}>Read in English</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        <Footer />
      </main>
    </>
  );
}
