import HomeContent from "@/components/HomeContent";
import { siteConfig } from "@/lib/site-data";

export default function Home() {
  return <HomeContent variant={siteConfig.heroVariant} />;
}
