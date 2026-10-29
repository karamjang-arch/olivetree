"use client";
import { useState } from "react";
import Link from "next/link";
import TripMap from "./TripMap";

// 지도 + 여정 목록 (핀과 목록이 함께 움직임)
export default function TripSeries({ map }) {
  const [active, setActive] = useState(null);
  return (
    <>
      <TripMap map={map} active={active} setActive={setActive} />
      <ol className="tm-list">
        {map.stops.map((s) => (
          <li key={s.id} className={active === s.id ? "on" : ""} onMouseEnter={() => setActive(s.id)}>
            <Link href={s.href}>
              <span className="tm-th" style={s.thumb ? { backgroundImage: `url(${s.thumb})` } : undefined}>
                <b>{s.n}</b>
              </span>
              <span className="tm-tx">
                <small>{s.place}</small>
                <strong>{s.title}</strong>
                {s.sub && <em>{s.sub}</em>}
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </>
  );
}
