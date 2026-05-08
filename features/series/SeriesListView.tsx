"use client";

import { Plus, Search, UserCircle } from "lucide-react";
import { Button } from "@/components/Button";
import { SeriesCard } from "@/features/series/SeriesCard";
import { SeriesWithUserData, statusLabels, WatchStatus } from "@/lib/types";

export function SeriesListView({
  items,
  loading,
  search,
  status,
  setSearch,
  setStatus,
  onAdd,
  onProfile,
  onOpen
}: {
  items: SeriesWithUserData[];
  loading: boolean;
  search: string;
  status: WatchStatus | "all";
  setSearch: (value: string) => void;
  setStatus: (value: WatchStatus | "all") => void;
  onAdd: () => void;
  onProfile: () => void;
  onOpen: (item: SeriesWithUserData) => void;
}) {
  const filtered = items.filter((item) => {
    const matchesSearch = item.series.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = status === "all" || item.status === status;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen px-4 py-5 safe-bottom">
      <header className="flex items-center justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-mint">SeriesTracker</p>
          <h1 className="text-3xl font-bold text-white">Mis series</h1>
        </div>
        <button
          onClick={onProfile}
          className="grid h-11 w-11 place-items-center rounded-md border border-line bg-panel text-zinc-200"
          aria-label="Perfil"
        >
          <UserCircle size={22} />
        </button>
      </header>

      <div className="mt-5 flex gap-2">
        <label className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar"
            className="h-11 w-full rounded-md border border-line bg-panel pl-10 pr-3 text-sm outline-none focus:border-mint"
          />
        </label>
        <Button onClick={onAdd} className="h-11 w-11 px-0" aria-label="Añadir serie">
          <Plus size={20} />
        </Button>
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
        {(["all", "watching", "pending", "finished", "dropped"] as const).map((value) => (
          <button
            key={value}
            onClick={() => setStatus(value)}
            className={`shrink-0 rounded-md border px-3 py-2 text-xs ${
              status === value ? "border-mint bg-mint text-ink" : "border-line bg-panel text-zinc-300"
            }`}
          >
            {value === "all" ? "Todas" : statusLabels[value]}
          </button>
        ))}
      </div>

      <section className="mt-4 grid gap-3">
        {loading ? <p className="py-12 text-center text-sm text-zinc-500">Cargando...</p> : null}
        {!loading && filtered.length === 0 ? (
          <div className="rounded-md border border-line bg-panel p-6 text-center text-sm text-zinc-400">
            No hay series en esta vista.
          </div>
        ) : null}
        {filtered.map((item) => (
          <SeriesCard key={item.id} item={item} onOpen={onOpen} />
        ))}
      </section>
    </div>
  );
}
