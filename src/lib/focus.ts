// A photo's focus point travels with its address as "#focus=x,y" (percent from the left and
// from the top). Browsers never send the part after "#" to the server, so storage and caching
// are unaffected, and every component that crops a photo can read it without extra props.

// Where crops are taken from when no focus is set: centred left to right, a quarter of the way
// down. Most photos are tall phone shots with faces near the top, so a centred crop cut heads off.
export const DEFAULT_FOCUS = "50% 25%";

export function withFocus(url: string, x: number | null | undefined, y: number | null | undefined) {
  if (x == null || y == null) return url;
  return `${url}#focus=${Math.round(x)},${Math.round(y)}`;
}

// CSS object-position for a photo address, or undefined to keep the stylesheet's default.
export function focusOf(src: string | undefined): string | undefined {
  const m = src ? /#focus=(\d{1,3}),(\d{1,3})$/.exec(src) : null;
  if (!m) return undefined;
  return `${Math.min(100, Number(m[1]))}% ${Math.min(100, Number(m[2]))}%`;
}

// The plain address, for places that share it outside the page (link previews).
export const plainSrc = (src: string) => src.replace(/#focus=.*$/, "");
