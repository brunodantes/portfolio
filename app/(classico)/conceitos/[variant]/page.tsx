import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ConceptBar from "@/components/ConceptBar";
import HomeContent from "@/components/HomeContent";
import { heroVariants } from "@/lib/site-data";

// Prévias das direções do hero e das paletas, para comparação. Fora do menu, do sitemap e dos buscadores.

export const dynamicParams = false;

export function generateStaticParams() {
  return heroVariants.filter((v) => v.ready).map((v) => ({ variant: v.slug }));
}

export const metadata: Metadata = {
  title: "Conceitos",
  robots: { index: false, follow: false },
};

export default async function ConceptPage({ params }: PageProps<"/conceitos/[variant]">) {
  const { variant } = await params;
  const current = heroVariants.find((v) => v.slug === variant && v.ready);
  if (!current) notFound();

  return (
    <>
      <ConceptBar current={current.slug} />
      <HomeContent variant={current.slug} />
    </>
  );
}
