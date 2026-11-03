type Mail = { to: string; subject: string; html: string; text: string; replyTo?: string };

export type MailResult = { ok: boolean; notConfigured?: boolean };

// Without a Resend key, local development prints the message so the form can be tested end
// to end. A deployed site refuses instead: pretending to send would lose real enquiries, and
// printing them would put visitors' details in the hosting logs.
export async function sendMail(mail: Mail): Promise<MailResult> {
  const key = process.env.RESEND_API_KEY;
  const address = process.env.BOOKING_FROM_EMAIL?.trim();
  // Vercel can mangle the space in "Name <email>", so the variable holds the bare address.
  const from = address && !address.includes("<") ? `ShotsByDunz <${address}>` : address;
  if (!key || !from) {
    if (process.env.NODE_ENV === "development") {
      console.log(`[mail not configured] To: ${mail.to}\nSubject: ${mail.subject}\n\n${mail.text}`);
      return { ok: true };
    }
    return { ok: false, notConfigured: true };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [mail.to], subject: mail.subject, html: mail.html, text: mail.text, reply_to: mail.replyTo }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) console.error("Resend error", res.status);
    return { ok: res.ok };
  } catch {
    console.error("Resend unreachable");
    return { ok: false };
  }
}

export function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

export function rowsToHtml(title: string, rows: [string, string][]) {
  const body = rows
    .filter(([, v]) => v)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:8px 12px;color:#6b5f66;vertical-align:top;white-space:nowrap">${escapeHtml(k)}</td><td style="padding:8px 12px;white-space:pre-wrap">${escapeHtml(v)}</td></tr>`,
    )
    .join("");
  return `<div style="font-family:Arial,sans-serif;font-size:15px;color:#1f1a1d"><h2 style="margin:0 0 12px">${escapeHtml(title)}</h2><table style="border-collapse:collapse">${body}</table></div>`;
}

export function rowsToText(rows: [string, string][]) {
  return rows
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");
}
