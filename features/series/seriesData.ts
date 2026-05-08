"use client";

import { supabase } from "@/lib/supabase/browser";
import type { AiSeriesResult, Season, Series, SeriesWithUserData, UserSeries, WatchedEpisode, WatchStatus } from "@/lib/types";

type UserSeriesRow = UserSeries & {
  series: Series | null;
};

export async function fetchUserSeries(userId: string): Promise<SeriesWithUserData[]> {
  const { data: rows, error } = await supabase
    .from("user_series")
    .select("*, series(*)")
    .eq("user_id", userId)
    .order("added_at", { ascending: false });

  if (error) throw error;

  const typedRows = (rows ?? []) as UserSeriesRow[];
  const seriesIds = typedRows.map((row) => row.series_id);

  const [{ data: seasons, error: seasonsError }, { data: watched, error: watchedError }] = await Promise.all([
    seriesIds.length
      ? supabase.from("seasons").select("*").in("series_id", seriesIds).order("number")
      : Promise.resolve({ data: [], error: null }),
    seriesIds.length
      ? supabase.from("watched_episodes").select("*").eq("user_id", userId).in("series_id", seriesIds)
      : Promise.resolve({ data: [], error: null })
  ]);

  if (seasonsError) throw seasonsError;
  if (watchedError) throw watchedError;

  return typedRows
    .filter((row): row is UserSeriesRow & { series: Series } => Boolean(row.series))
    .map((row) => ({
      ...row,
      series: row.series,
      seasons: ((seasons ?? []) as Season[]).filter((season) => season.series_id === row.series_id),
      watched: ((watched ?? []) as WatchedEpisode[]).filter((episode) => episode.series_id === row.series_id)
    }));
}

export async function fetchCatalog() {
  const [{ data: series, error: seriesError }, { data: profiles, error: profilesError }] = await Promise.all([
    supabase.from("series").select("*").order("title"),
    supabase.from("profiles").select("*").order("email")
  ]);

  if (seriesError) throw seriesError;
  if (profilesError) throw profilesError;
  return { series: series ?? [], profiles: profiles ?? [] };
}

export async function updateUserSeries(id: string, values: { platform?: string; status?: WatchStatus }) {
  const { error } = await supabase.from("user_series").update(values).eq("id", id);
  if (error) throw error;
}

export async function toggleEpisode(params: {
  userId: string;
  seriesId: string;
  seasonNumber: number;
  episodeNumber: number;
  watched: boolean;
}) {
  if (params.watched) {
    const { error } = await supabase
      .from("watched_episodes")
      .delete()
      .eq("user_id", params.userId)
      .eq("series_id", params.seriesId)
      .eq("season_number", params.seasonNumber)
      .eq("episode_number", params.episodeNumber);
    if (error) throw error;
    return;
  }

  const { error } = await supabase.from("watched_episodes").insert({
    user_id: params.userId,
    series_id: params.seriesId,
    season_number: params.seasonNumber,
    episode_number: params.episodeNumber
  });
  if (error && error.code !== "23505") throw error;
}

export async function setSeasonWatched(params: {
  userId: string;
  seriesId: string;
  seasonNumber: number;
  episodeCount: number;
  watched: boolean;
}) {
  if (params.watched) {
    const rows = Array.from({ length: params.episodeCount }, (_, index) => ({
      user_id: params.userId,
      series_id: params.seriesId,
      season_number: params.seasonNumber,
      episode_number: index + 1
    }));
    const { error } = await supabase.from("watched_episodes").upsert(rows, {
      onConflict: "user_id,series_id,season_number,episode_number",
      ignoreDuplicates: true
    });
    if (error) throw error;
    return;
  }

  const { error } = await supabase
    .from("watched_episodes")
    .delete()
    .eq("user_id", params.userId)
    .eq("series_id", params.seriesId)
    .eq("season_number", params.seasonNumber);
  if (error) throw error;
}

export async function addManualSeries(params: {
  userId: string;
  title: string;
  year: number | null;
  genre: string;
  description: string;
  platform: string;
  status: WatchStatus;
  seasons: { number: number; episodes: number }[];
}) {
  return addSeriesFromPayload({
    userId: params.userId,
    payload: {
      title: params.title,
      year: params.year,
      genre: params.genre,
      description: params.description,
      rating: null,
      status: "En emisión",
      platforms: [params.platform],
      seasons: params.seasons,
      poster_url: null
    },
    platform: params.platform,
    status: params.status
  });
}

export async function addSeriesFromPayload(params: {
  userId: string;
  payload: AiSeriesResult;
  platform: string;
  status: WatchStatus;
}) {
  const title = params.payload.title.trim();
  const { data: existing, error: findError } = await supabase
    .from("series")
    .select("*")
    .ilike("title", title)
    .limit(1)
    .maybeSingle();

  if (findError) throw findError;

  let seriesId = existing?.id as string | undefined;

  if (!seriesId) {
    const { data: created, error: createError } = await supabase
      .from("series")
      .insert({
        title,
        year: params.payload.year,
        genre: params.payload.genre,
        description: params.payload.description,
        ai_status: params.payload.status,
        rating: params.payload.rating,
        poster_url: params.payload.poster_url ?? null,
        created_by: params.userId
      })
      .select("*")
      .single();

    if (createError) throw createError;
    seriesId = created.id;

    const seasonRows = params.payload.seasons
      .filter((season) => season.number > 0 && season.episodes > 0)
      .map((season) => ({
        series_id: seriesId,
        number: season.number,
        episode_count: season.episodes
      }));

    if (seasonRows.length) {
      const { error: seasonsError } = await supabase.from("seasons").insert(seasonRows);
      if (seasonsError) throw seasonsError;
    }
  }

  const { error: userSeriesError } = await supabase.from("user_series").upsert(
    {
      user_id: params.userId,
      series_id: seriesId,
      platform: params.platform || "Otra",
      status: params.status
    },
    { onConflict: "user_id,series_id" }
  );
  if (userSeriesError) throw userSeriesError;
}
