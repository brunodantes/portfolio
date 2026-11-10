import Script from "next/script";
import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Michroma, Sora } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CodeBackdrop from "@/components/CodeBackdrop";
import CursorHalo from "@/components/CursorHalo";
import SkipLink from "@/components/SkipLink";
import SmoothScroll from "@/components/SmoothScroll";
import { siteConfig } from "@/lib/site-data";
import "./globals.css";

const display = Michroma({
  variable: "--font-display-face",
  subsets: ["latin"],
  weight: "400",
});

const sans = Sora({
  variable: "--font-sans-face",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono-face",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: siteConfig.title, template: `%s — ${siteConfig.name}` },
  description: siteConfig.description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: `${siteConfig.name} Portfolio`,
    title: siteConfig.title,
    description: siteConfig.ogDescription,
    locale: siteConfig.ogLocale,
    images: [
      {
        url: "/og-preview.png",
        width: 1200,
        height: 630,
        alt: "Preview visual do portfólio de Bruno Almeida com interface HUD de engenharia, nuvem, código e telemetria.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.ogDescription,
    images: ["/og-preview.png"],
  },
};

export const viewport: Viewport = { themeColor: "#08090C" };

// Roda antes da primeira pintura, para a página não piscar: aplica as preferências salvas
// (idioma e movimento) em `pf:prefs`, ver lib/preferences.ts.
const bootScript = `try{var d=document.documentElement;var s=JSON.parse(localStorage.getItem('pf:prefs')||'{}');var m=typeof s.motion==='boolean'?s.motion:!matchMedia('(prefers-reduced-motion: reduce)').matches;d.dataset.motion=m?'on':'off';if(s.locale==='en')d.lang='en'}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang={siteConfig.lang}
      className={`${display.variable} ${sans.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <Script id="boot" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body className="relative min-h-screen bg-bg font-sans text-body antialiased">
        <SkipLink />
        <CodeBackdrop />
        <CursorHalo />
        <SmoothScroll />
        <div className="relative z-10 flex min-h-screen flex-col">
          <Header />
          <main id="conteudo" className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
