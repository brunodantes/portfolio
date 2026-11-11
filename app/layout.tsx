import Script from "next/script";
import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans, Oxanium, Share_Tech_Mono } from "next/font/google";
import SkipLink from "@/components/SkipLink";
import SmoothScroll from "@/components/SmoothScroll";
import { content, siteConfig } from "@/lib/site-data";
import "./globals.css";

// Fontes do tema: Oxanium (títulos), IBM Plex Sans (texto) e Share Tech Mono (telemetria).
const display = Oxanium({ variable: "--font-display-face", subsets: ["latin"], weight: ["500", "600", "700"] });
const sans = IBM_Plex_Sans({ variable: "--font-sans-face", subsets: ["latin"], weight: ["400", "500"] });
const mono = Share_Tech_Mono({ variable: "--font-mono-face", subsets: ["latin"], weight: "400" });

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
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.ogDescription,
  },
};

export const viewport: Viewport = { themeColor: "#03060c" };

// Dados estruturados (schema.org) para buscadores e IAs entenderem quem é o Bruno.
const pt = content.pt;
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: pt.player.fullName,
  alternateName: siteConfig.name,
  jobTitle: pt.player.role,
  description: pt.player.summary,
  url: siteConfig.url,
  image: `${siteConfig.url}/opengraph-image`,
  address: { "@type": "PostalAddress", addressLocality: "São Paulo", addressCountry: "BR" },
  sameAs: [`https://${pt.player.linkedin}`, `https://${pt.player.github}`],
  knowsAbout: pt.stack.flatMap((group) => group.items),
  alumniOf: pt.education.map((e) => ({ "@type": "EducationalOrganization", name: e.where.split(" · ")[0] })),
  worksFor: { "@type": "Organization", name: pt.experience[0].org },
};

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
      <body className="min-h-screen bg-bg font-sans text-body antialiased">
        <SkipLink />
        <SmoothScroll />
        {children}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      </body>
    </html>
  );
}
