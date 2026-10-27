import Link from "next/link";
import Hero from "./Hero";
import Header from "./Header";
import Calendar from "./Calendar";
import Footer from "./Footer";
import { thumbBg } from "../lib/thumb";
import { getHoneyDay, sermonsOn, calendarEvents, todayKey, fmtDate } from "../lib/content";

export default async function DayView({ date }) {
  const today = todayKey();
  const [honey, sermons, events] = await Promise.all([getHoneyDay(date), sermonsOn(date), calendarEvents()]);
  const isToday = date === today;

  return (
    <>
      <Header />
      <main className="wrap">
        <Hero />

        <section className="block" id="today">
          <div className="label">{isToday ? "Today" : "Day"}</div>
          <h2>{isToday ? "오늘" : fmtDate(date)}</h2>
          <div className="date">{fmtDate(date)}</div>

          <div className="cards">
            {sermons.map((s) => (
              <Link key={s.id} href={`/sermon/${s.id}`} className="card sermon">
                <div className="thumb" style={{ backgroundImage: thumbBg(s) }}>
                  <span className="play" aria-hidden="true" />
                </div>
                <div className="body">
                  <h3>{s.kind}</h3>
                  <div className="ctitle">{s.title}</div>
                  <div className="cmeta">{s.passage} · {s.preacher}</div>
                  {s.summary && <p className="excerpt">{s.summary}</p>}
                </div>
              </Link>
            ))}

            {honey && (
              <Link href={`/honey/${date}`} className="card honey">
                <div className="body">
                  <h3>꿀보다성경</h3>
                  <div className="passage">{honey.passage}</div>
                  <div className="verse sm">“{honey.memory.text}”</div>
                  <div className="cite">{honey.memory.cite}</div>
                  <span className="more">읽고 · 듣고 · 퀴즈 풀기 →</span>
                </div>
              </Link>
            )}

            {!honey && sermons.length === 0 && <div className="card empty">이 날에 올라온 내용이 없습니다.</div>}
          </div>
        </section>

        <section className="block" id="calendar">
          <div className="label">Calendar</div>
          <h2>달력으로 보기</h2>
          <p className="date">날짜를 누르면 그날의 말씀으로 이동합니다.</p>
          <Calendar events={events} today={today} selected={date} />
        </section>

        <Footer />
      </main>
    </>
  );
}
