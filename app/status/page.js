import { notionDiagnose } from "../../lib/notion";

export const dynamic = "force-dynamic";
export const metadata = { title: "연결 점검", robots: { index: false, follow: false } };

export default async function Status() {
  const d = await notionDiagnose();
  return (
    <main className="wrap narrow" style={{ paddingTop: 40 }}>
      <h1 className="serif page-title">연결 점검</h1>
      <div className="panel">
        <h3>NOTION_TOKEN</h3>
        <p>{d.token ? "설정됨" : "설정되지 않음 — Vercel 환경변수에 NOTION_TOKEN을 넣고 다시 배포해 주세요."}</p>
      </div>
      {d.steps.map((s) => (
        <div key={s.name} className="panel">
          <h3>{s.name}</h3>
          <p>{s.ok ? "정상 · " : "실패 · "}{s.info}</p>
        </div>
      ))}
    </main>
  );
}
