import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "../../../components/Header";
import Comments from "../../../components/Comments";
import Footer from "../../../components/Footer";
import Quiz from "../../../components/Quiz";
import Calendar from "../../../components/Calendar";
import MemoryCards from "../../../components/MemoryCards";
import { chaptersFor } from "../../../lib/scripture";
import {
  getHoneyDay, honeyAudio, honeyNeighbors, honeyDates, honeyMemoryCards, honeyCalendarLinks, calendarEvents, todayKey, fmtDate,
} from "../../../lib/content";

export const revalidate = 3600;
export function generateStaticParams() {
  return honeyDates().map((date) => ({ date }));
}

export default async function HoneyPage({ params }) {
  const { date } = await params;
  const day = await getHoneyDay(date);
  if (!day) notFound();
  const [audio, cards, events] = await Promise.all([honeyAudio(date), honeyMemoryCards(date, day.memory), calendarEvents()]);
  const { prev, next } = honeyNeighbors(date);
  const chapters = chaptersFor(day.passage);

  return (
    <>
      <Header />
      <main className="wrap narrow">
        <div className="label">통독 · 꿀보다성경</div>
        <h1 className="serif page-title">{fmtDate(date)}</h1>

        <div className="panel t-read"><h3>오늘의 읽기</h3><div className="passage">{day.passage}</div></div>

        {audio && (
          <div className="panel t-audio">
            <h3>오디오 말씀</h3>
            <div className="audio-wrap"><iframe className="audio" src={audio} title="오디오 말씀" allow="autoplay" loading="lazy" /></div>
          </div>
        )}

        {chapters.length > 0 && (
          <div className="panel t-text">
            <h3>오늘의 본문 · 개역개정</h3>
            {chapters.map((c) => (
              <details key={`${c.book}${c.chapter}`} className="chap">
                <summary>{c.book} {c.chapter}장</summary>
                <p className="scripture">
                  {c.verses.map((t, i) => (
                    <span key={i}><sup>{i + 1}</sup>{t} </span>
                  ))}
                </p>
              </details>
            ))}
          </div>
        )}

        <div className="panel t-memory" id="memory">
          <h3>오늘의 암송</h3>
          <MemoryCards cards={cards} />
        </div>

        <div className="panel t-quiz">
          <details className="quizbox">
            <summary>꿀퀴즈 · 오늘 읽은 본문으로 푸는 {day.quiz.length}문항</summary>
            <Quiz items={day.quiz} />
          </details>
        </div>

        <div className="panel t-comment">
          <h3>오늘 읽고 나눕니다</h3>
          <Comments target={`honey:${date}`} label={`통독 ${date}`} />
        </div>

        <div className="pn">
          {prev ? <Link href={`/honey/${prev}`}>‹ 이전 날</Link> : <span />}
          <Link href={`/d/${date}`}>이 날의 홈</Link>
          {next ? <Link href={`/honey/${next}`}>다음 날 ›</Link> : <span />}
        </div>

        <section className="block" id="calendar">
          <div className="label">Calendar</div>
          <h2>통독 달력</h2>
          <Calendar events={events} today={todayKey()} selected={date} mode="honey" links={honeyCalendarLinks()} />
        </section>
        <Footer />
      </main>
    </>
  );
}
