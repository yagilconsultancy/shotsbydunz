export default function PreviewBanner() {
  if (process.env.NEXT_PUBLIC_PREVIEW_MODE !== "true") return null;
  return (
    <div
      style={{
        background: "var(--amber)",
        color: "var(--amber-ink)",
        fontSize: "var(--step--1)",
        textAlign: "center",
        padding: "6px 16px",
        fontWeight: 600,
      }}
    >
      Preview site. Videos, some prices and some text are samples until the real content is in.
    </div>
  );
}
