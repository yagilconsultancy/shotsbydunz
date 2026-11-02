"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Logo from "./Logo";
import Magnet from "./bits/Magnet";
import { getLenis } from "@/lib/motion";
import { nav } from "@/content/site";
import styles from "./Header.module.css";

export default function Header() {
  const pathname = usePathname();
  // Remembering which page the menu was opened on closes it automatically after navigating.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const setOpen = (value: boolean | ((v: boolean) => boolean)) => {
    const next = typeof value === "function" ? value(open) : value;
    setOpenOn(next ? pathname : null);
  };

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (open) getLenis()?.stop();
    else getLenis()?.start();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenOn(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <header className={styles.header}>
      <div className={`container ${styles.bar}`}>
        <Logo />
        <nav className={styles.desktopNav} aria-label="Main">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={styles.link}
              aria-current={isActive(item.href) ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className={styles.actions}>
          <Magnet>
            <Link href="/book" className={`btn btn-primary ${styles.book}`}>
              Book Me
            </Link>
          </Magnet>
          <button
            type="button"
            className={styles.menuBtn}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="visually-hidden">{open ? "Close menu" : "Open menu"}</span>
            <span className={styles.burger} data-open={open} aria-hidden="true" />
          </button>
        </div>
      </div>
      <div id="mobile-menu" className={styles.sheet} data-open={open} hidden={!open} data-lenis-prevent>
        <nav aria-label="Mobile" className="container">
          {[{ href: "/", label: "Home" }, ...nav, { href: "/contact", label: "Contact" }].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={styles.sheetLink}
              aria-current={pathname === item.href ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
