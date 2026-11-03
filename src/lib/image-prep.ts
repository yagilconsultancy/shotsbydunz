// Runs in Dunz's browser: checks the file, then shrinks it to a web-sized JPEG before upload.

const RAW = /\.(cr2|cr3|nef|arw|dng|raf|orf|rw2|srw|pef)$/i;
const MAX_SIDE = 2400;

export type Prepared = { blob: Blob; width: number; height: number; small: boolean; preview: string };

export async function prepareImage(file: File): Promise<Prepared | { error: string }> {
  if (file.type.startsWith("video/") || /\.(mp4|mov|m4v|avi|webm)$/i.test(file.name))
    return { error: "Videos go on YouTube or Vimeo. Upload it there, then paste the link in the project’s Video box." };
  if (RAW.test(file.name)) return { error: "That’s a camera RAW file. Export it as a JPG from Lightroom or your camera app, then upload the JPG." };
  const heic = /heic|heif/i.test(file.type) || /\.(heic|heif)$/i.test(file.name);
  if (!heic && !/^image\/(jpeg|png|webp)$/.test(file.type))
    return { error: "This folder takes photos only: JPG, PNG or WebP." };

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return {
      error: heic
        ? "This browser can’t open iPhone (HEIC) photos. Upload from your iPhone instead, or export the photo as a JPG."
        : "That photo couldn’t be opened. Try exporting it again as a JPG.",
    };
  }

  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return { error: "This browser can’t prepare photos. Try Chrome or Safari." };
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  let blob: Blob | null = null;
  for (const quality of [0.85, 0.75, 0.65]) {
    blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", quality));
    if (blob && blob.size < 3 * 1024 * 1024) break;
  }
  if (!blob) return { error: "That photo couldn’t be prepared. Try another one." };
  return { blob, width, height, small: Math.max(width, height) < 1200, preview: URL.createObjectURL(blob) };
}
