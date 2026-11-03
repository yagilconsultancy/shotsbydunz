import { etransfer } from "@/content/site";
import { money } from "@/lib/booking";
import styles from "./BookingForm.module.css";

export default function EtransferBox({ reference, depositCents }: { reference: string; depositCents: number }) {
  return (
    <section className={styles.summary} aria-label="How to pay your deposit">
      <h3>Send {money(depositCents)} by Interac e-Transfer</h3>
      <dl>
        <div>
          <dt>Send to</dt>
          <dd>
            <strong>{etransfer.email}</strong>
            <br />
            <span className="muted">{etransfer.name}</span>
          </dd>
        </div>
        <div>
          <dt>Amount</dt>
          <dd>
            <strong>{money(depositCents)}</strong>
          </dd>
        </div>
        <div>
          <dt>Message</dt>
          <dd>
            <strong className={styles.ref}>{reference}</strong>
          </dd>
        </div>
        {!etransfer.autodeposit && (
          <div>
            <dt>Security</dt>
            <dd>
              Question: {etransfer.question}
              <br />
              Answer: <strong className={styles.ref}>{reference}</strong>
            </dd>
          </div>
        )}
      </dl>
      <p className={styles.small}>Then take a screenshot of the confirmation screen in your banking app and upload it below.</p>
    </section>
  );
}
