"use client";

import { useState } from "react";
import { LogIn } from "lucide-react";
import { supabase } from "@/lib/supabase/browser";
import { Button } from "@/components/Button";
import { Field } from "@/components/Field";
import { Notice } from "@/components/Notice";
import { errorMessage } from "@/lib/errors";

export function AuthView() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    setLoading(true);
    setError("");

    try {
      const cleanEmail = email.trim().toLowerCase();
      const result = await supabase.auth.signInAnonymously({
        options: {
          data: {
            email: cleanEmail,
            display_name: cleanEmail.split("@")[0]
          }
        }
      });

      if (result.error) throw result.error;
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col justify-between px-5 py-8 safe-bottom">
      <section className="pt-12">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-mint">SeriesTracker</p>
        <h1 className="mt-3 text-4xl font-bold leading-tight text-white">Entra directo.</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-400">
          Escribe tu email y entra. Sin contraseña, sin enlaces y sin esperar correos.
        </p>
      </section>

      <section className="grid gap-4">
        {error ? <Notice message={error} /> : null}
        <Field label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        <Button onClick={submit} disabled={loading || !email}>
          <LogIn size={18} />
          {loading ? "Entrando..." : "Entrar"}
        </Button>
      </section>
    </div>
  );
}
