import { getDay, todayKey } from "../lib/honey";

function Waves() {
  const d = "M0 50 C150 10 300 90 450 50 S750 10 900 50 S1200 90 1350 50 S1650 10 1800 50 L1800 90 L0 90Z";
  return (
    <>
      <svg className="wave b" viewBox="0 0 1800 90" preserveAspectRatio="none"><path d={d} /></svg>
      <svg className="wave" viewBox="0 0 1800 90" preserveAspectRatio="none"><path d={d} /></svg>
    </>
  );
}

export default async function Home() {
  const key = todayKey();
  const day = await getDay(key);
  const [y, m, d] = key.split("-");

  return (
    <>
      <header className="top">
        <div className="wrap">
          <span className="logo">Olive Tree</span>
          <nav>
            <a href="#today">오늘</a>
            <a href="#word">말씀</a>
            <a href="#honey">꿀보다성경</a>
          </nav>
        </div>
      </header>

      <main className="wrap">
        <div className="hero">
          <svg className="rings" viewBox="0 0 520 520">
            {[60, 110, 160, 210, 255].map((r) => <circle key={r} cx="260" cy="260" r={r} />)}
          </svg>
          <div className="eyebrow">Our Daily Bread</div>
          <h1>
            말씀 곁에서 걷는 하루,
            <em>한 해를 함께 읽습니다</em>
          </h1>
          <p>꿀보다성경 · 공동체 성경읽기와 설교, 새김 D6 암송을 한곳에서 만납니다.</p>
          <Waves />
        </div>

        <section className="block" id="today">
          <div className="label">Today</div>
          <h2>오늘의 꿀보다성경</h2>
          <div className="date">{Number(m)}월 {Number(d)}일</div>

          {day ? (
            <div className="grid">
              <div className="card">
                <h3>오늘의 읽기</h3>
                <div className="passage">{day.passage}</div>
                <div className="btns">
                  <a className="btn primary" href={`https://karamjang-arch.github.io/honeybible/#${key}`} target="_blank" rel="noreferrer">꿀퀴즈 풀기</a>
                </div>
              </div>
              <div className="card">
                <h3>오늘의 암송</h3>
                <div className="verse">{day.memory.text}</div>
                <div className="cite">{day.memory.cite}</div>
                <p className="closing">{day.memory.closing}</p>
              </div>
            </div>
          ) : (
            <div className="card">오늘의 읽기를 불러오지 못했습니다.</div>
          )}
        </section>

        <footer>© {y} Olive Tree · 장가람</footer>
      </main>
    </>
  );
}
