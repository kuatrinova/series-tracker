import type { Season, WatchedEpisode } from "@/lib/types";

export function totalEpisodes(seasons: Season[]) {
  return seasons.reduce((sum, season) => sum + season.episode_count, 0);
}

export function watchedCount(watched: WatchedEpisode[]) {
  return watched.length;
}

export function progressPercent(seasons: Season[], watched: WatchedEpisode[]) {
  const total = totalEpisodes(seasons);
  if (total === 0) return 0;
  return Math.round((watchedCount(watched) / total) * 100);
}

export function episodeKey(seasonNumber: number, episodeNumber: number) {
  return `${seasonNumber}:${episodeNumber}`;
}
