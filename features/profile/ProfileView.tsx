"use client";

import { ArrowLeft, LogOut, Shield } from "lucide-react";
import { Button } from "@/components/Button";
import { Profile, SeriesWithUserData } from "@/lib/types";

export function ProfileView({
  profile,
  items,
  onBack,
  onAdmin,
  onLogout
}: {
  profile: Profile | null;
  items: SeriesWithUserData[];
  onBack: () => void;
  onAdmin: () => void;
  onLogout: () => void;
}) {
  const watching = items.filter((item) => item.status === "watching").length;
  const finished = items.filter((item) => item.status === "finished").length;
  const watched = items.reduce((sum, item) => sum + item.watched.length, 0);

  return (
    <div className="min-h-screen px-4 py-5 safe-bottom">
      <header className="flex items-center gap-3">
        <button onClick={onBack} className="grid h-11 w-11 place-items-center rounded-md border border-line bg-panel">
          <ArrowLeft size={20} />
        </button>
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-mint">Perfil</p>
          <h1 className="text-2xl font-bold">{profile?.display_name || "Usuario"}</h1>
        </div>
      </header>

      <section className="mt-5 rounded-md border border-line bg-panel p-4">
        <p className="text-sm text-zinc-400">{profile?.email}</p>
        {profile?.is_admin ? <p className="mt-2 font-mono text-xs text-mint">ADMIN</p> : null}
      </section>

      <section className="mt-4 grid grid-cols-2 gap-3">
        <Stat label="Series" value={items.length} />
        <Stat label="Viendo" value={watching} />
        <Stat label="Terminadas" value={finished} />
        <Stat label="Episodios" value={watched} />
      </section>

      <section className="mt-5 grid gap-3">
        {profile?.is_admin ? (
          <Button onClick={onAdmin} variant="ghost">
            <Shield size={18} /> Panel admin
          </Button>
        ) : null}
        <Button onClick={onLogout} variant="danger">
          <LogOut size={18} /> Cerrar sesión
        </Button>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-line bg-panel p-4">
      <p className="font-mono text-2xl text-mint">{value}</p>
      <p className="mt-1 text-xs text-zinc-500">{label}</p>
    </div>
  );
}
