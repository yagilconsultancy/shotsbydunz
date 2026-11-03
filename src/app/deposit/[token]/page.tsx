import type { Metadata } from "next";
import Link from "next/link";
import { findByToken } from "@/lib/bookings";
import { dbConfigured } from "@/lib/supabase";
import { labelFor, money, packageOptions, serviceOptions } from "@/lib/booking";
import { prettyDate, prettyTime } from "@/lib/booking-status";
import { policies, site } from "@/content/site";
import EtransferBox from "@/components/EtransferBox";
import DepositForm from "@/components/DepositForm";
import styles from "@/components/BookingForm.module.css";

export const metadata: Metadata = { title: "Pay your deposit", robots: { index: false, follow: false } };

type Props = { params: Promise<{ token: string }> };

export default async function DepositPage({ params }: Props) {
  const { token } = await params;
  const b = dbConfigured() ? await findByToken(token) : null;

  if (!b || b.deposit_cents == null) {
    return (
      <section className="container page-hero" style={{ paddingBottom: "clamp(64px, 10vw, 128px)", maxWidth: 820 }}>
        <h1>This link has expired.</h1>
        <p className="lede">
          Deposit links work for 7 days and only once. Email <a href={`mailto:${site.email}`} className="text-link">{site.email}</a> or
          text {site.phone} and I’ll send you a new one.
        </p>
        <Link href="/" className="btn btn-ghost">
          Back to the site
        </Link>
      </section>
    );
  }

  const fixing = b.status === "proof_needs_fixing";
  return (
    <section className="container page-hero" style={{ paddingBottom: "clamp(64px, 10vw, 128px)", maxWidth: 720 }}>
      <h1>{fixing ? "Upload a new screenshot" : "Secure your date"}</h1>
      <p className="lede">
        {fixing
          ? "I couldn’t match your e-transfer to the last upload. Check the details below and upload a new screenshot."
          : "Here’s your quote. Send the deposit by e-transfer, then upload your confirmation to secure the date."}
      </p>
      <div className={styles.fields}>
        <section className={styles.summary} aria-label="Your booking">
          <h3>Booking {b.ref}</h3>
          <dl>
            <div>
              <dt>Services</dt>
              <dd>{b.services.map((s) => labelFor(serviceOptions, s)).join(", ")}</dd>
            </div>
            {b.booth_package && (
              <div>
                <dt>Booth</dt>
                <dd>{labelFor(packageOptions, b.booth_package)}</dd>
              </div>
            )}
            <div>
              <dt>When</dt>
              <dd>
                {prettyDate(b.event_date)}, {prettyTime(b.start_time)}, {b.hours} hours
              </dd>
            </div>
            {b.total_cents != null && (
              <div>
                <dt>Total</dt>
                <dd>{money(b.total_cents)}</dd>
              </div>
            )}
            <div>
              <dt>Deposit</dt>
              <dd>{money(b.deposit_cents)} now. {b.services.some((s) => s !== "booth") ? policies.video.balance : policies.booth.balance}.</dd>
            </div>
          </dl>
          {fixing && b.status_note && <p className={styles.small}>What I need: {b.status_note}</p>}
          {!fixing && b.quote_note && <p className={styles.small}>A note from me: {b.quote_note}</p>}
        </section>
        <EtransferBox reference={b.ref} depositCents={b.deposit_cents} />
        <DepositForm token={token} terms={b.services.length === 1 && b.services[0] === "booth" ? "/terms#booth" : "/terms"} />
      </div>
    </section>
  );
}
