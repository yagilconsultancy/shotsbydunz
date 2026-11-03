import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { signOut } from "../login/actions";
import styles from "../admin.module.css";

export const metadata: Metadata = { title: "Bookings", robots: { index: false, follow: false } };

export default async function DashLayout({ children }: { children: React.ReactNode }) {
  const email = await requireAdmin();
  return (
    <section className={`container ${styles.wrap}`}>
      <div className={styles.top}>
        <nav className={styles.sections} aria-label="Dashboard">
          <Link href="/admin" className={styles.home}>
            Bookings
          </Link>
          <Link href="/admin/media" className={styles.home}>
            Media
          </Link>
        </nav>
        <form action={signOut} className={styles.who}>
          <span className="muted">{email}</span>
          <button type="submit" className="btn btn-ghost">
            Sign out
          </button>
        </form>
      </div>
      {children}
    </section>
  );
}
