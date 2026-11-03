export const MAX_PROOF_BYTES = 4 * 1024 * 1024;
export const proofAccept = "image/jpeg,image/png,image/heic,image/heif,application/pdf,.heic,.heif";

type Sniffed = { ext: string; type: string };

// Trust the file's first bytes, not its name or the type the browser claims.
export function sniffProof(bytes: Uint8Array): Sniffed | null {
  const at = (i: number, ...v: number[]) => v.every((x, k) => bytes[i + k] === x);
  if (at(0, 0xff, 0xd8, 0xff)) return { ext: "jpg", type: "image/jpeg" };
  if (at(0, 0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) return { ext: "png", type: "image/png" };
  if (at(0, 0x25, 0x50, 0x44, 0x46, 0x2d)) return { ext: "pdf", type: "application/pdf" };
  if (at(4, 0x66, 0x74, 0x79, 0x70)) {
    const brand = String.fromCharCode(...bytes.slice(8, 12));
    if (["heic", "heix", "hevc", "heim", "heis", "mif1", "msf1", "heif"].includes(brand)) return { ext: "heic", type: "image/heic" };
  }
  return null;
}

export function proofProblem(file: File | null): string | null {
  if (!file || file.size === 0) return "Upload a screenshot or PDF of your e-transfer.";
  if (file.size > MAX_PROOF_BYTES) return "That file is over 4 MB. Upload a screenshot instead.";
  return null;
}
