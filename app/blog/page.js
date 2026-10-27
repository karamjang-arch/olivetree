import Link from "next/link";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import BlogTabs from "../../components/BlogTabs";
import { BLOG } from "../../lib/blog";

export const metadata = { title: "블로그 · Olive Tree" };

export default function BlogHome() {
  return (
    <>
      <Header />
      <main className="wrap">
        <div className="narrow-top">
          <div className="label">Blog</div>
          <h1 className="serif page-title">블로그</h1>
        </div>
        <BlogTabs />
        <div className="cards two">
          {BLOG.map((b) => (
            <Link key={b.slug} href={b.href} className="card book" style={{ "--hue": b.hue, "--tint": b.tint }}>
              <h3 className="bandh">{b.en}</h3>
              <div className="body">
                <div className="ctitle">{b.title}</div>
                <p className="excerpt">{b.desc}</p>
                {!b.ready && <div className="cmeta">준비 중</div>}
              </div>
            </Link>
          ))}
        </div>
        <Footer />
      </main>
    </>
  );
}
