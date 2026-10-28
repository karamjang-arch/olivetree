import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "../../../../components/Header";
import Comments from "../../../../components/Comments";
import Footer from "../../../../components/Footer";
import { getBlogPost, blogList } from "../../../../lib/content";
import { metaOf } from "../../../../lib/blog";
import Blocks from "../../../../components/Blocks";
import { PostCard } from "../../../../components/BlogBrowser";

export const revalidate = 300;

export async function generateMetadata({ params }) {
  const { id } = await params;
  const p = await getBlogPost(id);
  if (!p) return { title: "블로그 · Olive Tree" };
  const t = p.series ? `${p.series} ${p.part ? `${p.part}편 ` : ""}· ${p.title}` : p.title;
  return { title: `${t} · Olive Tree`, description: p.subtitle || p.summary, openGraph: { title: t, description: p.subtitle || p.summary } };
}

const NUM = ["", "①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨", "⑩"];

function textOf(blocks = []) {
  let n = 0;
  for (const b of blocks) {
    const d = b[b.type] || {};
    n += (d.rich_text || []).reduce((a, x) => a + x.plain_text.length, 0);
    if (b.kids) n += textOf(b.kids);
  }
  return n;
}

export default async function PostPage({ params }) {
  const { id } = await params;
  const [p, all] = await Promise.all([getBlogPost(id), blogList()]);
  if (!p) notFound();
  const m = metaOf(p.slug);
  const minutes = Math.max(1, Math.round(textOf(p.blocks) / 500));
  const series = p.series ? all.filter((x) => x.series === p.series).sort((a, b) => (a.part ?? 99) - (b.part ?? 99)) : [];
  const idx = series.findIndex((x) => x.id === p.id);
  const prev = idx > 0 ? series[idx - 1] : null;
  const next = idx >= 0 && idx < series.length - 1 ? series[idx + 1] : null;
  const keys = new Set([...(p.topics || []), ...(p.tags || [])]);
  const related = all
    .filter((x) => x.id !== p.id && (!p.series || x.series !== p.series))
    .map((x) => ({ x, s: [...(x.topics || []), ...(x.tags || [])].filter((k) => keys.has(k)).length }))
    .filter((r) => r.s > 0).sort((a, b) => b.s - a.s).slice(0, 3).map((r) => r.x);

  return (
    <>
      <Header />
      <main className="wrap narrow article" style={{ "--hue": m.hue, "--tint": m.tint }}>
        <Link href="/blog" className="back">← 블로그</Link>
        <div className="eyebrow">
          <Link href={`/blog?cat=${p.slug}`}>{m.name}</Link>
          {p.series && <><span className="sep">/</span><Link href={`/blog?series=${encodeURIComponent(p.series)}`}>{p.series}</Link>{p.part ? <span className="partno">{p.part}편</span> : null}</>}
        </div>
        <h1 className="serif post-title">{p.title}</h1>
        {p.subtitle && <p className="post-sub">{p.subtitle}</p>}
        <div className="post-meta">
          <span>{p.created.replaceAll("-", ". ")}</span>
          <span>약 {minutes}분 읽기</span>
          {p.author && <span>{p.author}</span>}
        </div>
        {p.topics?.length > 0 && (
          <div className="topicrow">{p.topics.map((t) => <Link key={t} href={`/blog?topic=${encodeURIComponent(t)}`}>{t}</Link>)}</div>
        )}

        {p.cover && <img className="post-cover" src={`/api/cover/${p.id}`} alt="" />}
        {p.video && <div className="vwrap"><iframe src={`https://www.youtube.com/embed/${p.video}`} allowFullScreen title="영상" /></div>}
        <article className="post">
          <Blocks blocks={p.blocks} />
        </article>

        {(p.tags.length > 0 || p.types.length > 0 || p.bibles?.length > 0) && (
          <div className="post-foot">
            {[...p.types, ...p.tags].length > 0 && (
              <div className="tagrow">{[...p.types, ...p.tags].map((t) => <Link key={t} href={`/blog?tag=${encodeURIComponent(t)}`}>#{t}</Link>)}</div>
            )}
            {p.bibles?.length > 0 && (
              <div className="biblerow"><b>이 글의 성경</b>{p.bibles.map((t) => <Link key={t} href={`/blog?bible=${encodeURIComponent(t)}`}>{t}</Link>)}</div>
            )}
          </div>
        )}

        {p.series && (
          <section className="seriesbox">
            <div className="label">Series</div>
            <h3>{p.series}</h3>
            <ol>
              {series.map((x) => (
                <li key={x.id} className={x.id === p.id ? "on" : ""}>
                  <span className="n">{NUM[x.part] || x.part || "·"}</span>
                  {x.id === p.id ? <span>{x.title}</span> : <Link href={`/blog/p/${x.id}`}>{x.title}</Link>}
                </li>
              ))}
              {!next && <li className="soon"><span className="n">{NUM[(p.part || series.length) + 1] || "·"}</span><span>다음 편을 준비하고 있습니다</span></li>}
            </ol>
            {(prev || next) && (
              <div className="pn">
                {prev ? <Link href={`/blog/p/${prev.id}`}>← 이전 편</Link> : <span />}
                {next ? <Link href={`/blog/p/${next.id}`}>다음 편 →</Link> : <span />}
              </div>
            )}
          </section>
        )}

        <div className="panel t-comment">
          <h3>댓글</h3>
          <Comments target={`blog:${p.id}`} label={p.title} />
        </div>

        {related.length > 0 && (
          <section className="block">
            <div className="label">More</div>
            <h2>함께 읽으면 좋은 글</h2>
            <div className="pgrid">{related.map((x) => <PostCard key={x.id} x={x} />)}</div>
          </section>
        )}
        <Footer />
      </main>
    </>
  );
}
