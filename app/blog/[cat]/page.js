import { notFound } from "next/navigation";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import BlogTabs from "../../../components/BlogTabs";
import { BLOG } from "../../../lib/blog";

export function generateStaticParams() {
  return BLOG.filter((b) => !b.ready).map((b) => ({ cat: b.slug }));
}

export default async function BlogCat({ params }) {
  const { cat } = await params;
  const b = BLOG.find((x) => x.slug === cat && !x.ready);
  if (!b) notFound();
  return (
    <>
      <Header />
      <main className="wrap">
        <div className="narrow-top">
          <div className="label">Blog · {b.en}</div>
          <h1 className="serif page-title">{b.title}</h1>
        </div>
        <BlogTabs current={b.slug} />
        <div className="panel" style={{ "--hue": b.hue, "--tint": b.tint }}>
          <h3>준비 중</h3>
          <p className="muted">{b.desc} 곧 글이 올라옵니다.</p>
        </div>
        <Footer />
      </main>
    </>
  );
}
