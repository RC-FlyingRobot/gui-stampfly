import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "StampFly - ビジュアルプログラミングで学ぶドローン制御",
    template: "%s | StampFly",
  },
  description: "StampFlyは、Blocklyを使用したビジュアルプログラミングでドローンを制御できる教育プラットフォームです。プログラミング初心者でも直感的にドローンの飛行制御を学べます。",
  keywords: [
    "StampFly",
    "ドローン",
    "プログラミング教育",
    "Blockly",
    "ビジュアルプログラミング",
    "M5Stack",
    "STEM教育",
    "ロボティクス",
    "フライトコントローラー",
  ],
  authors: [{ name: "RC-FlyingRobot" }],
  creator: "RC-FlyingRobot",
  publisher: "RC-FlyingRobot",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "StampFly - ビジュアルプログラミングで学ぶドローン制御",
    description: "StampFlyは、Blocklyを使用したビジュアルプログラミングでドローンを制御できる教育プラットフォームです。",
    url: "/",
    siteName: "StampFly",
    locale: "ja_JP",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "StampFly - ドローンプログラミング教育プラットフォーム",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "StampFly - ビジュアルプログラミングで学ぶドローン制御",
    description: "Blocklyでドローンを制御。プログラミング初心者でも直感的に学べます。",
    images: ["/og-image.png"],
    creator: "@RC_FlyingRobot",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
