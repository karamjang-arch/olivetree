import Link from "next/link";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { sermonList, fmtDate } from "../../lib/content";

export const metadata = { title: "설교 · Olive Tree" };

export const revalidate = 3600;

export default async function SermonList() {
  const all = await sermonList(12);
  const rich = all.filter((s) => s.video);
  const rest = all.filter((s) => !s.video);
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
          {rich.map((s) => (
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
        {rest.length > 0 && (
          <div className="rows">
            <h3 className="rowhead">이전 설교</h3>
            {rest.map((s) => (
              <Link key={s.id} href={`/sermon/${s.id}`} className="row">
                <span className="rd">{s.date}</span>
                <span className="rtitle">{s.title}</span>
                <span className="rp">{s.passage}</span>
              </Link>
            ))}
          </div>
        )}
        <Footer />
      </main>
    </>
  );
}
