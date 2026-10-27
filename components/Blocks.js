import { youtubeId } from "../lib/notion";

export const RT = ({ t = [] }) =>
  t.map((x, i) => {
    let n = x.plain_text;
    if (x.annotations?.bold) n = <b>{n}</b>;
    if (x.annotations?.italic) n = <i>{n}</i>;
    if (x.annotations?.code) n = <code>{n}</code>;
    if (x.href) n = <a href={x.href} target="_blank" rel="noreferrer">{n}</a>;
    return <span key={i}>{n}</span>;
  });

function One({ b }) {
  const d = b[b.type];
  switch (b.type) {
    case "paragraph": return d.rich_text.length ? <p><RT t={d.rich_text} /></p> : <div className="gap" />;
    case "heading_1": case "heading_2": return <h2 className="bh"><RT t={d.rich_text} /></h2>;
    case "heading_3": return <h3 className="bh"><RT t={d.rich_text} /></h3>;
    case "quote": return <blockquote><RT t={d.rich_text} /></blockquote>;
    case "callout": return <div className="bcallout"><RT t={d.rich_text} />{b.kids && <Blocks blocks={b.kids} />}</div>;
    case "toggle": return <details className="btoggle"><summary><RT t={d.rich_text} /></summary>{b.kids && <Blocks blocks={b.kids} />}</details>;
    case "divider": return <hr />;
    case "image": return (
      <figure>
        <img src={`/api/img/${b.id.replace(/-/g, "")}`} alt="" loading="lazy" />
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

// 연속된 목록 항목은 하나의 목록으로 묶는다
export default function Blocks({ blocks }) {
  const out = [];
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    if (b.type === "bulleted_list_item" || b.type === "numbered_list_item") {
      const type = b.type;
      const items = [];
      while (i < blocks.length && blocks[i].type === type) { items.push(blocks[i]); i++; }
      i--;
      const Tag = type === "bulleted_list_item" ? "ul" : "ol";
      out.push(<Tag key={b.id}>{items.map((x) => <li key={x.id}><RT t={x[type].rich_text} />{x.kids && <Blocks blocks={x.kids} />}</li>)}</Tag>);
    } else out.push(<One key={b.id} b={b} />);
  }
  return <>{out}</>;
}
