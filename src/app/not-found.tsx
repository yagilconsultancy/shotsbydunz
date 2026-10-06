import Link from "next/link";

export default function NotFound() {
  return (
    <section className="container page-hero" style={{ paddingBottom: "clamp(64px, 10vw, 128px)" }}>
      <h1>Cut.</h1>
      <p className="lede">That page isn’t here. It may have moved, or the link has a typo.</p>
      <div className="btn-row">
        <Link href="/" className="btn btn-primary">
          Go to the home page
        </Link>
        <Link href="/portfolio" className="btn btn-ghost">
          Watch my work
        </Link>
      </div>
    </section>
  );
}
