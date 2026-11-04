import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/supabase";
import { mediaUrl, type MediaRow, type ProjectRow } from "@/lib/media";
import { fileTypes, projectFolders } from "@/content/media-folders";
import { pillars } from "@/content/pillars";
import PhotoUpload from "@/components/admin/PhotoUpload";
import ProjectForm from "@/components/admin/ProjectForm";
import { deleteProject, movePhoto, removePhoto, saveDetails, saveProject, setProjectHidden, undoPhoto } from "../../actions";
import styles from "../../../../admin.module.css";

const messages: Record<string, string> = {
  created: "Project created. It stays hidden until you add a cover photo and press Show on site.",
  saved: "Project saved.",
  title: "Give the project a title.",
  pillars: "Tick at least one category.",
  video: "That video link isn’t a YouTube or Vimeo link. Copy the address from the video page and paste it again.",
  needcover: "Add a cover photo before showing the project.",
  nocover: "There’s no earlier cover to go back to.",
  confirm: "Tick the box to confirm you want to delete this project.",
  undone: "Previous photo restored.",
  removed: "Photo removed.",
  moved: "Order updated.",
  shown: "Project is on the site.",
  hidden: "Project hidden from the site.",
  error: "That didn’t work. Refresh and try again.",
};

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ m?: string }> };

