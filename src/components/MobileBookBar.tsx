"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./MobileBookBar.module.css";

export default function MobileBookBar() {
  const pathname = usePathname();
  if (pathname.startsWith("/book")) return null;
  const isBooth = pathname.startsWith("/booths");

  return (
    <div className={styles.bar}>
      <Link href={isBooth ? "/book?service=booth" : "/book"} className={`btn ${isBooth ? "btn-booth" : "btn-primary"} ${styles.btn}`}>
        {isBooth ? "Check booth availability" : "Book Me"}
      </Link>
    </div>
  );
}
