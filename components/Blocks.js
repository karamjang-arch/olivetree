import Link from "next/link";
import { youtubeId } from "../lib/notion";
import { getSermon, fmtDate } from "../lib/content";
import { thumbBg } from "../lib/thumb";
import { CATS, catOf } from "../lib/cats";

// 설교 링크(/sermon/<id>)만 담은 줄은 썸네일 카드로 보여 준다
const sermonIdOf = (rt = []) => {
  const hit = rt.map((x) => (x.href || "").match(/\/sermon\/([0-9a-f]{32})/)).find(Boolean);
  const len = rt.reduce((a, x) => a + x.plain_text.length, 0);
  return hit && len < 140 ? hit[1] : null;
};

async function SermonCard({ id, rt = [] }) {
  const s = (await getSermon(id)) || { title: rt.map((x) => x.plain_text).join("").trim(), kind: "설교" };
  const c = CATS[catOf(s.kind)] || {};
  return (
    <Link href={`/sermon/${id}`} className="scard">
      <span className="scard-th" style={{ backgroundImage: thumbBg({ ...s, id }) }}><i>▶</i></span>
      <span className="scard-tx">
        <span className="scard-k" style={{ color: c.color }}>{s.kind}</span>
        <b>{s.title}</b>
        <span className="scard-d">{s.date ? `${s.date.slice(0, 4)}년 ${fmtDate(s.date)}` : ""}{s.passage ? ` · ${s.passage}` : ""}</span>
      </span>
    </Link>
  );
}

export const RT = ({ t = [] }) =>
  t.map((x, i) => {
    let n = x.plain_text;
    if (x.annotations?.bold) n = <b>{n}</b>;
    if (x.annotations?.italic) n = <i>{n}</i>;
    if (x.annotations?.code) n = <code>{n}</code>;
    if (x.href) {
      // 사이트 안의 링크는 같은 창에서 연다
      const local = x.href.replace(/^https?:\/\/o-live-tree\.vercel\.app/, "");
      n = local.startsWith("/") ? <a href={local}>{n}</a> : <a href={x.href} target="_blank" rel="noreferrer">{n}</a>;
    }
    if (x.annotations?.color && x.annotations.color !== "default") n = <span className={`c-${x.annotations.color}`}>{n}</span>;
    return <span key={i}>{n}</span>;
  });

function One({ b, anchors }) {
  const d = b[b.type];
  switch (b.type) {
    case "paragraph": if (sermonIdOf(d.rich_text)) return <div className="scards"><SermonCard id={sermonIdOf(d.rich_text)} rt={d.rich_text} /></div>;
      return d.rich_text.length ? <p><RT t={d.rich_text} /></p> : <div className="gap" />;
    case "heading_1": case "heading_2": {
      const id = anchors ? encodeURIComponent(d.rich_text.map((x) => x.plain_text).join("")) : undefined;
      return <h2 className="bh" id={id}><RT t={d.rich_text} /></h2>;
    }
    case "heading_3": return <h3 className="bh"><RT t={d.rich_text} /></h3>;
    case "quote": {
      // "본문 — 이사야 53:6" 꼴이면 출처를 따로 떼어 보여 준다
      const text = d.rich_text.map((x) => x.plain_text).join("");
      const m = text.match(/^([\s\S]+?)\s+[—–-]\s+([가-힣0-9 .:,\-–]+)$/);
      if (m) return <blockquote className="verse"><p>{m[1]}</p><cite>{m[2]}</cite></blockquote>;
      return <blockquote><RT t={d.rich_text} />{b.kids && <Blocks blocks={b.kids} />}</blockquote>;
    }
    case "callout": {
      const tone = (d.color || "default").replace("_background", "");
      const hasKids = b.kids?.length > 0;
      return (
        <aside className={`bcallout tone-${tone}${hasKids ? " titled" : ""}`}>
          {hasKids ? <div className="ctitle2"><RT t={d.rich_text} /></div> : <RT t={d.rich_text} />}
          {hasKids && <Blocks blocks={b.kids} />}
        </aside>
      );
    }
    case "toggle": return <details className="btoggle"><summary><RT t={d.rich_text} /></summary>{b.kids && <Blocks blocks={b.kids} />}</details>;
    case "divider": return <hr />;
    case "image": return (
      <figure>
        <img src={imgSrc(b)} alt={d.caption?.map((x) => x.plain_text).join("") || ""} loading="lazy" />
        {d.caption?.length > 0 && <figcaption><RT t={d.caption} /></figcaption>}
      </figure>
    );
    case "video": case "embed": case "bookmark": {
      const url = d.external?.url || d.url || "";
      const id = youtubeId(url);
      if (id) return <div className="vwrap"><iframe src={`https://www.youtube.com/embed/${id}`} allowFullScreen title="영상" /></div>;
      return b.type === "bookmark" && url ? <p><a href={url} target="_blank" rel="noreferrer">{url}</a></p> : null;
    }
    case "table": {
      const rows = (b.kids || []).map((r) => r.table_row?.cells || []);
      const head = d.has_column_header ? rows[0] : null;
      const body = head ? rows.slice(1) : rows;
      return (
        <table>
          {head && <thead><tr>{head.map((c, i) => <th key={i}><RT t={c} /></th>)}</tr></thead>}
          <tbody>{body.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}><RT t={c} /></td>)}</tr>)}</tbody>
        </table>
      );
    }
    default: return null;
  }
}

const imgSrc = (b) => b.image?.external?.url?.replace(/^https?:\/\/o-live-tree\.vercel\.app/, "") || `/api/img/${b.id.replace(/-/g, "")}`;

// 연속된 목록 항목은 하나의 목록으로 묶는다
export default function Blocks({ blocks, anchors }) {
  const out = [];
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    if (b.type === "image" && blocks[i + 1]?.type === "image") {
      // 이어진 사진은 사진첩처럼 묶는다
      const imgs = [];
      while (i < blocks.length && blocks[i].type === "image") { imgs.push(blocks[i]); i++; }
      i--;
      out.push(
        <div key={b.id} className={`gallery n${imgs.length}`}>
          {imgs.map((x) => (
            <figure key={x.id}>
              <img src={imgSrc(x)} alt={x.image.caption?.map((c) => c.plain_text).join("") || ""} loading="lazy" />
              {x.image.caption?.length > 0 && <figcaption><RT t={x.image.caption} /></figcaption>}
            </figure>
          ))}
        </div>
      );
      continue;
    }
    if (b.type === "bulleted_list_item" || b.type === "numbered_list_item") {
      const type = b.type;
      const items = [];
      while (i < blocks.length && blocks[i].type === type) { items.push(blocks[i]); i++; }
      i--;
      if (items.every((x) => sermonIdOf(x[type].rich_text))) {
        out.push(<div key={b.id} className="scards">{items.map((x) => <SermonCard key={x.id} id={sermonIdOf(x[type].rich_text)} rt={x[type].rich_text} />)}</div>);
        continue;
      }
      const Tag = type === "bulleted_list_item" ? "ul" : "ol";
      out.push(<Tag key={b.id}>{items.map((x) => <li key={x.id}><RT t={x[type].rich_text} />{x.kids && <Blocks blocks={x.kids} />}</li>)}</Tag>);
    } else out.push(<One key={b.id} b={b} anchors={anchors} />);
  }
  return <>{out}</>;
}
