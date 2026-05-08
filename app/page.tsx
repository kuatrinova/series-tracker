"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { AppShell } from "@/components/AppShell";
import { Notice } from "@/components/Notice";
import { AuthView } from "@/features/auth/AuthView";
import { AdminView } from "@/features/admin/AdminView";
import { ProfileView } from "@/features/profile/ProfileView";
import { AddSeriesView } from "@/features/series/AddSeriesView";
import { SeriesDetailView } from "@/features/series/SeriesDetailView";
import { SeriesListView } from "@/features/series/SeriesListView";
import {
  fetchUserSeries,
  setSeasonWatched,
  toggleEpisode,
  updateUserSeries
} from "@/features/series/seriesData";
import { errorMessage } from "@/lib/errors";
import { isSupabaseConfigured, supabase } from "@/lib/supabase/browser";
import { Profile, SeriesWithUserData, WatchStatus } from "@/lib/types";

type Screen = "list" | "add" | "detail" | "profile" | "admin";

export default function Home() {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [items, setItems] = useState<SeriesWithUserData[]>([]);
  const [screen, setScreen] = useState<Screen>("list");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<WatchStatus | "all">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const selected = useMemo(() => items.find((item) => item.id === selectedId) || null, [items, selectedId]);

  const refresh = useCallback(async (userId: string) => {
    setError("");
    const {
      data: { user }
    } = await supabase.auth.getUser();
    const email = (user?.email || user?.user_metadata?.email || `${userId}@local.seriestracker`).toLowerCase();
    const displayName = user?.user_metadata?.display_name || email.split("@")[0];

    await supabase.from("profiles").upsert(
      {
        id: userId,
        email,
        display_name: displayName
      },
      { onConflict: "id" }
    );

    const [seriesData, profileResult] = await Promise.all([
      fetchUserSeries(userId),
      supabase.from("profiles").select("*").eq("id", userId).single()
    ]);
    if (profileResult.error) throw profileResult.error;
    setItems(seriesData);
    setProfile(profileResult.data as Profile);
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setError("Configura NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en .env");
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (!data.session) setLoading(false);
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (!nextSession) {
        setProfile(null);
        setItems([]);
        setScreen("list");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session?.user.id) return;
    setLoading(true);
    refresh(session.user.id)
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
  }, [session?.user.id, refresh]);

  async function mutate(action: () => Promise<void>) {
    if (!session?.user.id) return;
    setError("");
    try {
      await action();
      await refresh(session.user.id);
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  if (!session) {
    return (
      <AppShell>
        <AuthView />
      </AppShell>
    );
  }

  return (
    <AppShell>
      {error ? <div className="px-4 pt-4"><Notice message={error} /></div> : null}
      {screen === "list" ? (
        <SeriesListView
          items={items}
          loading={loading}
          search={search}
          status={status}
          setSearch={setSearch}
          setStatus={setStatus}
          onAdd={() => setScreen("add")}
          onProfile={() => setScreen("profile")}
          onOpen={(item) => {
            setSelectedId(item.id);
            setScreen("detail");
          }}
        />
      ) : null}
      {screen === "add" ? (
        <AddSeriesView
          userId={session.user.id}
          onBack={() => setScreen("list")}
          onSaved={() => {
            refresh(session.user.id).finally(() => setScreen("list"));
          }}
        />
      ) : null}
      {screen === "detail" && selected ? (
        <SeriesDetailView
          item={selected}
          onBack={() => setScreen("list")}
          onUpdateMeta={(values) => mutate(() => updateUserSeries(selected.id, values))}
          onToggleEpisode={(seasonNumber, episodeNumber, watched) =>
            mutate(() =>
              toggleEpisode({
                userId: session.user.id,
                seriesId: selected.series_id,
                seasonNumber,
                episodeNumber,
                watched
              })
            )
          }
          onSetSeason={(seasonNumber, episodeCount, watched) =>
            mutate(() =>
              setSeasonWatched({
                userId: session.user.id,
                seriesId: selected.series_id,
                seasonNumber,
                episodeCount,
                watched
              })
            )
          }
        />
      ) : null}
      {screen === "profile" ? (
        <ProfileView
          profile={profile}
          items={items}
          onBack={() => setScreen("list")}
          onAdmin={() => setScreen("admin")}
          onLogout={() => supabase.auth.signOut()}
        />
      ) : null}
      {screen === "admin" ? <AdminView adminId={session.user.id} onBack={() => setScreen("profile")} /> : null}
    </AppShell>
  );
}
