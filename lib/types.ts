export type WatchStatus = "watching" | "pending" | "finished" | "dropped";

export type Profile = {
  id: string;
  email: string;
  display_name: string | null;
  is_admin: boolean;
  created_at: string;
};

export type Series = {
  id: string;
  title: string;
  year: number | null;
  genre: string | null;
  description: string | null;
  ai_status: string | null;
  rating: number | null;
  poster_url: string | null;
  created_by: string | null;
  created_at: string;
};

export type Season = {
  id: string;
  series_id: string;
  number: number;
  episode_count: number;
};

export type UserSeries = {
  id: string;
  user_id: string;
  series_id: string;
  platform: string;
  status: WatchStatus;
  added_at: string;
  shared_by: string | null;
};

export type WatchedEpisode = {
  id: string;
  user_id: string;
  series_id: string;
  season_number: number;
  episode_number: number;
  watched_at: string;
};

export type SeriesWithUserData = UserSeries & {
  series: Series;
  seasons: Season[];
  watched: WatchedEpisode[];
};

export type AiSeason = {
  number: number;
  episodes: number;
};

export type AiSeriesResult = {
  title: string;
  year: number | null;
  genre: string;
  status: "En emisión" | "Finalizada" | "Cancelada";
  platforms: string[];
  seasons: AiSeason[];
  description: string;
  rating: number | null;
  poster_url: string | null;
};

export const platforms = [
  "Netflix",
  "HBO Max",
  "Disney+",
  "Prime Video",
  "Apple TV+",
  "Movistar+",
  "SkyShowtime",
  "Filmin",
  "Otra"
];

export const statusLabels: Record<WatchStatus, string> = {
  watching: "Viendo",
  pending: "Pendiente",
  finished: "Terminada",
  dropped: "Abandonada"
};

export const statusColors: Record<WatchStatus, string> = {
  watching: "#00D4AA",
  pending: "#F59E0B",
  finished: "#6366F1",
  dropped: "#EF4444"
};
