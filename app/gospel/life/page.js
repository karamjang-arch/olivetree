import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import GospelTabs from "../../../components/GospelTabs";

export const metadata = { title: "가스펠 라이프 · Olive Tree" };

export default function GospelLife() {
  return (
    <>
      <Header />
      <main className="wrap">
        <div className="narrow-top">
          <div className="label">Gospel</div>
          <h1 className="serif page-title">가스펠</h1>
          <GospelTabs active="life" />
        </div>
        <div className="card empty soon">가스펠 라이프는 준비 중입니다.</div>
        <Footer />
      </main>
    </>
  );
}
