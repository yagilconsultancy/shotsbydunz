type Mail = { to: string; subject: string; html: string; text: string; replyTo?: string };

// Sends through Resend when RESEND_API_KEY is set. Without a key (local development or the
// preview before email is set up) the message is printed to the server log instead, so the
// form still works end to end.
export async function sendMail(mail: Mail): Promise<{ ok: boolean; logged?: boolean }> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.BOOKING_FROM_EMAIL;
  if (!key || !from) {
    console.log(`[mail not configured] To: ${mail.to}\nSubject: ${mail.subject}\n\n${mail.text}`);
    return { ok: true, logged: true };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [mail.to],
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
      reply_to: mail.replyTo,
    }),
  });
  if (!res.ok) console.error("Resend error", res.status, await res.text());
  return { ok: res.ok };
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
