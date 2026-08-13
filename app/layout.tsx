import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AdLab Simulator — 광고 소재 A/B 테스트 시뮬레이터",
  description: "광고 소재 A/B 테스트 시뮬레이터 — 집행 전 승자와 승률을 예측하고 테스트 가치를 판정합니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="dark">
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
