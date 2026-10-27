import Header from "../../components/Header";
import Footer from "../../components/Footer";

export const metadata = { title: "브나야 · Olive Tree" };

export default function Benaiah() {
  return (
    <>
      <Header />
      <main className="wrap">
        <div className="narrow-top">
          <div className="label">Benaiah</div>
          <h1 className="serif page-title">브나야</h1>
        </div>
        <div className="panel t-text">
          <h3>브나야의 법칙</h3>
          <p className="muted">곧 출판될 『브나야의 법칙』과 관련된 이야기를 이곳에 모읍니다. 준비되는 대로 올라옵니다.</p>
        </div>
        <Footer />
      </main>
    </>
  );
}
