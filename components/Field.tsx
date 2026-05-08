"use client";

import { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

export function Field({
  label,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="grid gap-2 text-sm text-zinc-300">
      <span>{label}</span>
      <input
        {...props}
        className="min-h-11 rounded-md border border-line bg-panel px-3 text-zinc-100 outline-none focus:border-mint"
      />
    </label>
  );
}

export function TextArea({
  label,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  return (
    <label className="grid gap-2 text-sm text-zinc-300">
      <span>{label}</span>
      <textarea
        {...props}
        className="min-h-24 rounded-md border border-line bg-panel px-3 py-3 text-zinc-100 outline-none focus:border-mint"
      />
    </label>
  );
}

export function Select({
  label,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { label: string }) {
  return (
    <label className="grid gap-2 text-sm text-zinc-300">
      <span>{label}</span>
      <select
        {...props}
        className="min-h-11 rounded-md border border-line bg-panel px-3 text-zinc-100 outline-none focus:border-mint"
      >
        {children}
      </select>
    </label>
  );
}
