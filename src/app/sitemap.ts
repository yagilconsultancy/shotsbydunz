import type { MetadataRoute } from "next";
import { services } from "@/content/services";
import { getProjects } from "@/lib/media";

const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await getProjects();
  const pages = ["", "/about", "/services", "/portfolio", "/booths", "/book", "/faq", "/contact", "/terms", "/privacy", "/photo-film", "/content"];
  return [
    ...pages.map((p) => ({ url: `${base}${p}` })),
    ...services.map((s) => ({ url: `${base}/services/${s.slug}` })),
    ...projects.map((p) => ({ url: `${base}/portfolio/${p.slug}` })),
  ];
}
