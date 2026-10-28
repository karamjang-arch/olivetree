import { ImageResponse } from "next/og";

export const alt = "Olive Tree · Our Daily Bread";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#0f2742,#1d4166)", color: "#f1ede2" }}>
        <svg width="140" height="140" viewBox="0 0 100 100" fill="none" stroke="#c9b27a" strokeWidth="3" strokeLinecap="round">
          <path d="M20 62c0-22 14-34 30-34s30 12 30 34c0 8-6 12-14 12H34c-8 0-14-4-14-12z" />
          <path d="M50 70V40M50 52c-8-2-12-8-12-14M50 46c8-2 12-8 12-14" />
        </svg>
        <div style={{ fontSize: 92, fontWeight: 700, marginTop: 24, letterSpacing: -1 }}>Olive Tree</div>
        <div style={{ fontSize: 40, marginTop: 10, color: "#c9b27a", fontStyle: "italic" }}>Our Daily Bread</div>
      </div>
    ),
    size
  );
}
