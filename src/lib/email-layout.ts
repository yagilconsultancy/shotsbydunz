import { escapeHtml } from "./mail";
import { site } from "@/content/site";

// One branded shell for every booking email. Email apps ignore stylesheets and modern
// layout, so this is tables and inline styles on purpose; it is checked in Gmail, Apple Mail
// and Outlook widths (600px card that shrinks on phones).

const c = {
  page: "#f5efe7",
  ink: "#120e14",
  card: "#ffffff",
  text: "#1f1a1d",
  muted: "#6a5d64",
  line: "#ece4da",
  amber: "#f0b03f",
  amberInk: "#231904",
  tally: "#e5443e",
  soft: "#faf6f0",
};
const serif = "Georgia,'Times New Roman',serif";
const sans = "'Helvetica Neue',Helvetica,Arial,sans-serif";

export type Row = [label: string, value: string];

export type EmailParts = {
  preheader: string;
  eyebrow: string;
  title: string;
  intro: string[];
  steps?: { labels: string[]; current: number };
  highlight?: Row[];
  note?: { label: string; text: string };
  cta?: { href: string; label: string; hint?: string };
  secondary?: { href: string; label: string };
  details?: { title: string; rows: Row[] };
  next?: { title: string; items: string[] };
  footnote?: string;
  signoff?: boolean;
};

const e = escapeHtml;

function stepsHtml({ labels, current }: NonNullable<EmailParts["steps"]>) {
  const cells = labels
    .map((l, i) => {
      const done = i < current;
      const now = i === current;
      const dot = done ? c.ink : now ? c.amber : c.line;
      const ink = done || now ? c.text : c.muted;
      return `<td align="center" valign="top" style="padding:0 4px;width:${Math.floor(100 / labels.length)}%">
        <div style="height:4px;background:${dot};border-radius:2px;margin-bottom:8px"></div>
        <div style="font:${now ? 700 : 400} 12px/1.3 ${sans};color:${ink}">${done ? "&#10003; " : ""}${e(l)}</div>
      </td>`;
    })
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px">${`<tr>${cells}</tr>`}</table>`;
}

function rowsHtml(rows: Row[], big = false) {
  return rows
    .filter(([, v]) => v)
    .map(
      ([k, v], i) => `<tr>
        <td style="padding:${big ? 14 : 10}px 0;${i ? `border-top:1px solid ${c.line};` : ""}font:400 14px/1.4 ${sans};color:${c.muted};vertical-align:top;width:42%">${e(k)}</td>
        <td style="padding:${big ? 14 : 10}px 0;${i ? `border-top:1px solid ${c.line};` : ""}font:${big ? `400 22px/1.2 ${serif}` : `600 14px/1.4 ${sans}`};color:${c.text};text-align:right;vertical-align:top">${e(v)}</td>
      </tr>`,
    )
    .join("");
}

