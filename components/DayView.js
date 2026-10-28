import Link from "next/link";
import Hero from "./Hero";
import Header from "./Header";
import Calendar from "./Calendar";
import Footer from "./Footer";
import { thumbBg } from "../lib/thumb";
import { getHoneyDay, sermonsOn, calendarEvents, todayKey, fmtDate, blogList } from "../lib/content";
import { metaOf } from "../lib/blog";
import { CATS, catOf, HONEY_COLOR } from "../lib/cats";

// 색 하나로 띠 배경(옅은 색)까지 만든다
const tint = (hex) => `color-mix(in srgb, ${hex} 14%, #fff)`;

export default async function DayView({ date }) {
  const today = todayKey();
  const [honey, sermons, events, posts] = await Promise.all([getHoneyDay(date), sermonsOn(date), calendarEvents(), blogList()]);
  // 그날 올린 글, 그날 쓴 글, 그날을 가리키는 글
  const dayPosts = posts.filter((p) => p.posted === date || p.created === date || p.pinned === date);
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
              <Link key={s.id} href={`/sermon/${s.id}`} className="card sermon tband" style={{ "--hue": CATS[catOf(s.kind)].color, "--tint": tint(CATS[catOf(s.kind)].color) }}>
                <h3 className="bandh">{s.kind}</h3>
                <div className="sgrid">
                <div className="thumb" style={{ backgroundImage: thumbBg(s) }}>
                  <span className="play" aria-hidden="true" />
                </div>
                <div className="body">
                  <div className="ctitle">{s.title}</div>
                  <div className="cmeta">{s.passage} · {s.preacher}</div>
                  {s.summary && <p className="excerpt">{s.summary}</p>}
                </div>
                </div>
              </Link>
            ))}

            {honey && (
              <Link href={`/honey/${date}`} className="card honey tband" style={{ "--hue": HONEY_COLOR, "--tint": tint(HONEY_COLOR) }}>
                <h3 className="bandh">꿀보다성경 · 통독</h3>
                <div className="body">
                  <div className="passage">{honey.passage}</div>
                  <div className="verse sm">“{honey.memory.text}”</div>
                  <div className="cite">{honey.memory.cite}</div>
                  <span className="more">읽고 · 듣고 · 퀴즈 풀기 →</span>
                </div>
              </Link>
            )}

            {dayPosts.map((p) => {
              const m = metaOf(p.slug);
              return (
                <Link key={p.id} href={`/blog/p/${p.id}`} className="card daypost tband" style={{ "--hue": m.hue, "--tint": m.tint }}>
                  <h3 className="bandh">블로그 · {m.name}{p.series ? ` · ${p.series}${p.part ? ` ${p.part}편` : ""}` : ""}</h3>
                  <div className="body">
                    <div className="ctitle">{p.title}</div>
                    {p.subtitle && <div className="cmeta">{p.subtitle}</div>}
                    {p.summary && <p className="excerpt">{p.summary}</p>}
                    <span className="more">읽기 →</span>
                  </div>
                </Link>
              );
            })}

            {!honey && sermons.length === 0 && dayPosts.length === 0 && <div className="card empty">이 날에 올라온 내용이 없습니다.</div>}
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
