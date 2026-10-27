export default function Hero() {
  const d = "M0 50 C150 10 300 90 450 50 S750 10 900 50 S1200 90 1350 50 S1650 10 1800 50 L1800 90 L0 90Z";
  // 빵 윤곽(식빵 모양)과 칼집 선
  const loaf = "M70 150 C42 150 30 118 52 92 C74 52 135 30 210 30 C285 30 346 52 368 92 C390 118 378 150 350 150 L350 208 C350 224 338 234 322 234 L98 234 C82 234 70 224 70 208 Z";
  const cuts = ["M128 74 C140 96 144 116 138 140", "M196 56 C208 84 212 108 206 138", "M264 74 C276 96 280 116 274 140"];
  const paths = [loaf, ...cuts];
  return (
    <div className="hero">
      <svg className="bread" viewBox="0 0 440 270" aria-hidden="true">
        {paths.map((p, i) => <path key={"b" + i} d={p} className="base" />)}
        {paths.map((p, i) => <path key={"g" + i} d={p} className="glow" pathLength="100" style={{ animationDelay: `${i * 0.35}s` }} />)}
      </svg>
      <h1 className="serif">Our Daily Bread</h1>
      <p className="lead">예수님의 이야기가 나의 이야기가 되는 하루,</p>
      <p className="lead em">오늘의 일용할 양식을 채웁니다.</p>
      <svg className="wave b" viewBox="0 0 1800 90" preserveAspectRatio="none" aria-hidden="true"><path d={d} /></svg>
      <svg className="wave" viewBox="0 0 1800 90" preserveAspectRatio="none" aria-hidden="true"><path d={d} /></svg>
    </div>
  );
}
