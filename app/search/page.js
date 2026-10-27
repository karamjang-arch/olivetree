import Header from "../../components/Header";
import Footer from "../../components/Footer";
import SearchBox from "../../components/SearchBox";

export const metadata = { title: "검색 · Olive Tree", robots: { index: false } };

export default async function SearchPage({ searchParams }) {
  const { q = "" } = await searchParams;
  return (
    <>
      <Header />
      <main className="wrap narrow">
        <div className="narrow-top">
          <div className="label">Search</div>
          <h1 className="serif page-title">검색</h1>
        </div>
        <SearchBox initial={q} />
        <Footer />
      </main>
    </>
  );
}
