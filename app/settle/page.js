import Header from "../../components/Header";
import Footer from "../../components/Footer";
import SettleBrowser from "../../components/SettleBrowser";
import { settleAll } from "../../lib/settle";

export const metadata = { title: "정착 · Olive Tree" };

export const revalidate = 600;

export default async function Settle() {
  const items = (await settleAll()).map(({ id, category, sub, title, summary, verified, church }) => ({ id, category, sub, title, summary, verified, church }));
  return (
    <>
      <Header />
      <main className="wrap">
        <div className="narrow-top">
          <div className="label">Settle in</div>
          <h1 className="serif page-title">정착</h1>
          <p className="muted">퍼듀에 새로 오신 분들을 위한 안내입니다. 공식 자료로 사실 확인을 마친 내용만 올립니다.</p>
        </div>
        <SettleBrowser items={items} />
        <Footer />
      </main>
    </>
  );
}
