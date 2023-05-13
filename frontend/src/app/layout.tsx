import "./globals.css";
import type { Metadata } from "next";
import cn from "classnames";
import Header from "@src/components/Header";
import Footer from "@src/components/Footer";
import { Inter, Noto_Sans_JP } from "next/font/google";
import MobileFooter from "@src/components/MobileFooter";
import GoogleAnalytics from "@src/components/GoogleAnalytics";
import SessionProvider from "@src/components/SessionProvider";

export const metadata: Metadata = {
  title: {
    default: "国会発言分析",
    template: "%s | 国会発言分析",
  },
  description: "Generated by create next app",
};

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const notoSansJP = Noto_Sans_JP({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-noto-sans-jp",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  <SessionProvider>
    <html lang="ja" className={cn(inter.variable, notoSansJP.variable)}>
      <head>
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text x=%2250%%22 y=%2250%%22 style=%22dominant-baseline:central;text-anchor:middle;font-size:90px;%22>🏛️</text></svg>"
        />
        <link
          rel="icon alternate"
          type="image/png"
          href="https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/72x72/1f3db.png"
        />
      </head>
      <body>
        {/* @ts-expect-error Server Component */}
        <Header />
        {children}
        <Footer />
        <MobileFooter />
        <GoogleAnalytics />
      </body>
    </html>
  </SessionProvider>;
}
