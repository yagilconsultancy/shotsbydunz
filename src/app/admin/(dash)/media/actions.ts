"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/supabase";
import { MEDIA_BUCKET, type MediaRow } from "@/lib/media";
import { sniffProof } from "@/lib/proof";
import { toEmbed } from "@/lib/video";
import { getFolder, projectFolders } from "@/content/media-folders";

const MAX_BYTES = 5 * 1024 * 1024;
const uuid = /^[0-9a-f-]{36}$/;

type Target = { folder: string; projectId?: string | null };

// Which folders exist, how many photos each holds, and whether it's a fixed set of spots.
async function folderRules({ folder, projectId }: Target) {
  if (projectId) {
    if (!uuid.test(projectId)) return null;
    const { data } = await db().from("projects").select("id").eq("id", projectId).maybeSingle();
    if (!data) return null;
    if (folder === projectFolders.cover.key) return { kind: "fixed" as const, max: 1 };
    if (folder === projectFolders.gallery.key) return { kind: "list" as const, max: projectFolders.gallery.max };
    return null;
  }
  const f = getFolder(folder);
  return f ? { kind: f.kind, max: f.max } : null;
}

const clean = (v: unknown, max: number) => (typeof v === "string" ? v.trim().replace(/\s+/g, " ").slice(0, max) : "");

async function log(action: string, actor: string) {
  await db().from("media_events").insert({ action, actor });
}

function live(t: Target) {
  const q = db().from("media").select("*").eq("folder", t.folder).is("replaced_at", null);
  return t.projectId ? q.eq("project_id", t.projectId) : q.is("project_id", null);
}

// Step 1: a one-file upload pass. The browser sends the photo straight to storage, which
// avoids Vercel's 4.5 MB request limit; nothing is shown on the site until step 2 checks it.
export async function getUploadPass(target: Target) {
  await requireAdmin();
  if (!(await folderRules(target))) return { error: "That folder doesn't exist." };
  const path = `${target.folder}/${target.projectId ?? "site"}/${randomUUID()}.jpg`;
  const { data, error } = await db().storage.from(MEDIA_BUCKET).createSignedUploadUrl(path);
  if (error || !data) return { error: "Uploads aren't available right now. Try again in a minute." };
  return { path, signedUrl: data.signedUrl };
}

// Step 2: check what actually arrived, then put it live.
export async function saveUpload(input: Target & { path: string; position?: number; alt: string; caption?: string; width: number; height: number }) {
  const actor = await requireAdmin();
  const rules = await folderRules(input);
  if (!rules) return { error: "That folder doesn't exist." };
  const prefix = `${input.folder}/${input.projectId ?? "site"}/`;
  if (!input.path.startsWith(prefix) || !/^[0-9a-f-]{36}\.jpg$/.test(input.path.slice(prefix.length)))
    return { error: "That upload doesn't belong here. Try again." };
  const alt = clean(input.alt, 200);
  if (alt.length < 3) return { error: "Add a short description of the photo." };

  const bucket = db().storage.from(MEDIA_BUCKET);
  const { data: blob } = await bucket.download(input.path);
  const bytes = blob ? new Uint8Array(await blob.arrayBuffer()) : null;
  const kind = bytes ? sniffProof(bytes) : null;
  if (!bytes || bytes.length > MAX_BYTES || !kind || !["jpg", "png", "webp"].includes(kind.ext)) {
    await bucket.remove([input.path]);
    return { error: "That file isn't a photo the site can use. Try a JPG or PNG." };
  }

  const rows = ((await live(input)).data ?? []) as MediaRow[];
  let position: number;
  if (rules.kind === "fixed") {
    position = Number(input.position ?? 0);
    if (!Number.isInteger(position) || position < 0 || position >= rules.max) return { error: "That spot doesn't exist." };
    const current = rows.find((r) => r.position === position);
    if (current) await db().from("media").update({ replaced_at: new Date().toISOString() }).eq("id", current.id);
  } else {
    if (rows.length >= rules.max) {
      await bucket.remove([input.path]);
      return { error: `This folder is full (${rules.max} photos). Remove one first.` };
    }
    position = rows.reduce((m, r) => Math.max(m, r.position + 1), 0);
  }

  const dim = (n: number) => (Number.isInteger(n) && n > 0 && n < 20000 ? n : null);
  const { error } = await db()
    .from("media")
    .insert({
      folder: input.folder,
      project_id: input.projectId ?? null,
      position,
      path: input.path,
      alt,
      caption: clean(input.caption, 60) || null,
      width: dim(input.width),
      height: dim(input.height),
    });
  if (error) return { error: "The photo uploaded but couldn't be saved. Try again." };
  await log(`${input.folder}: photo ${rules.kind === "fixed" ? "replaced" : "added"}`, actor);
  return { ok: true };
}