export default async function ProjectEditor({ params, searchParams }: Props) {
  await requireAdmin();
  const { id } = await params;
  const { m } = await searchParams;
  const isNew = id === "new";

  let p: ProjectRow | null = null;
  let media: (MediaRow & { replaced_at: string | null })[] = [];
  if (!isNew) {
    if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
    const [{ data: proj }, { data: rows }] = await Promise.all([
      db().from("projects").select("*").eq("id", id).maybeSingle(),
      db().from("media").select("*").eq("project_id", id).order("position", { ascending: true }),
    ]);
    if (!proj) notFound();
    p = proj as ProjectRow;
    media = (rows ?? []) as typeof media;
  }
  const cover = media.find((r) => r.folder === projectFolders.cover.key && !r.replaced_at);
  const coverHistory = media.some((r) => r.folder === projectFolders.cover.key && r.replaced_at);
  const gallery = media.filter((r) => r.folder === projectFolders.gallery.key && !r.replaced_at);
  const back = `/admin/media/projects/${id}`;
  const hidden = (folder: string) => (
    <>
      <input type="hidden" name="folder" value={folder} />
      <input type="hidden" name="projectId" value={id} />
      <input type="hidden" name="back" value={back} />
    </>
  );

  return (
    <article className={styles.detail}>
      <Link href="/admin/media#projects" className="text-link">
        ← All projects
      </Link>
      {m && messages[m] && (
        <p className={styles.flash} role="status">
          {messages[m]}
        </p>
      )}
      <header className={styles.head}>
        <h1 className={styles.name}>{isNew ? "New project" : p!.title}</h1>
        {p && (
          <span className={styles.badge} data-status={p.hidden ? "cancelled" : "confirmed"}>
            {p.hidden ? "Hidden" : "On the site"}
          </span>
        )}
      </header>

      <div className={styles.cols}>
        <section className={styles.panel}>
          <h2>Details</h2>
          <ProjectForm action={saveProject} className={styles.form} errorClass={styles.uploadError}>
            <input type="hidden" name="id" value={isNew ? "" : id} />
            <Text name="title" label="Title" value={p?.title} required hint="e.g. “Amara and Tobi” or “Glow Studio launch”" />
            <fieldset className={styles.field}>
              <legend>Category (tick all that apply)</legend>
              {pillars.map((pl) => (
                <label key={pl.id} className={styles.inline}>
                  <input type="checkbox" name="pillars" value={pl.id} defaultChecked={p?.pillars.includes(pl.id)} /> {pl.name}
                </label>
              ))}
            </fieldset>
            <Text name="kind" label="Type of event" value={p?.kind} hint="e.g. Wedding, Birthday, Brand launch" />
            <Text name="client" label="Client" value={p?.client} />
            <div className={styles.money}>
              <Text name="year" label="Year" value={p?.year} />
              <Text name="runtime" label="Film length" value={p?.runtime} hint="e.g. 03:45" />
            </div>
            <Text name="location" label="Location" value={p?.location} />
            <Text name="role" label="What you did" value={p?.role.join(", ")} hint="Separate with commas, e.g. Film, Photography" />
            <label className={styles.field}>
              Story
              <textarea name="story" rows={4} maxLength={2000} defaultValue={p?.story ?? ""} />
            </label>
            <Text name="video" label="Video link (YouTube or Vimeo)" value={p?.video_url} hint="Paste the address of the video page. Video files can’t be uploaded here." />
            <Text name="quote_text" label="Client quote (optional)" value={p?.quote_text} />
            <Text name="quote_name" label="Who said it" value={p?.quote_name} />
            <fieldset className={styles.field}>
              <legend>Cover shape on the Work page</legend>
              <label className={styles.inline}>
                <input type="radio" name="orientation" value="wide" defaultChecked={p?.orientation !== "tall"} /> Landscape
              </label>
              <label className={styles.inline}>
                <input type="radio" name="orientation" value="tall" defaultChecked={p?.orientation === "tall"} /> Portrait
              </label>
            </fieldset>
            <label className={styles.inline}>
              <input type="checkbox" name="featured" defaultChecked={p?.featured} /> Show on the home page (the first 6 ticked projects appear there)
            </label>
            <button className="btn btn-primary">{isNew ? "Create project" : "Save details"}</button>
          </ProjectForm>
        </section>

        {!isNew && (
          <div>
            <section className={styles.panel}>
              <h2>Cover photo</h2>
              <p className="muted">Shown on the Work page and the home page. Landscape or portrait, to match the shape you picked. The home page crops it to a tall frame, so keep the main subject near the middle. {fileTypes}</p>
              {cover && (
                <figure className={styles.spot}>
                  <div className={styles.spotImage}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={mediaUrl(cover.path)} alt="" />
                  </div>
                  <form action={saveDetails} className={styles.altForm}>
                    {hidden(projectFolders.cover.key)}
                    <input type="hidden" name="id" value={cover.id} />
                    <label>
                      Description
                      <input name="alt" defaultValue={cover.alt} maxLength={200} required minLength={3} />
                    </label>
                    <button className="btn btn-ghost">Save</button>
                  </form>
                </figure>
              )}
              <PhotoUpload folder={projectFolders.cover.key} projectId={id} position={0} label={cover ? "Replace cover" : "Upload cover photo"} defaultAlt={cover?.alt} />
              {cover && coverHistory && (
                <form action={undoPhoto}>
                  {hidden(projectFolders.cover.key)}
                  <input type="hidden" name="position" value="0" />
                  <button className="btn btn-ghost">Undo to previous cover</button>
                </form>
              )}
            </section>

            <section className={styles.panel}>
              <h2>Gallery</h2>
              <p className="muted">Up to {projectFolders.gallery.max} photos, any shape. They open full screen on the project page.</p>
              <div className={styles.spots}>
                {gallery.map((g, i) => (
                  <figure key={g.id} className={styles.spot}>
                    <div className={styles.spotImage}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={mediaUrl(g.path)} alt="" />
                    </div>
                    <form action={saveDetails} className={styles.altForm}>
                      {hidden(projectFolders.gallery.key)}
                      <input type="hidden" name="id" value={g.id} />
                      <label>
                        Description
                        <input name="alt" defaultValue={g.alt} maxLength={200} required minLength={3} />
                      </label>
                      <button className="btn btn-ghost">Save</button>
                    </form>
                    <div className={styles.rowActions}>
                      <form action={movePhoto}>
                        {hidden(projectFolders.gallery.key)}
                        <input type="hidden" name="id" value={g.id} />
                        <input type="hidden" name="dir" value="-1" />
                        <button className="btn btn-ghost" disabled={i === 0} aria-label="Move earlier">
                          ↑
                        </button>
                      </form>
                      <form action={movePhoto}>
                        {hidden(projectFolders.gallery.key)}
                        <input type="hidden" name="id" value={g.id} />
                        <input type="hidden" name="dir" value="1" />
                        <button className="btn btn-ghost" disabled={i === gallery.length - 1} aria-label="Move later">
                          ↓
                        </button>
                      </form>
                      <form action={removePhoto}>
                        {hidden(projectFolders.gallery.key)}
                        <input type="hidden" name="id" value={g.id} />
                        <button className="btn btn-ghost">Remove</button>
                      </form>
                    </div>
                  </figure>
                ))}
              </div>
              {gallery.length < projectFolders.gallery.max ? (
                <PhotoUpload folder={projectFolders.gallery.key} projectId={id} label="Add a gallery photo" />
              ) : (
                <p className="muted">The gallery is full. Remove a photo to add another.</p>
              )}
            </section>

            <section className={styles.panel}>
              <h2>On the site</h2>
              <form action={setProjectHidden} className={styles.form}>
                <input type="hidden" name="id" value={id} />
                <input type="hidden" name="hidden" value={p!.hidden ? "false" : "true"} />
                <input type="hidden" name="back" value={back} />
                <button className={`btn ${p!.hidden ? "btn-primary" : "btn-ghost"}`}>{p!.hidden ? "Show on site" : "Hide from site"}</button>
              </form>
              <details className={styles.more}>
                <summary>Delete this project</summary>
                <form action={deleteProject} className={styles.form}>
                  <input type="hidden" name="id" value={id} />
                  <label className={styles.inline}>
                    <input type="checkbox" name="confirm" /> Yes, delete this project and all its photos. This can’t be undone.
                  </label>
                  <button className="btn btn-ghost">Delete project</button>
                </form>
              </details>
            </section>
          </div>
        )}
      </div>
    </article>
  );
}

function Text({ name, label, value, hint, required }: { name: string; label: string; value?: string | null; hint?: string; required?: boolean }) {
  return (
    <label className={styles.field}>
      {label}
      <input name={name} defaultValue={value ?? ""} required={required} />
      {hint && <span className="muted">{hint}</span>}
    </label>
  );
}
