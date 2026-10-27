import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "../../../components/Header";
import Quiz from "../../../components/Quiz";
import { getHoneyDay, honeyAudio, honeyNeighbors, honeyDates, fmtDate } from "../../../lib/content";

export const revalidate = 3600;
export function generateStaticParams() {
  return honeyDates().map((date) => ({ date }));
}

export default async function HoneyPage({ params }) {
  const { date } = await params;
  const day = await getHoneyDay(date);
  if (!day) notFound();
  const audio = honeyAudio(date);
  const { prev, next } = honeyNeighbors(date);

  // 퀴즈 근거 구절 (중복 제거)
  const seen = new Set();
  const verses = day.quiz.filter((q) => q.hintRef && !seen.has(q.hintRef) && seen.add(q.hintRef));

  return (
    <>
      <Header />
      <main className="wrap narrow">
        <div className="label">꿀보다성경</div>
        <h1 className="serif page-title">{fmtDate(date)}</h1>

        <div className="panel"><h3>오늘의 읽기</h3><div className="passage">{day.passage}</div></div>

        {audio && (
          <div className="panel">
            <h3>오디오 말씀</h3>
            <iframe className="audio" src={audio} title="오디오 말씀" allow="autoplay" loading="lazy" />
          </div>
        )}

        <div className="panel" id="memory">
          <h3>오늘의 암송</h3>
          <div className="verse">{day.memory.text}</div>
          <div className="cite">{day.memory.cite}</div>
          <p className="closing">{day.memory.closing}</p>
        </div>

        <div className="panel">
          <h3>오늘의 본문</h3>
          <details>
            <summary>퀴즈 근거 구절</summary>
            {verses.map((v) => (
              <p key={v.hintRef} className="hv"><b>{v.hintRef}</b> {v.hintText}</p>
            ))}
          </details>
        </div>

        <div className="panel">
          <h3>꿀퀴즈</h3>
          <Quiz items={day.quiz} />
        </div>

        <div className="pn">
          {prev ? <Link href={`/honey/${prev}`}>‹ 이전 날</Link> : <span />}
          <Link href={`/d/${date}`}>이 날의 홈</Link>
          {next ? <Link href={`/honey/${next}`}>다음 날 ›</Link> : <span />}
        </div>
      </main>
    </>
  );
}
