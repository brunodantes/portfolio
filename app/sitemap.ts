import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-data";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: `${siteConfig.url}/`, changeFrequency: "monthly", priority: 1 }];
}
