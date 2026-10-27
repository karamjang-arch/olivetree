import Link from "next/link";

export default function MemoryCards({ cards }) {
  return (
    <div className="mcards">
      {cards.map((c) => {
        const inner = (
          <>
            <div className="mref">{c.ref}</div>
            <div className="mtext">{c.text}</div>
            {c.id && <span className="more">새김D6 자세히 →</span>}
          </>
        );
        return c.id
          ? <Link key={c.ref} href={`/d6/${c.id}`} className="card mcard">{inner}</Link>
          : <div key={c.ref} className="card mcard static">{inner}</div>;
      })}
    </div>
  );
}
