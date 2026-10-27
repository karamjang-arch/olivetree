import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import { getSermon, allSermons, fmtDate } from "../../../lib/content";

export function generateStaticParams() {
  return allSermons().map((s) => ({ id: s.id }));
}

export default async function SermonPage({ params }) {
  const { id } = await params;
  const s = getSermon(id);
  if (!s) notFound();

  return (
    <>
      <Header />
      <main className="wrap narrow">
        <div className="label">{s.kind} · {s.series}</div>
        <h1 className="serif page-title">{s.title}</h1>
        <div className="date">{fmtDate(s.date)} · {s.passage} · {s.preacher}</div>

        <div className="video">
          <iframe src={`https://www.youtube.com/embed/${s.video}`} title={s.title} allowFullScreen loading="lazy" />
        </div>

        <div className="panel"><h3>설교 요약</h3><p>{s.summary}</p></div>

        <div className="panel">
          <h3>적용 질문</h3>
          <ol>{s.questions.map((q, i) => <li key={i}>{q}</li>)}</ol>
        </div>

        <div className="pn"><Link href={`/d/${s.date}`}>‹ 이 날의 홈</Link><span /><span /></div>
        <Footer />
      </main>
    </>
  );
}
