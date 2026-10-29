import Link from "next/link";
import { sermonMeta, blogList, fmtDate, cardDecks } from "../lib/content";
import { libAll } from "../lib/library";
import { settleAll, settleCat } from "../lib/settle";
import { allBooks } from "../lib/books";
import { metaOf } from "../lib/blog";
import { CATS, catOf } from "../lib/cats";
import { thumbBg } from "../lib/thumb";
import { Poster, bg } from "./PostArt";
import BookCover from "./BookCover";

// 홈 포털: 최근 소식 한눈에
export default async function HomeLatest({ today }) {
  const [sermons, posts, lib, settle, decks] = await Promise.all([sermonMeta(), blogList(), libAll(), settleAll(), cardDecks()]);
  const deckList = decks.slice(0, 3).map((d) => ({ ...posts.find((p) => p.id === d.id), count: d.count })).filter((d) => d.id);
  const [deck, ...otherDecks] = deckList; // 가장 최근 카드뉴스 + 그 옆에 두 편
  const recentSermons = sermons.filter((s) => s.date <= today).slice(0, 4);
  const [lead, ...morePosts] = posts;
  const book = lib.find((b) => b.kind !== "우리가 쓴 책") || lib[0];
  const ours = lib.find((b) => b.kind === "우리가 쓴 책");
  const newSettle = [...settle].sort((a, b) => (b.verified || "").localeCompare(a.verified || "")).slice(0, 5);
  const gospel = allBooks();

  return (
    <section className="block latest">
      <div className="label">What&apos;s new</div>
      <h2>새 소식</h2>

      <div className="portal">
        {lead && (() => {
          const m = metaOf(lead.slug);
          const has = lead.cover || lead.video;
          return (
            <Link href={`/blog/p/${lead.id}`} className="pt-lead" style={{ "--hue": m.hue, "--tint": m.tint }}>
              <div className={`pt-img${has ? "" : " none"}`} style={has ? { backgroundImage: bg(lead) } : undefined}>
                {!has && <Poster x={lead} m={m} />}
                <span className="pt-badge">블로그 · {m.name}</span>
              </div>
              <div className="pt-body">
                <div className="pt-title">{lead.title}</div>
                {lead.subtitle && <div className="pt-sub">{lead.subtitle}</div>}
                {lead.summary && <p className="pt-sum">{lead.summary}</p>}
                <div className="pt-date">{lead.created.replaceAll("-", ". ")}</div>
              </div>
            </Link>
          );
        })()}

        <div className="pt-side">
          <div className="pt-head"><b>최근 설교</b><Link href="/sermon">전체 보기 →</Link></div>
          <ul className="pt-sermons">
            {recentSermons.map((s) => {
              const c = CATS[catOf(s.kind)];
              return (
                <li key={s.id}>
                  <Link href={`/sermon/${s.id}`}>
                    <span className="pt-th" style={{ backgroundImage: thumbBg(s) }} />
                    <span className="pt-tx">
                      <span className="pt-k" style={{ color: c.color }}>{s.kind}</span>
                      <span className="pt-t">{s.title}</span>
                      <span className="pt-d">{fmtDate(s.date)} · {s.passage}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
          {morePosts.length > 0 && (
            <>
              <div className="pt-head"><b>블로그</b><Link href="/blog">전체 보기 →</Link></div>
              <ul className="pt-list">
                {morePosts.slice(0, 3).map((p) => (
                  <li key={p.id}><Link href={`/blog/p/${p.id}`}><span className="dot" style={{ background: metaOf(p.slug).hue }} />{p.title}</Link></li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>

      {deck?.id && (
        <div className="pt-news" style={{ "--hue": metaOf(deck.slug).hue }}>
          <Link href={`/blog?view=news&card=${deck.id}#archive`} className="pt-news-cover" aria-label={`카드뉴스 ${deck.title} 넘겨 보기`}>
            <img src={`/api/card/${deck.id}/1`} alt="" width={1080} height={1350} />
          </Link>
          <div className="pt-news-body">
            <div className="pt-cap">카드뉴스<Link href="/blog?view=news#archive">전체 →</Link></div>
            <div className="pt-news-title">{deck.title}</div>
            {deck.subtitle && <div className="pt-sub">{deck.subtitle}</div>}
            {otherDecks.length > 0 ? (
              <div className="pt-news-more">
                {otherDecks.map((d) => (
                  <Link key={d.id} href={`/blog?view=news&card=${d.id}#archive`} title={d.title}>
                    <img src={`/api/card/${d.id}/1`} alt="" loading="lazy" width={1080} height={1350} />
                    <span>{d.title}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="pt-news-strip">
                {Array.from({ length: Math.min(deck.count - 1, 3) }, (_, k) => (
                  <Link key={k} href={`/blog?view=news&card=${deck.id}&i=${k + 2}#archive`}><img src={`/api/card/${deck.id}/${k + 2}`} alt={`${k + 2}장`} loading="lazy" width={1080} height={1350} /></Link>
                ))}
              </div>
            )}
            <div className="pt-news-act">
              <Link href={`/blog?view=news&card=${deck.id}#archive`} className="btn primary">{deck.count}장 넘겨 보기</Link>
              <Link href={`/blog/p/${deck.id}`}>본문 읽기 →</Link>
            </div>
          </div>
        </div>
      )}

      <div className="portal3">
        {book && (
          <Link href={`/library/${book.id}`} className="pt-card pt-book">
            <div className="pt-cap">서재</div>
            <div className="pt-bookrow">
              <BookCover b={book} />
              <div>
                <div className="pt-t2">{book.title}</div>
                <div className="pt-d">{book.author}</div>
                {book.line && <p className="pt-line">{book.line}</p>}
              </div>
            </div>
            {ours && <div className="pt-foot">우리가 쓴 책 · {ours.title}{ours.status === "출간 예정" ? " (출간 예정)" : ""}</div>}
          </Link>
        )}

        {newSettle.length > 0 && (
          <div className="pt-card">
            <div className="pt-cap">정착 안내<Link href="/settle">전체 →</Link></div>
            <ul className="pt-list">
              {newSettle.map((z) => {
                const c = settleCat(z.category);
                return <li key={z.id}><Link href={`/settle/${z.id}`}><span className="dot" style={{ background: c.hue }} />{z.title}</Link></li>;
              })}
            </ul>
          </div>
        )}

        <div className="pt-card pt-gospel">
          <div className="pt-cap">가스펠<Link href="/gospel">전체 →</Link></div>
          <ul className="pt-list">
            {gospel.map((b) => (
              <li key={b.slug}><Link href={`/gospel/read/${b.slug}?lang=ko`}><span className="dot" style={{ background: b.series === "life" ? "#4A6B3A" : "#3A4A6B" }} />{b.ko.title}</Link></li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
