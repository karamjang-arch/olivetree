import Link from "next/link";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Calendar from "../../components/Calendar";
import SermonBrowser from "../../components/SermonBrowser";
import { thumbBg } from "../../lib/thumb";
import { sermonList, sermonFeatured, sermonCalendarLinks, calendarEvents, todayKey, fmtDate } from "../../lib/content";

export const metadata = { title: "설교 · Olive Tree" };
export const revalidate = 300;

function Feature({ label, s }) {
  if (!s) return null;
  return (
    <Link href={`/sermon/${s.id}`} className="card vcard">
      <div className="thumb" style={{ backgroundImage: thumbBg(s) }}>
        <span className="play" aria-hidden="true" />
      </div>
      <div className="body">
        <h3>{label}</h3>
        <div className="ctitle">{s.title}</div>
        <div className="cmeta">{fmtDate(s.date)} · {s.passage}</div>
        {s.summary && <p className="excerpt">{s.summary}</p>}
      </div>
    </Link>
  );
}

export default async function SermonPage() {
  const today = todayKey();
  const [{ dawn, sunday }, all, events, links] = await Promise.all([
    sermonFeatured(), sermonList(0), calendarEvents(), sermonCalendarLinks(),
  ]);
  const dawnLabel = dawn?.date === today ? "오늘의 새벽설교" : "최근 새벽설교";
  const sunLabel = "최근 주일설교";

  return (
    <>
      <Header />
      <main className="wrap">
        <div className="narrow-top">
          <div className="label">Sermons</div>
          <h1 className="serif page-title">설교</h1>
        </div>

        <div className="cards two">
          <Feature label={dawnLabel} s={dawn} />
          <Feature label={sunLabel} s={sunday} />
        </div>

        <section className="block" id="calendar">
          <div className="label">Calendar</div>
          <h2>설교 달력</h2>
          <p className="date">날짜를 누르면 그날의 설교로 이동합니다.</p>
          <Calendar events={events} today={today} mode="sermon" links={links} />
        </section>

        <section className="block" id="all">
          <div className="label">Archive</div>
          <h2>전체 설교</h2>
          <SermonBrowser sermons={all} />
        </section>
        <Footer />
      </main>
    </>
  );
}
