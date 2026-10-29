import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Calendar from "../../components/Calendar";
import BlogBrowser, { PostCard } from "../../components/BlogBrowser";
import { LatestStack, collapseSeries } from "../../components/PostArt";
import { metaOf } from "../../lib/blog";
import { familyTrips } from "../../lib/trip";
import { blogList, blogEvents, blogLinks, todayKey, cardDecks } from "../../lib/content";

export const revalidate = 300;
export const metadata = { title: "블로그 · Olive Tree" };

export default async function BlogHome() {
  const [posts, decks] = await Promise.all([blogList(), cardDecks()]);
  const recent = collapseSeries(posts).slice(0, 3);
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
            <div className="pgrid">{recent.map((it) => it.post ? <PostCard key={it.post.id} x={it.post} /> : <LatestStack key={it.series.name} s={it.series} m={metaOf(it.series.slug)} />)}</div>
          </section>
        )}

        <section className="block" id="archive">
          <div className="label">Archive</div>
          <h2>모아 보기</h2>
          <BlogBrowser posts={posts} decks={decks} trips={familyTrips(posts)} />
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
