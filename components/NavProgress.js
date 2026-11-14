"use client";
// 사이트 안의 링크를 누르면 화면 맨 위에 얇은 진행 막대를 띄운다.
// 페이지를 새로 만드느라 몇 초 걸릴 때도 눌렸다는 것을 바로 알 수 있게 한다.
import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function NavProgress() {
  const path = usePathname();
  const query = useSearchParams();
  const [on, setOn] = useState(false);

  // 주소가 바뀌면(새 페이지가 그려지면) 막대를 끝낸다
  useEffect(() => { setOn(false); }, [path, query]);

  useEffect(() => {
    const onClick = (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest && e.target.closest("a[href]");
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.search === location.search) return;
      setOn(true);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  // 휴대폰처럼 탭이 화면을 넘을 때, 아직 오른쪽에 탭이 남아 있으면 끝을 흐리게 한다
  useEffect(() => {
    const nav = document.querySelector("header.top nav");
    if (!nav) return;
    const check = () => nav.classList.toggle("more", nav.scrollLeft + nav.clientWidth < nav.scrollWidth - 2);
    check();
    nav.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => { nav.removeEventListener("scroll", check); window.removeEventListener("resize", check); };
  }, [path]);

  // 혹시 끝 신호를 놓쳐도 막대가 남지 않게 한다
  useEffect(() => {
    if (!on) return;
    const t = setTimeout(() => setOn(false), 15000);
    return () => clearTimeout(t);
  }, [on]);

  return <div className={"navbar-progress" + (on ? " on" : "")} aria-hidden="true" />;
}
