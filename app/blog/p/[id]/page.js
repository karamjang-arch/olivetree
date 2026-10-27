import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "../../../../components/Header";
import Comments from "../../../../components/Comments";
import Footer from "../../../../components/Footer";
import { getBlogPost } from "../../../../lib/content";
import { metaOf } from "../../../../lib/blog";
import { youtubeId } from "../../../../lib/notion";

export const revalidate = 600;

const RT = ({ t = [] }) =>
  t.map((x, i) => {
    let n = x.plain_text;
    if (x.annotations?.bold) n = <b>{n}</b>;
    if (x.annotations?.italic) n = <i>{n}</i>;
    if (x.href) n = <a href={x.href} target="_blank" rel="noreferrer">{n}</a>;
    return <span key={i}>{n}</span>;
  });

function Block({ b }) {
  const d = b[b.type];
  switch (b.type) {
    case "paragraph": return d.rich_text.length ? <p><RT t={d.rich_text} /></p> : <div className="gap" />;
    case "heading_1": case "heading_2": return <h2 className="bh"><RT t={d.rich_text} /></h2>;
    case "heading_3": return <h3 className="bh"><RT t={d.rich_text} /></h3>;
    case "bulleted_list_item": return <li><RT t={d.rich_text} /></li>;
    case "numbered_list_item": return <li><RT t={d.rich_text} /></li>;
    case "quote": return <blockquote><RT t={d.rich_text} /></blockquote>;
    case "callout": return (
      <div className="bcallout"><RT t={d.rich_text} />{b.kids?.map((k) => <Block key={k.id} b={k} />)}</div>
    );
    case "divider": return <hr />;
    case "image": return (
      <figure>
        <img src={`/api/img/${b.id.replace(/-/g, "")}`} alt="" loading="lazy" />
        {d.caption?.length > 0 && <figcaption><RT t={d.caption} /></figcaption>}
      </figure>
    );
    case "video": case "embed": {
      const id = youtubeId(d.external?.url || d.url || "");
      return id ? <div className="vwrap"><iframe src={`https://www.youtube.com/embed/${id}`} allowFullScreen title="영상" /></div> : null;
    }
    default: return null;
  }
}

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
          {p.blocks.map((b) => <Block key={b.id} b={b} />)}
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
