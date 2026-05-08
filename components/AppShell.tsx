"use client";

import { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-ink text-zinc-100">
      <div className="mx-auto min-h-screen w-full max-w-[430px] border-x border-line bg-ink safe-top">
        {children}
      </div>
    </main>
  );
}
