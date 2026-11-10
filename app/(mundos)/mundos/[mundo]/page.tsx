import type { Metadata } from "next";
import { notFound } from "next/navigation";
import WorldPage from "@/components/worlds/WorldPage";
import { worldList } from "@/components/worlds/registry";

// Protótipos dos mundos 3D, para comparação. Fora do sitemap e dos buscadores.

export const dynamicParams = false;

export function generateStaticParams() {
  return worldList.map((w) => ({ mundo: w.slug }));
}

export async function generateMetadata({ params }: PageProps<"/mundos/[mundo]">): Promise<Metadata> {
  const { mundo } = await params;
  const world = worldList.find((w) => w.slug === mundo);
  return { title: world?.name ?? "Mundos", robots: { index: false, follow: false } };
}

export default async function WorldRoute({ params }: PageProps<"/mundos/[mundo]">) {
  const { mundo } = await params;
  const world = worldList.find((w) => w.slug === mundo);
  if (!world) notFound();
  return <WorldPage slug={world.slug} />;
}
