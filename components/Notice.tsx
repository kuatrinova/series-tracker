"use client";

export function Notice({ message, tone = "error" }: { message: string; tone?: "error" | "ok" }) {
  return (
    <div
      className={`rounded-md border px-3 py-2 text-sm ${
        tone === "ok"
          ? "border-mint/40 bg-mint/10 text-mint"
          : "border-danger/40 bg-danger/10 text-red-200"
      }`}
    >
      {message}
    </div>
  );
}