const back = (fd: FormData, m: string) => {
  const to = String(fd.get("back") ?? "/admin/media");
  redirect(`${to.startsWith("/admin/media") ? to : "/admin/media"}${to.includes("?") ? "&" : "?"}m=${m}#${String(fd.get("anchor") ?? "")}`);
};

const targetFrom = (fd: FormData): Target => ({ folder: String(fd.get("folder") ?? ""), projectId: (fd.get("projectId") as string) || null });

export async function undoPhoto(fd: FormData) {
  const actor = await requireAdmin();
  const t = targetFrom(fd);
  const position = Number(fd.get("position") ?? 0);
  if (!(await folderRules(t))) back(fd, "error");
  let q = db().from("media").select("*").eq("folder", t.folder).eq("position", position);
  q = t.projectId ? q.eq("project_id", t.projectId) : q.is("project_id", null);
  const { data } = await q.order("created_at", { ascending: false });
  const rows = (data ?? []) as (MediaRow & { replaced_at: string | null })[];
  const current = rows.find((r) => !r.replaced_at);
  const previous = rows.filter((r) => r.replaced_at && r.id !== current?.id).sort((a, b) => b.replaced_at!.localeCompare(a.replaced_at!))[0];
  if (!current) back(fd, "error");
  if (!previous && t.projectId) back(fd, "nocover");
  const now = new Date().toISOString();
  // Undo is a swap, so pressing it twice brings the newer photo back.
  await db().from("media").update({ replaced_at: now }).eq("id", current!.id);
  if (previous) await db().from("media").update({ replaced_at: null }).eq("id", previous.id);
  await log(`${t.folder}: undo to previous photo`, actor);
  back(fd, "undone");
}

export async function saveDetails(fd: FormData) {
  const actor = await requireAdmin();
  const id = String(fd.get("id") ?? "");
  const alt = clean(fd.get("alt"), 200);
  if (!uuid.test(id) || alt.length < 3) back(fd, "alt");
  const caption = fd.has("caption") ? clean(fd.get("caption"), 60) || null : undefined;
  await db().from("media").update(caption === undefined ? { alt } : { alt, caption }).eq("id", id).is("replaced_at", null);
  await log("photo description updated", actor);
  back(fd, "saved");
}

export async function removePhoto(fd: FormData) {
  const actor = await requireAdmin();
  const id = String(fd.get("id") ?? "");
  if (!uuid.test(id)) back(fd, "error");
  const { data } = await db().from("media").select("folder").eq("id", id).maybeSingle();
  const rules = data ? await folderRules({ folder: data.folder, projectId: (fd.get("projectId") as string) || null }) : null;
  if (!rules || rules.kind !== "list") back(fd, "error");
  await db().from("media").update({ replaced_at: new Date().toISOString() }).eq("id", id);
  await log(`${data!.folder}: photo removed`, actor);
  back(fd, "removed");
}

export async function movePhoto(fd: FormData) {
  await requireAdmin();
  const id = String(fd.get("id") ?? "");
  const dir = Number(fd.get("dir")) === -1 ? -1 : 1;
  const t = targetFrom(fd);
  const rows = ((await live(t)).data ?? []) as MediaRow[];
  rows.sort((a, b) => a.position - b.position);
  const i = rows.findIndex((r) => r.id === id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= rows.length) back(fd, "error");
  await db().from("media").update({ position: rows[j].position }).eq("id", rows[i].id);
  await db().from("media").update({ position: rows[i].position }).eq("id", rows[j].id);
  back(fd, "moved");
}

const pillarIds = ["photo-film", "content", "booth"];

function slugify(s: string) {
  return s.toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").replace(/[\s_]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 70) || "project";
}

