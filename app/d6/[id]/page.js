import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import { getD6 } from "../../../lib/content";

export const revalidate = 3600;

export default async function D6Page({ params }) {
  const { id } = await params;
  const d = await getD6(id);
  if (!d) notFound();

  return (
    <>
      <Header />
      <main className="wrap narrow">
        <div className="label">새김 D6 · 말씀 암송</div>
        <h1 className="serif page-title">{d.ref}</h1>

        <div className="panel t-read">
          <div className="verse">{d.verse}</div>
          {d.nkjv && <p className="cite en">{d.nkjv}</p>}
        </div>

        {d.audios?.length > 0 && (
          <div className="panel t-audio">
            <h3>들어 보기</h3>
            {d.audios.map((a) => (
              <div key={a.url} className="aud">
                <div className="cite">{a.label}</div>
                <audio controls preload="none" src={a.url} />
              </div>
            ))}
          </div>
        )}

        {d.sections?.map((s, i) => (
          <div key={s.title} className={`panel ${["t-read", "t-audio", "t-text", "t-memory", "t-quiz"][i % 5]}`}>
            <h3>{s.title}</h3>
            {s.body.split(/\n\s*\n/).map((p, i) => <p key={i} className="para">{p}</p>)}
          </div>
        ))}

        <div className="pn"><Link href="/honey">‹ 통독으로</Link><span /><span /></div>
        <Footer />
      </main>
    </>
  );
}
