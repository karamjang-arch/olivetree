import Link from "next/link";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { allSermons, fmtDate } from "../../lib/content";

export const metadata = { title: "설교 · Olive Tree" };

export default function SermonList() {
  const list = [...allSermons()].sort((a, b) => b.date.localeCompare(a.date));
  return (
    <>
      <Header />
      <main className="wrap">
        <div className="narrow-top">
          <div className="label">Sermons</div>
          <h1 className="serif page-title">설교</h1>
          <p className="date">영상과 설교 요약, 적용 질문을 함께 봅니다.</p>
        </div>
        <div className="cards list">
          {list.map((s) => (
            <Link key={s.id} href={`/sermon/${s.id}`} className="card vcard">
              <div className="thumb" style={{ backgroundImage: `url(https://img.youtube.com/vi/${s.video}/hqdefault.jpg)` }}>
                <span className="play" aria-hidden="true" />
              </div>
              <div className="body">
                <h3>{s.kind} · {fmtDate(s.date)}</h3>
                <div className="ctitle">{s.title}</div>
                <div className="cmeta">{s.passage} · {s.preacher}</div>
                <p className="excerpt">{s.summary}</p>
              </div>
            </Link>
          ))}
        </div>
        <Footer />
      </main>
    </>
  );
}
