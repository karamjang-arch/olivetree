import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Calendar from "../../components/Calendar";
import BlogBrowser, { PostCard } from "../../components/BlogBrowser";
import { blogList, blogEvents, blogLinks, todayKey } from "../../lib/content";

export const revalidate = 600;
export const metadata = { title: "블로그 · Olive Tree" };

export default async function BlogHome() {
  const posts = await blogList();
  const recent = posts.slice(0, 3);
  return (
    <>
      <Header />
      <main className="wrap">
        <div className="narrow-top">
          <div className="label">Blog</div>
          <h1 className="serif page-title">블로그</h1>
        </div>

        {recent.length > 0 && (
          <section className="block">
            <div className="label">Latest</div>
            <h2>최근 올린 글</h2>
            <div className="pgrid">{recent.map((x) => <PostCard key={x.id} x={x} />)}</div>
          </section>
        )}

        <section className="block">
          <div className="label">Archive</div>
          <h2>모아 보기</h2>
          <BlogBrowser posts={posts} />
        </section>

        <section className="block" id="calendar">
          <div className="label">Calendar</div>
          <h2>블로그 달력</h2>
          <p className="muted">속이 찬 점은 글을 쓴 날, 빈 점은 글이 가리키는 날입니다.</p>
          <Calendar events={blogEvents(posts)} today={todayKey()} mode="blog" links={blogLinks(posts)} />
        </section>
        <Footer />
      </main>
    </>
  );
}
