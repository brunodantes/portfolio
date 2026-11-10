import Contact from "./sections/Contact";
import Experience from "./sections/Experience";
import Hero from "./sections/Hero";
import Stack from "./sections/Stack";
import Marquee from "./ui/Marquee";
import { marqueeItems } from "@/lib/site-data";
import type { HeroVariant } from "@/lib/types";

/** A página única, com o hero da direção pedida (home ou prévia em /conceitos). */
export default function HomeContent({ variant }: { variant: HeroVariant }) {
  return (
    <>
      <Hero variant={variant} />
      <Experience />
      <Marquee items={marqueeItems} />
      <Stack />
      <Contact />
    </>
  );
}