export function renderEmail(p: EmailParts, opts: { siteUrl: string }) {
  const para = (t: string) => `<p style="margin:0 0 16px;font:400 16px/1.6 ${sans};color:${c.text}">${e(t)}</p>`;
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light only"><meta name="supported-color-schemes" content="light only">
<title>${e(p.title)}</title></head>
<body style="margin:0;padding:0;background:${c.page};-webkit-text-size-adjust:100%">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${c.page}">${e(p.preheader)}&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${c.page}">
<tr><td align="center" style="padding:32px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px">

<tr><td style="background:${c.ink};border-radius:14px 14px 0 0;padding:26px 32px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
    <td style="font:400 24px/1 ${serif};color:#f5efe7"><span style="color:${c.tally};font-size:18px;vertical-align:3px">&#9679;</span>&nbsp;Shots<i>by</i>Dunz</td>
    <td align="right" style="font:600 11px/1 ${sans};letter-spacing:1.5px;text-transform:uppercase;color:${c.amber}">${e(p.eyebrow)}</td>
  </tr></table>
</td></tr>

<tr><td style="background:${c.card};padding:36px 32px 12px">
  <h1 style="margin:0 0 20px;font:400 32px/1.15 ${serif};color:${c.text}">${e(p.title)}</h1>
  ${p.steps ? stepsHtml(p.steps) : ""}
  ${p.intro.map(para).join("")}
  ${
    p.highlight
      ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 24px;background:${c.soft};border-radius:10px"><tr><td style="padding:6px 22px">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rowsHtml(p.highlight, true)}</table></td></tr></table>`
      : ""
  }
  ${
    p.note
      ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px"><tr><td style="border-left:3px solid ${c.amber};padding:4px 0 4px 16px">
          <div style="font:600 12px/1.4 ${sans};letter-spacing:1px;text-transform:uppercase;color:${c.muted};margin-bottom:6px">${e(p.note.label)}</div>
          <div style="font:italic 400 17px/1.5 ${serif};color:${c.text};white-space:pre-wrap">${e(p.note.text)}</div></td></tr></table>`
      : ""
  }
  ${
    p.cta
      ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 ${p.cta.hint ? 10 : 28}px"><tr><td style="background:${c.amber};border-radius:999px">
          <a href="${e(p.cta.href)}" style="display:inline-block;padding:15px 30px;font:700 16px/1 ${sans};color:${c.amberInk};text-decoration:none">${e(p.cta.label)}</a></td>
          ${p.secondary ? `<td style="padding-left:16px"><a href="${e(p.secondary.href)}" style="font:600 14px/1 ${sans};color:${c.text}">${e(p.secondary.label)}</a></td>` : ""}
        </tr></table>
        ${p.cta.hint ? `<p style="margin:0 0 28px;font:400 13px/1.5 ${sans};color:${c.muted}">${e(p.cta.hint)}</p>` : ""}`
      : p.secondary
        ? `<p style="margin:0 0 28px"><a href="${e(p.secondary.href)}" style="font:600 14px/1 ${sans};color:${c.text}">${e(p.secondary.label)} &rarr;</a></p>`
        : ""
  }
  ${
    p.details
      ? `<div style="font:600 12px/1.4 ${sans};letter-spacing:1px;text-transform:uppercase;color:${c.muted};margin:8px 0 4px">${e(p.details.title)}</div>
         <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;border-top:1px solid ${c.line};border-bottom:1px solid ${c.line}">${rowsHtml(p.details.rows)}</table>`
      : ""
  }
  ${
    p.next
      ? `<div style="font:600 12px/1.4 ${sans};letter-spacing:1px;text-transform:uppercase;color:${c.muted};margin:0 0 12px">${e(p.next.title)}</div>
         <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px">${p.next.items
           .map(
             (t, i) => `<tr><td valign="top" style="width:30px;padding:0 0 12px"><div style="width:22px;height:22px;border-radius:11px;background:${c.ink};color:#fff;font:700 12px/22px ${sans};text-align:center">${i + 1}</div></td>
               <td style="padding:1px 0 12px;font:400 15px/1.5 ${sans};color:${c.text}">${e(t)}</td></tr>`,
           )
           .join("")}</table>`
      : ""
  }
  ${p.signoff === false ? "" : `<p style="margin:0 0 28px;font:400 16px/1.6 ${sans};color:${c.text}">Talk soon,<br><span style="font:italic 400 20px/1.6 ${serif}">Dunz</span></p>`}
</td></tr>

<tr><td style="background:${c.soft};border-radius:0 0 14px 14px;padding:22px 32px;border-top:1px solid ${c.line}">
  <p style="margin:0 0 6px;font:600 13px/1.5 ${sans};color:${c.text}">${e(site.name)} &middot; Photo, film, content and SBD Booth</p>
  <p style="margin:0 0 12px;font:400 13px/1.6 ${sans};color:${c.muted}">
    ${e(site.city)} &middot; <a href="mailto:${e(site.email)}" style="color:${c.muted}">${e(site.email)}</a> &middot; <a href="${e(site.phoneHref)}" style="color:${c.muted}">${e(site.phone)}</a><br>
    <a href="${e(site.socials.instagram.href)}" style="color:${c.muted}">Instagram ${e(site.socials.instagram.label)}</a> &middot;
    <a href="${e(site.socials.boothInstagram.href)}" style="color:${c.muted}">SBD Booths ${e(site.socials.boothInstagram.label)}</a> &middot;
    <a href="${e(opts.siteUrl)}" style="color:${c.muted}">Website</a>
  </p>
  <p style="margin:0;font:400 12px/1.5 ${sans};color:${c.muted}">${e(p.footnote ?? "You’re getting this because a booking was made on the ShotsByDunz website with this email address. Reply to this email with any questions.")}</p>
</td></tr>

</table></td></tr></table></body></html>`;

  const text = [
    p.title.toUpperCase(),
    ...p.intro,
    ...(p.highlight ? [p.highlight.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join("\n")] : []),
    ...(p.note ? [`${p.note.label}: ${p.note.text}`] : []),
    ...(p.cta ? [`${p.cta.label}: ${p.cta.href}${p.cta.hint ? `\n${p.cta.hint}` : ""}`] : []),
    ...(p.secondary ? [`${p.secondary.label}: ${p.secondary.href}`] : []),
    ...(p.details ? [`${p.details.title.toUpperCase()}\n${p.details.rows.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join("\n")}`] : []),
    ...(p.next ? [`${p.next.title.toUpperCase()}\n${p.next.items.map((t, i) => `${i + 1}. ${t}`).join("\n")}`] : []),
    ...(p.signoff === false ? [] : ["Talk soon,\nDunz"]),
    `${site.name} · ${site.city} · ${site.email} · ${site.phone}`,
  ].join("\n\n");

  return { html, text };
}
