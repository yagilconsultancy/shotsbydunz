import type { MetadataRoute } from "next";
import { services } from "@/content/services";
import { projects } from "@/content/portfolio";

const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/about", "/services", "/portfolio", "/booths", "/book", "/faq", "/contact", "/terms"];
  return [
    ...pages.map((p) => ({ url: `${base}${p}` })),
    ...services.map((s) => ({ url: `${base}/services/${s.slug}` })),
    ...projects.map((p) => ({ url: `${base}/portfolio/${p.slug}` })),
  ];
}
