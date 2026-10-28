import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "../../../components/Header";
import Comments from "../../../components/Comments";
import Footer from "../../../components/Footer";
import { getSermon, fmtDate } from "../../../lib/content";

export const revalidate = 300;

export default async function SermonPage({ params }) {
  const { id } = await params;
  const s = await getSermon(id);
  if (!s) notFound();

  return (
    <>
      <Header />
      <main className="wrap narrow">
        <div className="label">{s.kind} · {s.series}</div>
        <h1 className="serif page-title">{s.title}</h1>
        <div className="date">{fmtDate(s.date)} · {s.passage} · {s.preacher}</div>

        {s.video && (
          <div className="video">
            <iframe src={`https://www.youtube.com/embed/${s.video}`} title={s.title} allowFullScreen loading="lazy" />
          </div>
        )}

        {s.summary && <div className="panel t-read"><h3>설교 요약</h3><p>{s.summary}</p></div>}

        {s.questions?.length > 0 && (
          <div className="panel t-memory">
            <h3>적용 질문</h3>
            <ol>{s.questions.map((q, i) => <li key={i}>{q}</li>)}</ol>
          </div>
        )}

        <div className="panel t-comment">
          <h3>은혜를 나눕니다</h3>
          <Comments target={`sermon:${s.id}`} label={s.title} />
        </div>

        <div className="pn"><Link href={`/d/${s.date}`}>‹ 이 날의 홈</Link><span /><span /></div>
        <Footer />
      </main>
    </>
  );
}
