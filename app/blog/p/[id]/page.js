import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "../../../../components/Header";
import Comments from "../../../../components/Comments";
import Footer from "../../../../components/Footer";
import { getBlogPost } from "../../../../lib/content";
import { metaOf } from "../../../../lib/blog";
import Blocks from "../../../../components/Blocks";

export const revalidate = 600;

export default async function PostPage({ params }) {
  const { id } = await params;
  const p = await getBlogPost(id);
  if (!p) notFound();
  const m = metaOf(p.slug);
  return (
    <>
      <Header />
      <main className="wrap narrow">
        <Link href="/blog" className="back">← 블로그</Link>
        <div className="label" style={{ color: m.hue }}>{m.name}</div>
        <h1 className="serif page-title">{p.title}</h1>
        <div className="pdate">쓴 날 {p.created}{p.pinned && p.pinned !== p.created ? ` · 지정한 날 ${p.pinned}` : ""}</div>

        {p.video && <div className="vwrap"><iframe src={`https://www.youtube.com/embed/${p.video}`} allowFullScreen title="영상" /></div>}
        <article className="post" style={{ "--hue": m.hue, "--tint": m.tint }}>
          <Blocks blocks={p.blocks} />
        </article>
        {(p.types.length > 0 || p.tags.length > 0) && (
          <div className="tagrow">{[...p.types, ...p.tags].map((t) => <span key={t}>#{t}</span>)}</div>
        )}
        <div className="panel t-comment" style={{ "--hue": m.hue, "--tint": m.tint }}>
          <h3>댓글</h3>
          <Comments target={`blog:${p.id}`} label={p.title} />
        </div>
        <Footer />
      </main>
    </>
  );
}
