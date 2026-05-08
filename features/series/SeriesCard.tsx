"use client";

import { Tv } from "lucide-react";
import { progressPercent, totalEpisodes, watchedCount } from "@/lib/progress";
import { SeriesWithUserData, statusColors, statusLabels } from "@/lib/types";

export function SeriesCard({
  item,
  onOpen
}: {
  item: SeriesWithUserData;
  onOpen: (item: SeriesWithUserData) => void;
}) {
  const progress = progressPercent(item.seasons, item.watched);
  const statusColor = statusColors[item.status];

  return (
    <button
      onClick={() => onOpen(item)}
      className="w-full rounded-md border border-line bg-panel p-4 text-left transition hover:border-mint/50"
    >
      <div className="flex items-start gap-3">
        <div className="h-16 w-11 shrink-0 overflow-hidden rounded-md border border-line bg-ink">
          {item.series.poster_url ? (
            <img src={item.series.poster_url} alt={item.series.title} className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full w-full place-items-center text-mint">
              <Tv size={20} />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-bold text-white">{item.series.title}</h3>
          <p className="mt-1 text-xs text-zinc-400">
            {item.platform} · {watchedCount(item.watched)}/{totalEpisodes(item.seasons)} episodios
          </p>
        </div>
        <span
          className="rounded px-2 py-1 font-mono text-[10px]"
          style={{ color: statusColor, backgroundColor: `${statusColor}1A` }}
        >
          {statusLabels[item.status]}
        </span>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-ink">
        <div className="h-full rounded-full bg-mint transition-all" style={{ width: `${progress}%` }} />
      </div>
      <p className="mt-2 font-mono text-xs text-zinc-500">{progress}% completado</p>
    </button>
  );
}
