import { cache } from "react";
import { db, dbConfigured } from "./supabase";
import { getFolder, type FolderPhoto } from "@/content/media-folders";
import { projects as sampleProjects, type CategoryId, type Project, type Still } from "@/content/portfolio";
import type { PillarId } from "@/content/pillars";

export const MEDIA_BUCKET = "site-media";

export type MediaRow = {
  id: string;
  folder: string;
  project_id: string | null;
  position: number;
  path: string;
  alt: string;
  caption: string | null;
  width: number | null;
  height: number | null;
  created_at: string;
};

export type ProjectRow = {
  id: string;
  slug: string;
  title: string;
  pillars: string[];
  kind: string | null;
  client: string | null;
  year: string | null;
  location: string | null;
  role: string[];
  orientation: "wide" | "tall";
  story: string | null;
  quote_text: string | null;
  quote_name: string | null;
  video_url: string | null;
  runtime: string | null;
  featured: boolean;
  hidden: boolean;
  position: number;
};

// Built-in photos are stored as "/images/..."; uploads as paths inside the public bucket.
export function mediaUrl(path: string) {
  if (path.startsWith("/")) return path;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${MEDIA_BUCKET}/${path}`;
}

const orientationOf = (w: number | null, h: number | null): Still["orientation"] =>
  !w || !h ? "wide" : w / h > 1.15 ? "wide" : h / w > 1.15 ? "tall" : "square";

// One query per page view, shared by every component on that page. On any database
// problem the site quietly falls back to its built-in photos rather than breaking.
const liveMedia = cache(async (): Promise<MediaRow[] | null> => {
  if (!dbConfigured()) return null;
  try {
    const { data, error } = await db()
      .from("media")
      .select("id, folder, project_id, position, path, alt, caption, width, height, created_at")
      .is("replaced_at", null)
      .order("position", { ascending: true });
    return error ? null : (data as MediaRow[]);
  } catch {
    return null;
  }
});

const toPhoto = (r: MediaRow): FolderPhoto => ({
  src: mediaUrl(r.path),
  alt: r.alt,
  caption: r.caption ?? undefined,
  orientation: orientationOf(r.width, r.height),
});

export async function folderPhotos(key: string): Promise<FolderPhoto[]> {
  const folder = getFolder(key);
  if (!folder) return [];
  const rows = ((await liveMedia()) ?? []).filter((r) => r.folder === key && !r.project_id);
  if (folder.kind === "list") return rows.map(toPhoto);
  return folder.fallback.map((f, i) => {
    const r = rows.find((x) => x.position === i);
    return r ? toPhoto(r) : f;
  });
}

export async function photo(key: string, spot = 0) {
  return (await folderPhotos(key))[spot] ?? getFolder(key)!.fallback[spot];
}

function toProject(p: ProjectRow, rows: MediaRow[]): Project | null {
  const cover = rows.find((r) => r.project_id === p.id && r.folder === "project-cover");
  if (!cover) return null;
  const stills = rows
    .filter((r) => r.project_id === p.id && r.folder === "project-gallery")
    .map((r) => ({ src: mediaUrl(r.path), alt: r.alt, orientation: orientationOf(r.width, r.height) }));
  return {
    slug: p.slug,
    title: p.title,
    pillars: p.pillars as PillarId[],
    kind: p.kind ?? "",
    client: p.client ?? "",
    year: p.year ?? "",
    location: p.location ?? "",
    role: p.role,
    orientation: p.orientation,
    cover: mediaUrl(cover.path),
    coverAlt: cover.alt,
    story: p.story ?? "",
    stills,
    quote: p.quote_text ? { text: p.quote_text, name: p.quote_name ?? "" } : undefined,
    video: p.video_url ?? undefined,
    runtime: p.runtime ?? undefined,
    featured: p.featured,
  };
}

export const getProjects = cache(async (): Promise<Project[]> => {
  if (!dbConfigured()) return sampleProjects;
  try {
    const [{ data, error }, rows] = await Promise.all([
      db().from("projects").select("*").eq("hidden", false).order("position", { ascending: true }),
      liveMedia(),
    ]);
    if (error || !rows) return sampleProjects;
    return (data as ProjectRow[]).map((p) => toProject(p, rows)).filter((p): p is Project => !!p);
  } catch {
    return sampleProjects;
  }
});

export async function getProjectBySlug(slug: string) {
  return (await getProjects()).find((p) => p.slug === slug) ?? null;
}

export const filterProjects = (list: Project[], id: CategoryId) =>
  id === "all" ? list : list.filter((p) => p.pillars.includes(id as PillarId));
