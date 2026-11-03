"use client";

import { useState } from "react";
import { toEmbed } from "@/lib/video";

// Checks the details before sending so Dunz doesn't lose what she typed; the server checks
// everything again.
export default function ProjectForm({
  action,
  className,
  errorClass,
  children,
}: {
  action: (fd: FormData) => Promise<void>;
  className?: string;
  errorClass?: string;
  children: React.ReactNode;
}) {
  const [error, setError] = useState("");
  return (
    <form
      action={action}
      className={className}
      noValidate
      onSubmit={(e) => {
        const fd = new FormData(e.currentTarget);
        const video = String(fd.get("video") ?? "").trim();
        const problem = !String(fd.get("title") ?? "").trim()
          ? "Give the project a title."
          : fd.getAll("pillars").length === 0
            ? "Tick at least one category."
            : video && !toEmbed(video)
              ? "That video link isn’t a YouTube or Vimeo link. Copy the address from the video page and paste it again."
              : "";
        setError(problem);
        if (problem) e.preventDefault();
      }}
    >
      {children}
      {error && (
        <p className={errorClass} role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
