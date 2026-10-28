import "./globals.css";

export const metadata = {
  metadataBase: new URL("https://o-live-tree.vercel.app"),
  title: "Olive Tree · Our Daily Bread",
  description: "오늘의 말씀과 설교, 성경 통독, 가스펠, 정착 안내",
  openGraph: {
    title: "Olive Tree · Our Daily Bread",
    description: "오늘의 말씀과 설교, 성경 통독, 가스펠, 정착 안내",
    url: "https://o-live-tree.vercel.app",
    siteName: "Olive Tree",
    locale: "ko_KR",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;1,9..144,400&family=Great+Vibes&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css" />
      </head>
      <body>{children}</body>
    </html>
  );
}
