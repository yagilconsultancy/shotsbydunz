// Turns any YouTube or Vimeo link Dunz pastes into a privacy-friendly embed address.
// Anything else returns null, so only those two players can ever appear on the site.
export function toEmbed(input: string): string | null {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    return null;
  }
  if (url.protocol !== "https:") return null;
  const host = url.hostname.replace(/^www\.|^m\./, "");
  const id = (s: string | null | undefined, re: RegExp) => (s && re.test(s) ? s : null);
  const yt = /^[A-Za-z0-9_-]{11}$/;

  if (host === "youtu.be") {
    const v = id(url.pathname.slice(1), yt);
    return v && `https://www.youtube-nocookie.com/embed/${v}`;
  }
  if (host === "youtube.com" || host === "youtube-nocookie.com") {
    const parts = url.pathname.split("/").filter(Boolean);
    const v =
      id(url.searchParams.get("v"), yt) ?? (["embed", "shorts", "live"].includes(parts[0]) ? id(parts[1], yt) : null);
    return v && `https://www.youtube-nocookie.com/embed/${v}`;
  }
  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const parts = url.pathname.split("/").filter(Boolean);
    const v = parts.find((p) => /^\d{6,12}$/.test(p));
    const hash = parts[parts.indexOf(v ?? "") + 1];
    const h = hash && /^[0-9a-f]{6,20}$/.test(hash) ? `?h=${hash}` : url.searchParams.get("h")?.match(/^[0-9a-f]{6,20}$/) ? `?h=${url.searchParams.get("h")}` : "";
    return v ? `https://player.vimeo.com/video/${v}${h}` : null;
  }
  return null;
}
