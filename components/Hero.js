export default function Hero() {
  const d = "M0 50 C150 10 300 90 450 50 S750 10 900 50 S1200 90 1350 50 S1650 10 1800 50 L1800 90 L0 90Z";
  return (
    <div className="hero">
      <svg className="rings" viewBox="0 0 520 520" aria-hidden="true">
        {[60, 110, 160, 210, 255].map((r) => <circle key={r} cx="260" cy="260" r={r} />)}
      </svg>
      <h1 className="serif">Our Daily Bread</h1>
      <p className="lead">예수님의 이야기가 나의 이야기가 되는 하루,</p>
      <p className="lead em">오늘의 일용할 양식을 채웁니다.</p>
      <svg className="wave b" viewBox="0 0 1800 90" preserveAspectRatio="none" aria-hidden="true"><path d={d} /></svg>
      <svg className="wave" viewBox="0 0 1800 90" preserveAspectRatio="none" aria-hidden="true"><path d={d} /></svg>
    </div>
  );
}
