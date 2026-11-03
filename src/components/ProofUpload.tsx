"use client";

import { MAX_PROOF_BYTES, proofAccept } from "@/lib/proof";
import styles from "./BookingForm.module.css";

export default function ProofUpload({ file, onFile, error }: { file: File | null; onFile: (f: File | null) => void; error?: string }) {
  return (
    <div className={styles.field} data-field="proof">
      <label htmlFor="proof">Screenshot or PDF of your e-transfer</label>
      <input
        id="proof"
        type="file"
        accept={proofAccept}
        className={styles.file}
        aria-describedby={error ? "proof-hint proof-error" : "proof-hint"}
        aria-invalid={error ? true : undefined}
        onChange={(e) => onFile(e.target.files?.[0] ?? null)}
      />
      <p id="proof-hint" className={styles.hint}>
        JPG, PNG, HEIC or PDF, up to {MAX_PROOF_BYTES / 1024 / 1024} MB.{file ? ` Selected: ${file.name}` : ""}
      </p>
      {error && (
        <p id="proof-error" className={styles.error}>
          {error}
        </p>
      )}
    </div>
  );
}
