import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/supabase";
import { mediaUrl, type MediaRow, type ProjectRow } from "@/lib/media";
import { fileTypes, mediaFolders, shapeHelp, type MediaFolder } from "@/content/media-folders";
import PhotoUpload from "@/components/admin/PhotoUpload";
import { moveProject, movePhoto, removePhoto, saveDetails, setProjectHidden, undoPhoto } from "./actions";
import styles from "../../admin.module.css";

type Row = MediaRow & { replaced_at: string | null };

const messages: Record<string, string> = {
  undone: "Previous photo is back on the site.",
  saved: "Description saved.",
  removed: "Photo removed from the site.",
  moved: "Order updated.",
  hidden: "Project hidden from the site.",
  shown: "Project is on the site.",
  deleted: "Project deleted.",
  alt: "Descriptions need at least a few words.",
  error: "That didn’t work. Refresh the page and try again.",
};

export default async function MediaPage({ searchParams }: { searchParams: Promise<{ m?: string }> }) {
  await requireAdmin();
  const { m } = await searchParams;
  const [{ data: media, error }, { data: projects }] = await Promise.all([
    db().from("media").select("*").order("created_at", { ascending: false }),
    db().from("projects").select("*").order("position", { ascending: true }),
  ]);

  if (error) {
    return (
      <p className={styles.flash} role="alert">
        The photo folders aren’t set up yet. Run <code>docs/supabase/003_media.sql</code> in Supabase, then reload.
      </p>
    );
  }
  const rows = (media ?? []) as Row[];
  const covers = rows.filter((r) => r.folder === "project-cover" && !r.replaced_at);

  return (
    <>
      <nav className={styles.tabs} aria-label="Media sections">
        <a href="#folders">Site photos</a>
        <a href="#projects">Portfolio projects</a>
      </nav>
      {m && messages[m] && (
        <p className={styles.flash} role="status">
          {messages[m]}
        </p>
      )}
      <p className="muted">
        Each folder is a place on the website. Replace a photo and it changes on the site straight away. Accepted files: {fileTypes}
      </p>

      <div id="folders" className={styles.folders}>
        {mediaFolders.map((f) => (
          <Folder key={f.key} folder={f} rows={rows.filter((r) => r.folder === f.key && !r.project_id)} />
        ))}
      </div>

      <section id="projects" className={styles.panel}>
        <div className={styles.folderHead}>
          <div>
            <h2>Portfolio projects</h2>
            <p className="muted">
              The Work page, in this order. Each project has a cover photo, up to 20 gallery photos and an optional YouTube or Vimeo link.
            </p>
          </div>
          <Link href="/admin/media/projects/new" className="btn btn-primary">
            Add a project
          </Link>
        </div>
        <ul className={styles.projectList}>
          {((projects ?? []) as ProjectRow[]).map((p, i, all) => {
            const cover = covers.find((c) => c.project_id === p.id);
            return (
              <li key={p.id} className={styles.projectRow}>
                {cover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={mediaUrl(cover.path)} alt="" className={styles.thumb} />
                ) : (
                  <span className={styles.thumbEmpty}>No cover</span>
                )}
                <span>
                  <Link href={`/admin/media/projects/${p.id}`} className="text-link">
                    {p.title}
                  </Link>
                  <span className="muted">
                    {" "}
                    {[p.kind, p.year].filter(Boolean).join(", ")}
                    {p.hidden ? " · Hidden" : ""}
                    {p.featured ? " · On home page" : ""}
                  </span>
                </span>
                <span className={styles.rowActions}>
                  <form action={moveProject}>
                    <input type="hidden" name="id" value={p.id} />
                    <input type="hidden" name="dir" value="-1" />
                    <button className="btn btn-ghost" disabled={i === 0} aria-label={`Move ${p.title} up`}>
                      ↑
                    </button>
                  </form>
                  <form action={moveProject}>
                    <input type="hidden" name="id" value={p.id} />
                    <input type="hidden" name="dir" value="1" />
                    <button className="btn btn-ghost" disabled={i === all.length - 1} aria-label={`Move ${p.title} down`}>
                      ↓
                    </button>
                  </form>
                  <form action={setProjectHidden}>
                    <input type="hidden" name="id" value={p.id} />
                    <input type="hidden" name="hidden" value={p.hidden ? "false" : "true"} />
                    <input type="hidden" name="back" value="/admin/media" />
                    <button className="btn btn-ghost">{p.hidden ? "Show" : "Hide"}</button>
                  </form>
                </span>
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}

function Folder({ folder, rows }: { folder: MediaFolder; rows: Row[] }) {
  const shape = shapeHelp[folder.shape];
  const live = rows.filter((r) => !r.replaced_at).sort((a, b) => a.position - b.position);
  const anchor = `f-${folder.key}`;

  return (
    <section id={anchor} className={styles.panel}>
      <div className={styles.folderHead}>
        <div>
          <h2>{folder.title}</h2>
          <p>
            <strong>Where:</strong> {folder.where}
          </p>
          <p>
            <strong>What goes here:</strong> {folder.what}
          </p>
        </div>
        <ul className={styles.chips} aria-label="Folder rules">
          <li>
            <span className={styles.shapeIcon} style={{ aspectRatio: shape.ratio }} aria-hidden="true" />
            {shape.label}
          </li>
          <li>
            {folder.kind === "fixed" ? `${folder.max} photo${folder.max > 1 ? "s" : ""}` : `Up to ${folder.max} photos`}
          </li>
          <li>JPG, PNG, WebP, HEIC</li>
        </ul>
      </div>
      <p className="muted">{shape.tip}</p>

      <div className={styles.spots}>
        {folder.kind === "fixed"
          ? folder.fallback.map((fb, i) => {
              const row = live.find((r) => r.position === i);
              const history = rows.some((r) => r.position === i && r.replaced_at);
              return (
                <Spot
                  key={i}
                  folder={folder}
                  anchor={anchor}
                  title={folder.spots?.[i] ?? (folder.max > 1 ? `Photo ${i + 1}` : "Current photo")}
                  src={row ? mediaUrl(row.path) : fb.src}
                  builtIn={!row}
                  row={row}
                  position={i}
                  canUndo={!!row || history}
                  fallbackAlt={fb.alt}
                  fallbackCaption={fb.caption}
                />
              );
            })
          : live.map((row, i) => (
              <Spot key={row.id} folder={folder} anchor={anchor} title={`Photo ${i + 1}`} src={mediaUrl(row.path)} row={row} list={{ first: i === 0, last: i === live.length - 1 }} />
            ))}
      </div>

      {folder.kind === "list" && (
        <>
          {live.length === 0 && <p className="muted">No photos yet. Until you add some, the site uses its built-in sample photos here.</p>}
          {live.length < folder.max ? (
            <PhotoUpload folder={folder.key} label="Add a photo" captionLabel={folder.captions} />
          ) : (
            <p className="muted">This folder is full. Remove a photo to add another.</p>
          )}
        </>
      )}
    </section>
  );
}

function Spot({
  folder,
  anchor,
  title,
  src,
  row,
  builtIn,
  position,
  canUndo,
  fallbackAlt,
  fallbackCaption,
  list,
}: {
  folder: MediaFolder;
  anchor: string;
  title: string;
  src: string;
  row?: Row;
  builtIn?: boolean;
  position?: number;
  canUndo?: boolean;
  fallbackAlt?: string;
  fallbackCaption?: string;
  list?: { first: boolean; last: boolean };
}) {
  const hidden = (
    <>
      <input type="hidden" name="folder" value={folder.key} />
      <input type="hidden" name="back" value="/admin/media" />
      <input type="hidden" name="anchor" value={anchor} />
    </>
  );
  return (
    <figure className={styles.spot}>
      <div className={styles.spotImage} style={{ aspectRatio: shapeHelp[folder.shape].ratio }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" />
      </div>
      <figcaption>
        <strong>{title}</strong> {builtIn && <span className="muted">(built-in sample)</span>}
      </figcaption>

      {position !== undefined && (
        <PhotoUpload
          folder={folder.key}
          position={position}
          label={builtIn ? "Upload your photo" : "Replace"}
          defaultAlt={row?.alt ?? ""}
          captionLabel={folder.captions}
          defaultCaption={row?.caption ?? fallbackCaption ?? ""}
        />
      )}

      {row && (
        <form action={saveDetails} className={styles.altForm}>
          {hidden}
          <input type="hidden" name="id" value={row.id} />
          <label>
            Description
            <input name="alt" defaultValue={row.alt} maxLength={200} required minLength={3} />
          </label>
          {folder.captions && (
            <label>
              {folder.captions}
              <input name="caption" defaultValue={row.caption ?? ""} maxLength={60} />
            </label>
          )}
          <button className="btn btn-ghost">Save</button>
        </form>
      )}
      {builtIn && fallbackAlt && <p className="muted">Sample description: {fallbackAlt}</p>}

      <div className={styles.rowActions}>
        {canUndo && position !== undefined && (
          <form action={undoPhoto}>
            {hidden}
            <input type="hidden" name="position" value={position} />
            <button className="btn btn-ghost">Undo to previous</button>
          </form>
        )}
        {list && row && (
          <>
            <form action={movePhoto}>
              {hidden}
              <input type="hidden" name="id" value={row.id} />
              <input type="hidden" name="dir" value="-1" />
              <button className="btn btn-ghost" disabled={list.first} aria-label="Move earlier">
                ↑
              </button>
            </form>
            <form action={movePhoto}>
              {hidden}
              <input type="hidden" name="id" value={row.id} />
              <input type="hidden" name="dir" value="1" />
              <button className="btn btn-ghost" disabled={list.last} aria-label="Move later">
                ↓
              </button>
            </form>
            <form action={removePhoto}>
              {hidden}
              <input type="hidden" name="id" value={row.id} />
              <button className="btn btn-ghost">Remove</button>
            </form>
          </>
        )}
      </div>
    </figure>
  );
}
