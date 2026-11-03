"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { getUploadPass, saveUpload } from "@/app/admin/(dash)/media/actions";
import { prepareImage, type Prepared } from "@/lib/image-prep";
import styles from "@/app/admin/admin.module.css";

type Props = {
  folder: string;
  projectId?: string;
  position?: number;
  label: string;
  defaultAlt?: string;
  captionLabel?: string;
  defaultCaption?: string;
};

const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

export default function PhotoUpload({ folder, projectId, position, label, defaultAlt = "", captionLabel, defaultCaption = "" }: Props) {
  const router = useRouter();
  const [ready, setReady] = useState<Prepared | null>(null);
  const [alt, setAlt] = useState(defaultAlt);
  const [caption, setCaption] = useState(defaultCaption);
  const [state, setState] = useState<"idle" | "preparing" | "uploading">("idle");
  const [error, setError] = useState("");

  const choose = async (file: File | undefined) => {
    setError("");
    setReady(null);
    if (!file) return;
    setState("preparing");
    const result = await prepareImage(file);
    setState("idle");
    if ("error" in result) return setError(result.error);
    setReady(result);
  };

  const upload = async () => {
    if (!ready) return;
    if (alt.trim().length < 3) return setError("Add a short description first, for example “Bride and groom’s first dance”.");
    setState("uploading");
    setError("");
    const pass = await getUploadPass({ folder, projectId });
    if ("error" in pass) {
      setState("idle");
      return setError(pass.error ?? "Upload failed.");
    }
    const put = await fetch(pass.signedUrl, {
      method: "PUT",
      headers: { "content-type": "image/jpeg", "x-upsert": "false", apikey: supabaseKey },
      body: ready.blob,
    }).catch(() => null);
    if (!put?.ok) {
      setState("idle");
      return setError("The upload didn’t go through. Check your connection and try again.");
    }
    const saved = await saveUpload({ folder, projectId, position, path: pass.path, alt, caption, width: ready.width, height: ready.height });
    setState("idle");
    if ("error" in saved) return setError(saved.error ?? "Saving failed.");
    URL.revokeObjectURL(ready.preview);
    setReady(null);
    router.refresh();
  };

  return (
    <div className={styles.uploader}>
      <label className="btn btn-ghost">
        {state === "preparing" ? "Preparing…" : label}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
          className="visually-hidden"
          onChange={(e) => {
            choose(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </label>
      {ready && (
        <div className={styles.pending}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={ready.preview} alt="" className={styles.pendingImg} />
          <div className={styles.pendingFields}>
            {ready.small && <p className={styles.warn}>This photo is quite small, so it may look soft on big screens.</p>}
            <label>
              Description (what’s in the photo)
              <input value={alt} maxLength={200} onChange={(e) => setAlt(e.target.value)} placeholder="e.g. Guests dancing under string lights" />
            </label>
            {captionLabel && (
              <label>
                {captionLabel}
                <input value={caption} maxLength={60} onChange={(e) => setCaption(e.target.value)} />
              </label>
            )}
            <div className="btn-row">
              <button type="button" className="btn btn-primary" onClick={upload} disabled={state === "uploading"}>
                {state === "uploading" ? "Uploading…" : "Put it on the site"}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setReady(null)} disabled={state === "uploading"}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {error && (
        <p className={styles.uploadError} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
