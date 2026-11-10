import Contact from "@/components/sections/Contact";
import Experience from "@/components/sections/Experience";
import Hero from "@/components/sections/Hero";
import Stack from "@/components/sections/Stack";
import Marquee from "@/components/ui/Marquee";
import { marqueeItems } from "@/lib/site-data";

export default function Home() {
  return (
    <>
      <Hero />
      <Experience />
      <Marquee items={marqueeItems} />
      <Stack />
      <Contact />
    </>
  );
}
