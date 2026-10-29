import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "../../../../components/Header";
import Footer from "../../../../components/Footer";
import { SeriesPoster, groupSeries, bg } from "../../../../components/PostArt";
import TripSeries from "../../../../components/TripSeries";
import { blogList } from "../../../../lib/content";
import { metaOf } from "../../../../lib/blog";
import { tripMap } from "../../../../lib/trip";

export const revalidate = 300;

export async function generateMetadata({ params }) {
  const name = decodeURIComponent((await params).name);
  return { title: `${name} · Olive Tree`, openGraph: { title: name } };
}

export default async function SeriesPage({ params }) {
  const name = decodeURIComponent((await params).name);
  const posts = (await blogList()).filter((p) => p.series === name).sort((a, b) => (a.part ?? 99) - (b.part ?? 99));
  if (!posts.length) notFound();
  const intro = posts.find((p) => p.part === 0);
  const parts = posts.filter((p) => p !== intro);
  const map = tripMap(posts);
  const m = metaOf(posts[0].slug);
  const s = groupSeries(posts)[0];
  const first = parts[0];

  return (
    <>
      <Header />
      <main className="wrap series-page" style={{ "--hue": m.hue, "--tint": m.tint }}>
        <Link href="/blog" className="back">← 블로그</Link>
        <header className={`sp-head${map ? "" : " sp-hero"}`}>
          {!map && (
            <div className={`sp-cover pthumb${s.face ? "" : " none"}`} style={s.face ? { backgroundImage: bg(s.face) } : undefined}>
              {!s.face && <SeriesPoster s={s} m={m} />}
            </div>
          )}
          <div className="sp-headtx">
            <div className="eyebrow"><Link href={`/blog?cat=${posts[0].slug}`}>{m.name}</Link><span className="sep">/</span><span>{map ? "여행 시리즈" : "연재"}</span></div>
            <h1 className="serif post-title">{name}</h1>
            {intro?.subtitle && <p className="post-sub">{intro.subtitle}</p>}
            <p className="sp-meta">{parts.length}편{map ? ` · ${map.stops.map((x) => x.place).filter((v, i, a) => v && a.indexOf(v) === i).length}곳` : first ? ` · ${first.created.replaceAll("-", ". ")}부터` : ""}</p>
            {first && <Link href={`/blog/p/${first.id}`} className="btn primary sp-start">처음부터 읽기 →</Link>}
          </div>
        </header>

        {intro && (intro.video || intro.cover) && (
          <section className="sp-intro">
            {intro.video
              ? <div className="vwrap"><iframe src={`https://www.youtube.com/embed/${intro.video}`} allowFullScreen title="하이라이트" /></div>
              : <img src={`/api/cover/${intro.id}`} alt="" />}
            <div className="sp-introtx">
              <div className="label">Highlight</div>
              <b>{intro.title}</b>
              {intro.summary && <p>{intro.summary}</p>}
              <Link href={`/blog/p/${intro.id}`}>여행을 시작하며 →</Link>
            </div>
          </section>
        )}

        {map ? (
          <section className="block">
            <div className="label">Route</div>
            <h2>여정 지도</h2>
            <p className="muted">핀을 누르면 그곳의 이야기로 이어집니다.</p>
            <TripSeries map={map} />
          </section>
        ) : (
          <section className="block">
            <div className="label">Reading order</div>
            <h2>읽는 순서</h2>
            <ol className="sp-order">
              {parts.map((x) => (
                <li key={x.id}>
                  <Link href={`/blog/p/${x.id}`}>
                    <span className="n">{x.part}</span>
                    <span className="tx">
                      <b>{x.title}</b>
                      {x.subtitle && <i>{x.subtitle}</i>}
                      {x.summary && <span className="sum">{x.summary}</span>}
                    </span>
                    <span className="go">읽기 →</span>
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        )}
        <Footer />
      </main>
    </>
  );
}
