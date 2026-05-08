"use client";

import { useState } from "react";
import { ArrowLeft, CheckCheck, Send, Trash2 } from "lucide-react";
import { Button } from "@/components/Button";
import { Select } from "@/components/Field";
import { progressPercent, episodeKey } from "@/lib/progress";
import { platforms, Profile, SeriesWithUserData, statusLabels, WatchStatus } from "@/lib/types";

export function SeriesDetailView({
  item,
  otherUsers,
  onBack,
  onUpdateMeta,
  onToggleEpisode,
  onSetSeason,
  onDelete,
  onShare
}: {
  item: SeriesWithUserData;
  otherUsers: Profile[];
  onBack: () => void;
  onUpdateMeta: (values: { platform?: string; status?: WatchStatus }) => void;
  onToggleEpisode: (seasonNumber: number, episodeNumber: number, watched: boolean) => void;
  onSetSeason: (seasonNumber: number, episodeCount: number, watched: boolean) => void;
  onDelete: () => void;
  onShare: (toUserId: string) => void;
}) {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const progress = progressPercent(item.seasons, item.watched);
  const watchedSet = new Set(item.watched.map((episode) => episodeKey(episode.season_number, episode.episode_number)));

  function handleShare() {
    if (otherUsers.length === 1) {
      onShare(otherUsers[0].id);
    } else {
      setShowShareMenu(true);
    }
  }

  return (
    <div className="min-h-screen px-4 py-5 safe-bottom">
      {showShareMenu ? (
        <div className="fixed inset-0 z-50 flex items-end bg-black/60" onClick={() => setShowShareMenu(false)}>
          <div className="w-full rounded-t-2xl border-t border-line bg-panel p-5" onClick={(e) => e.stopPropagation()}>
            <p className="mb-4 text-sm font-semibold text-zinc-300">Enviar a...</p>
            <div className="grid gap-2">
              {otherUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => { onShare(user.id); setShowShareMenu(false); }}
                  className="rounded-md border border-line bg-ink px-4 py-3 text-left text-sm text-zinc-100 hover:border-mint"
                >
                  {user.display_name || user.email}
                </button>
              ))}
            </div>
            <button onClick={() => setShowShareMenu(false)} className="mt-4 w-full text-sm text-zinc-500">
              Cancelar
            </button>
          </div>
        </div>
      ) : null}
      <header className="flex items-center gap-3">
        <button onClick={onBack} className="grid h-11 w-11 place-items-center rounded-md border border-line bg-panel">
          <ArrowLeft size={20} />
        </button>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-mint">Detalle</p>
          <h1 className="truncate text-2xl font-bold">{item.series.title}</h1>
        </div>
        {otherUsers.length > 0 ? (
          <button
            onClick={handleShare}
            title="Enviar a otro usuario"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-md border border-line bg-panel text-mint hover:border-mint"
          >
            <Send size={18} />
          </button>
        ) : null}
        <button
          onClick={() => {
            if (confirm(`¿Eliminar "${item.series.title}" de tu lista?`)) onDelete();
          }}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-md border border-line bg-panel text-red-400 hover:border-red-400"
        >
          <Trash2 size={18} />
        </button>
      </header>

      <section className="mt-5 rounded-md border border-line bg-panel p-4">
        {item.series.poster_url ? (
          <img
            src={item.series.poster_url}
            alt={item.series.title}
            className="mb-4 w-32 rounded-md object-cover"
          />
        ) : null}
        <p className="text-sm text-zinc-400">
          {item.series.year ?? "s/a"} · {item.series.genre ?? "Sin género"} · {item.series.rating ?? "n/d"}
        </p>
        <p className="mt-3 text-sm leading-6 text-zinc-300">{item.series.description || "Sin descripción."}</p>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-ink">
          <div className="h-full rounded-full bg-mint transition-all" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-2 font-mono text-xs text-zinc-500">{progress}% visto</p>
      </section>

      <section className="mt-4 grid grid-cols-2 gap-3">
        <Select label="Plataforma" value={item.platform} onChange={(event) => onUpdateMeta({ platform: event.target.value })}>
          {platforms.map((platform) => (
            <option key={platform}>{platform}</option>
          ))}
        </Select>
        <Select label="Estado" value={item.status} onChange={(event) => onUpdateMeta({ status: event.target.value as WatchStatus })}>
          {(Object.keys(statusLabels) as WatchStatus[]).map((key) => (
            <option key={key} value={key}>
              {statusLabels[key]}
            </option>
          ))}
        </Select>
      </section>

      <section className="mt-5 grid gap-4">
        {item.seasons.map((season) => {
          const seen = Array.from({ length: season.episode_count }, (_, index) =>
            watchedSet.has(episodeKey(season.number, index + 1))
          );
          const seenCount = seen.filter(Boolean).length;
          const seasonDone = seenCount === season.episode_count;
          const seasonProgress = season.episode_count ? Math.round((seenCount / season.episode_count) * 100) : 0;

          return (
            <div key={season.id} className="rounded-md border border-line bg-panel p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-bold text-white">Temporada {season.number}</h2>
                  <p className="font-mono text-xs text-zinc-500">
                    {seenCount}/{season.episode_count} ep · {seasonProgress}%
                  </p>
                </div>
                <Button
                  variant="ghost"
                  className="min-h-9 px-3"
                  onClick={() => onSetSeason(season.number, season.episode_count, !seasonDone)}
                >
                  <CheckCheck size={16} />
                  {seasonDone ? "Desmarcar" : "Marcar"}
                </Button>
              </div>
              <div className="episode-grid mt-4 grid gap-2">
                {Array.from({ length: season.episode_count }, (_, index) => {
                  const episodeNumber = index + 1;
                  const isWatched = watchedSet.has(episodeKey(season.number, episodeNumber));
                  return (
                    <button
                      key={episodeNumber}
                      onClick={() => onToggleEpisode(season.number, episodeNumber, isWatched)}
                      className="aspect-square rounded-md border font-mono text-sm transition"
                      style={{
                        backgroundColor: isWatched ? "#00D4AA22" : "#0A0A0F",
                        borderColor: isWatched ? "#00D4AA" : "#1E1E2E",
                        color: isWatched ? "#00D4AA" : "#A1A1AA"
                      }}
                    >
                      {episodeNumber}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
