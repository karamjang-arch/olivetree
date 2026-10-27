import Link from "next/link";
import { notFound } from "next/navigation";
import Blocks from "../../../components/Blocks";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import { settleGet, settleCat } from "../../../lib/settle";

export const revalidate = 600;

const LIFE = { yearly: "매년 바뀔 수 있는 내용입니다", monthly: "자주 바뀌는 내용입니다", evergreen: "", stable: "" };

export default async function SettlePage({ params }) {
  const { id } = await params;
  const x = await settleGet(id);
  if (!x) notFound();
  const c = settleCat(x.category);
  return (
    <>
      <Header />
      <main className="wrap narrow">
        <Link href="/settle" className="back">← 정착</Link>
        <div className="label" style={{ color: c.hue }}>{c.name} · {x.sub}</div>
        <h1 className="serif page-title">{x.title}</h1>
        <p className="lead-sum">{x.summary}</p>
        <div className="pdate">확인한 날 {x.verified}{LIFE[x.shelf] ? ` · ${LIFE[x.shelf]}` : ""}</div>

        <article className="post md" style={{ "--hue": c.hue, "--tint": c.tint }}><Blocks blocks={x.blocks} /></article>

        {x.links?.length > 0 && (
          <div className="panel t-read" style={{ "--hue": c.hue, "--tint": c.tint }}>
            <h3>공식 링크</h3>
            <div className="btns">
              {x.links.map((l) => <a key={l.url} className="btn" href={l.url} target="_blank" rel="noreferrer">{l.label || l.url}</a>)}
            </div>
          </div>
        )}
        <p className="muted tiny" style={{ marginTop: 24 }}>사실 확인을 거쳤지만 제도와 요금은 바뀔 수 있습니다. 중요한 결정 전에는 공식 링크에서 최신 내용을 확인해 주세요.</p>
        <Footer />
      </main>
    </>
  );
}