export async function saveProject(fd: FormData) {
  const actor = await requireAdmin();
  const id = String(fd.get("id") ?? "");
  const title = clean(fd.get("title"), 120);
  const pillars = fd.getAll("pillars").map(String).filter((p) => pillarIds.includes(p));
  const videoRaw = clean(fd.get("video"), 300);
  const video = videoRaw ? toEmbed(videoRaw) : null;
  const backTo = id ? `/admin/media/projects/${id}` : "/admin/media/projects/new";
  if (!title) redirect(`${backTo}?m=title`);
  if (!pillars.length) redirect(`${backTo}?m=pillars`);
  if (videoRaw && !video) redirect(`${backTo}?m=video`);
  const runtime = clean(fd.get("runtime"), 10);

  const row = {
    title,
    pillars,
    kind: clean(fd.get("kind"), 60) || null,
    client: clean(fd.get("client"), 120) || null,
    year: clean(fd.get("year"), 10) || null,
    location: clean(fd.get("location"), 120) || null,
    role: clean(fd.get("role"), 200).split(",").map((r) => r.trim()).filter(Boolean).slice(0, 6),
    orientation: fd.get("orientation") === "tall" ? "tall" : "wide",
    story: String(fd.get("story") ?? "").trim().slice(0, 2000) || null,
    quote_text: clean(fd.get("quote_text"), 400) || null,
    quote_name: clean(fd.get("quote_name"), 80) || null,
    video_url: video,
    runtime: /^\d{1,2}:\d{2}$/.test(runtime) ? runtime : null,
    featured: fd.get("featured") === "on",
  };

  if (id) {
    if (!uuid.test(id)) redirect("/admin/media");
    await db().from("projects").update(row).eq("id", id);
    await log(`project "${title}" updated`, actor);
    redirect(`/admin/media/projects/${id}?m=saved`);
  }

  const { data: last } = await db().from("projects").select("position").order("position", { ascending: false }).limit(1);
  const base = slugify(title);
  for (let n = 1; n < 50; n++) {
    const slug = n === 1 ? base : `${base}-${n}`;
    const { data, error } = await db()
      .from("projects")
      .insert({ ...row, slug, hidden: true, position: (last?.[0]?.position ?? -1) + 1 })
      .select("id")
      .single();
    if (!error && data) {
      await log(`project "${title}" created`, actor);
      redirect(`/admin/media/projects/${data.id}?m=created`);
    }
    if (error?.code !== "23505") break;
  }
  redirect(`${backTo}?m=error`);
}

export async function setProjectHidden(fd: FormData) {
  const actor = await requireAdmin();
  const id = String(fd.get("id") ?? "");
  const hidden = fd.get("hidden") === "true";
  if (!uuid.test(id)) redirect("/admin/media");
  if (!hidden) {
    const { data } = await db().from("media").select("id").eq("project_id", id).eq("folder", projectFolders.cover.key).is("replaced_at", null);
    if (!data?.length) redirect(`/admin/media/projects/${id}?m=needcover`);
  }
  await db().from("projects").update({ hidden }).eq("id", id);
  await log(`project ${hidden ? "hidden" : "shown"}`, actor);
  redirect(`${String(fd.get("back") ?? "/admin/media")}?m=${hidden ? "hidden" : "shown"}#projects`);
}

export async function moveProject(fd: FormData) {
  await requireAdmin();
  const id = String(fd.get("id") ?? "");
  const dir = Number(fd.get("dir")) === -1 ? -1 : 1;
  const { data } = await db().from("projects").select("id, position").order("position", { ascending: true });
  const rows = data ?? [];
  const i = rows.findIndex((r) => r.id === id);
  const j = i + dir;
  if (i >= 0 && j >= 0 && j < rows.length) {
    await db().from("projects").update({ position: rows[j].position }).eq("id", rows[i].id);
    await db().from("projects").update({ position: rows[i].position }).eq("id", rows[j].id);
  }
  redirect("/admin/media?m=moved#projects");
}

export async function deleteProject(fd: FormData) {
  const actor = await requireAdmin();
  const id = String(fd.get("id") ?? "");
  if (!uuid.test(id)) redirect("/admin/media");
  if (fd.get("confirm") !== "on") redirect(`/admin/media/projects/${id}?m=confirm`);
  const { data: p } = await db().from("projects").select("title").eq("id", id).maybeSingle();
  const { data: files } = await db().from("media").select("path").eq("project_id", id);
  const uploaded = (files ?? []).map((f) => f.path).filter((path: string) => !path.startsWith("/"));
  if (uploaded.length) await db().storage.from(MEDIA_BUCKET).remove(uploaded);
  await db().from("projects").delete().eq("id", id);
  await log(`project "${p?.title ?? id}" deleted`, actor);
  redirect("/admin/media?m=deleted#projects");
}
