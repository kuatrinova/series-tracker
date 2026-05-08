"use client";

import { useState } from "react";
import { ArrowLeft, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/Button";
import { Field, Select, TextArea } from "@/components/Field";
import { Notice } from "@/components/Notice";
import { addManualSeries, addSeriesFromPayload } from "@/features/series/seriesData";
import { AiSeriesResult, platforms, statusLabels, WatchStatus } from "@/lib/types";
import { errorMessage } from "@/lib/errors";

export function AddSeriesView({
  userId,
  onBack,
  onSaved
}: {
  userId: string;
  onBack: () => void;
  onSaved: () => void;
}) {
  const [mode, setMode] = useState<"ai" | "manual">("ai");
  const [query, setQuery] = useState("");
  const [preview, setPreview] = useState<AiSeriesResult | null>(null);
  const [platform, setPlatform] = useState("Netflix");
  const [status, setStatus] = useState<WatchStatus>("watching");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [manual, setManual] = useState({
    title: "",
    year: "",
    genre: "",
    description: "",
    seasons: [{ number: 1, episodes: 8 }]
  });

  async function lookup() {
    setLoading(true);
    setError("");
    setPreview(null);
    try {
      const response = await fetch("/api/series/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: query })
      });
      const data = await response.json();
      if (!response.ok || data.error) throw new Error(data.error || "No se pudo buscar la serie");
      setPreview(data);
      setPlatform(data.platforms?.[0] || "Otra");
    } catch (err) {
      setError(`${errorMessage(err)}. Puedes añadirla manualmente.`);
      setMode("manual");
    } finally {
      setLoading(false);
    }
  }

  async function saveAi() {
    if (!preview) return;
    setLoading(true);
    setError("");
    try {
      await addSeriesFromPayload({ userId, payload: preview, platform, status });
      onSaved();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function saveManual() {
    setLoading(true);
    setError("");
    try {
      await addManualSeries({
        userId,
        title: manual.title,
        year: manual.year ? Number(manual.year) : null,
        genre: manual.genre,
        description: manual.description,
        platform,
        status,
        seasons: manual.seasons
      });
      onSaved();
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
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-mint">Nueva serie</p>
          <h1 className="text-2xl font-bold">Añadir</h1>
        </div>
      </header>

      <div className="mt-5 grid grid-cols-2 rounded-md border border-line bg-panel p-1">
        <button
          onClick={() => setMode("ai")}
          className={`rounded px-3 py-2 text-sm ${mode === "ai" ? "bg-mint text-ink" : "text-zinc-400"}`}
        >
          IA
        </button>
        <button
          onClick={() => setMode("manual")}
          className={`rounded px-3 py-2 text-sm ${mode === "manual" ? "bg-mint text-ink" : "text-zinc-400"}`}
        >
          Manual
        </button>
      </div>

      <section className="mt-5 grid gap-4">
        {error ? <Notice message={error} /> : null}

        {mode === "ai" ? (
          <>
            <Field label="Nombre de la serie" value={query} onChange={(event) => setQuery(event.target.value)} />
            <Button onClick={lookup} disabled={loading || !query.trim()}>
              <Sparkles size={18} />
              {loading ? "Buscando..." : "Buscar con OpenAI"}
            </Button>
            {preview ? (
              <div className="grid gap-3 rounded-md border border-line bg-panel p-4">
                {preview.poster_url ? (
                  <img src={preview.poster_url} alt={preview.title} className="w-28 rounded-md object-cover" />
                ) : null}
                <h2 className="text-xl font-bold">{preview.title}</h2>
                <p className="text-sm text-zinc-400">
                  {preview.year} · {preview.genre} · {preview.status}
                </p>
                <p className="text-sm leading-6 text-zinc-300">{preview.description}</p>
                <p className="font-mono text-xs text-zinc-500">
                  {preview.seasons.length} temporadas · rating {preview.rating ?? "n/d"}
                </p>
                <Select label="Plataforma" value={platform} onChange={(event) => setPlatform(event.target.value)}>
                  {platforms.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </Select>
                <StatusSelect value={status} onChange={setStatus} />
                <Button onClick={saveAi} disabled={loading}>Confirmar y añadir</Button>
              </div>
            ) : null}
          </>
        ) : (
          <>
            <Field
              label="Título"
              value={manual.title}
              onChange={(event) => setManual({ ...manual, title: event.target.value })}
            />
            <Field
              label="Año"
              type="number"
              value={manual.year}
              onChange={(event) => setManual({ ...manual, year: event.target.value })}
            />
            <Field
              label="Género"
              value={manual.genre}
              onChange={(event) => setManual({ ...manual, genre: event.target.value })}
            />
            <TextArea
              label="Descripción"
              value={manual.description}
              onChange={(event) => setManual({ ...manual, description: event.target.value })}
            />
            <Select label="Plataforma" value={platform} onChange={(event) => setPlatform(event.target.value)}>
              {platforms.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </Select>
            <StatusSelect value={status} onChange={setStatus} />
            <div className="grid gap-2">
              <p className="text-sm text-zinc-300">Temporadas</p>
              {manual.seasons.map((season, index) => (
                <div key={index} className="grid grid-cols-2 gap-2">
                  <Field
                    label="Número"
                    type="number"
                    value={season.number}
                    onChange={(event) => {
                      const seasons = [...manual.seasons];
                      seasons[index] = { ...season, number: Number(event.target.value) };
                      setManual({ ...manual, seasons });
                    }}
                  />
                  <Field
                    label="Episodios"
                    type="number"
                    value={season.episodes}
                    onChange={(event) => {
                      const seasons = [...manual.seasons];
                      seasons[index] = { ...season, episodes: Number(event.target.value) };
                      setManual({ ...manual, seasons });
                    }}
                  />
                </div>
              ))}
              <Button
                variant="ghost"
                onClick={() =>
                  setManual({
                    ...manual,
                    seasons: [...manual.seasons, { number: manual.seasons.length + 1, episodes: 8 }]
                  })
                }
              >
                <Plus size={18} /> Añadir temporada
              </Button>
            </div>
            <Button onClick={saveManual} disabled={loading || !manual.title.trim()}>
              {loading ? "Guardando..." : "Guardar serie"}
            </Button>
          </>
        )}
      </section>
    </div>
  );
}

function StatusSelect({
  value,
  onChange
}: {
  value: WatchStatus;
  onChange: (value: WatchStatus) => void;
}) {
  return (
    <Select label="Estado" value={value} onChange={(event) => onChange(event.target.value as WatchStatus)}>
      {(Object.keys(statusLabels) as WatchStatus[]).map((key) => (
        <option key={key} value={key}>
          {statusLabels[key]}
        </option>
      ))}
    </Select>
  );
}
