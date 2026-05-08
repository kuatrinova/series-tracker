"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { Button } from "@/components/Button";
import { Select } from "@/components/Field";
import { Notice } from "@/components/Notice";
import { fetchCatalog } from "@/features/series/seriesData";
import { supabase } from "@/lib/supabase/browser";
import { errorMessage } from "@/lib/errors";
import { platforms, Profile, Series } from "@/lib/types";

export function AdminView({ adminId, onBack }: { adminId: string; onBack: () => void }) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [series, setSeries] = useState<Series[]>([]);
  const [profileId, setProfileId] = useState("");
  const [seriesId, setSeriesId] = useState("");
  const [platform, setPlatform] = useState("Netflix");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCatalog()
      .then((data) => {
        setProfiles(data.profiles as Profile[]);
        setSeries(data.series as Series[]);
        setProfileId((data.profiles[0] as Profile | undefined)?.id || "");
        setSeriesId((data.series[0] as Series | undefined)?.id || "");
      })
      .catch((err) => setError(errorMessage(err)));
  }, []);

  async function share() {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const { error: insertError } = await supabase.from("user_series").insert({
        user_id: profileId,
        series_id: seriesId,
        platform,
        status: "pending",
        shared_by: adminId
      });
      if (insertError) throw insertError;
      setMessage("Serie compartida correctamente");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen px-4 py-5 safe-bottom">
      <header className="flex items-center gap-3">
        <button onClick={onBack} className="grid h-11 w-11 place-items-center rounded-md border border-line bg-panel">
          <ArrowLeft size={20} />
        </button>
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-mint">Admin</p>
          <h1 className="text-2xl font-bold">Compartir serie</h1>
        </div>
      </header>

      <section className="mt-5 grid gap-4">
        {error ? <Notice message={error} /> : null}
        {message ? <Notice tone="ok" message={message} /> : null}
        <Select label="Usuario" value={profileId} onChange={(event) => setProfileId(event.target.value)}>
          {profiles.map((profile) => (
            <option key={profile.id} value={profile.id}>
              {profile.email}
            </option>
          ))}
        </Select>
        <Select label="Serie" value={seriesId} onChange={(event) => setSeriesId(event.target.value)}>
          {series.map((item) => (
            <option key={item.id} value={item.id}>
              {item.title}
            </option>
          ))}
        </Select>
        <Select label="Plataforma" value={platform} onChange={(event) => setPlatform(event.target.value)}>
          {platforms.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </Select>
        <Button onClick={share} disabled={loading || !profileId || !seriesId}>
          <Send size={18} />
          {loading ? "Compartiendo..." : "Compartir serie"}
        </Button>
      </section>
    </div>
  );
}
