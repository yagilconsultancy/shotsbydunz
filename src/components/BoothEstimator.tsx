"use client";

import Link from "next/link";
import { useState } from "react";
import { boothAddOns, boothPackages } from "@/content/booths";
import { boothPrice, money } from "@/lib/booking";
import styles from "./BoothEstimator.module.css";

const extraHour = boothAddOns.find((a) => a.id === "extra-hour")!;
const keychain = boothAddOns.find((a) => a.id === "keychains")!;
const toggles = boothAddOns.filter((a) => a.id !== "extra-hour");
const MAX_HOURS = 10;

// The total uses boothPrice from lib/booking, the same sum the booking form and server use,
// so what a visitor sees here is what they'll be asked to pay.
function Rolling({ value }: { value: string }) {
  return (
    <span className={styles.rolling} aria-label={value}>
      {[...value].map((c, i) =>
        /\d/.test(c) ? (
          <span key={i} className={styles.slot} aria-hidden="true">
            <span style={{ transform: `translateY(${-Number(c) * 10}%)` }}>
              {"0123456789".split("").map((d) => (
                <b key={d}>{d}</b>
              ))}
            </span>
          </span>
        ) : (
          <span key={i} aria-hidden="true">
            {c}
          </span>
        ),
      )}
    </span>
  );
}

export default function BoothEstimator() {
  const [pkgId, setPkgId] = useState(boothPackages.find((p) => p.highlight)?.id ?? boothPackages[0].id);
  const [hours, setHours] = useState(3);
  const [addOns, setAddOns] = useState<string[]>([]);
  const [keys, setKeys] = useState(keychain.minQty ?? 50);
  const pkg = boothPackages.find((p) => p.id === pkgId)!;

  const visible = toggles.filter((a) => !(a.id === "prints-upgrade" && pkgId === "unlimited-prints"));
  const chosen = addOns.filter((id) => visible.some((a) => a.id === id));
  const price = boothPrice({ boothPackage: pkgId, hours: String(hours), addOns: chosen, keychains: String(keys) });

  const toggle = (id: string) => setAddOns((list) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]));
  const href = `/book?${new URLSearchParams({
    service: "booth",
    package: pkgId,
    hours: String(hours),
    ...(chosen.length ? { addons: chosen.join(",") } : {}),
    ...(chosen.includes("keychains") ? { keychains: String(keys) } : {}),
  })}`;

  return (
    <div className={styles.wrap}>
      <div className={styles.cards} role="radiogroup" aria-label="Package">
        {boothPackages.map((p) => {
          const on = p.id === pkgId;
          const base = p.id === "unlimited-prints";
          return (
            <button
              key={p.id}
              type="button"
              role="radio"
              aria-checked={on}
              className={styles.card}
              data-highlight={p.highlight ? "" : undefined}
              onClick={() => setPkgId(p.id)}
            >
              <span className={styles.cardTop}>
                <span className={styles.radio} aria-hidden="true" />
                {p.highlight && <span className={styles.badge}>Most booked</span>}
              </span>
              <span className={styles.cardName}>{p.name}</span>
              <span className={styles.cardPrice}>
                ${p.price}
                <small>for {p.hours} hours</small>
              </span>
              <ul className={styles.list}>
                {p.includes.map((t) => (
                  <li key={t} data-plus={base && t !== "Everything in Digital" ? "" : undefined}>
                    {t}
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>

      <div className={styles.builder} aria-labelledby="build-title">
        <h3 id="build-title" className={styles.builderTitle}>
          Build your night
        </h3>

        <div className={styles.row}>
          <div>
            <p className={styles.rowName}>Hours</p>
            <p className={styles.rowHint}>
              {pkg.hours} included, then {extraHour.price}
            </p>
          </div>
          <div className={styles.stepper}>
            <button type="button" onClick={() => setHours((h) => Math.max(pkg.hours, h - 1))} disabled={hours <= pkg.hours} aria-label="One hour less">
              −
            </button>
            <output aria-live="polite">{hours}</output>
            <button type="button" onClick={() => setHours((h) => Math.min(MAX_HOURS, h + 1))} disabled={hours >= MAX_HOURS} aria-label="One hour more">
              +
            </button>
          </div>
        </div>

        <ul className={styles.addOns}>
          {visible.map((a) => {
            const on = chosen.includes(a.id);
            return (
              <li key={a.id} data-on={on ? "" : undefined}>
                <label className={styles.addOn}>
                  <input type="checkbox" checked={on} onChange={() => toggle(a.id)} />
                  <span className={styles.switch} aria-hidden="true" />
                  <span>
                    <span className={styles.rowName}>{a.name}</span>
                    <span className={styles.rowHint}>{a.price}</span>
                  </span>
                </label>
                {a.id === "keychains" && on && (
                  <div className={`${styles.stepper} ${styles.small}`}>
                    <button type="button" onClick={() => setKeys((k) => Math.max(keychain.minQty ?? 50, k - 10))} disabled={keys <= (keychain.minQty ?? 50)} aria-label="Ten fewer keychains">
                      −
                    </button>
                    <output aria-live="polite">{keys}</output>
                    <button type="button" onClick={() => setKeys((k) => Math.min(500, k + 10))} aria-label="Ten more keychains">
                      +
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        {price && (
          <div className={styles.total}>
            <div>
              <p className={styles.rowHint}>Estimated total</p>
              <p className={styles.totalValue}>
                <Rolling value={money(price.totalCents)} />
              </p>
            </div>
            <div className={styles.deposit}>
              <p className={styles.rowHint}>50% deposit today</p>
              <p className={styles.depositValue}>
                <Rolling value={money(price.depositCents)} />
              </p>
            </div>
          </div>
        )}
        <p className={styles.note}>Travel outside London is added after booking.</p>
        <Link href={href} className={`btn btn-booth ${styles.cta}`}>
          Book with these choices
        </Link>
      </div>
    </div>
  );
}
