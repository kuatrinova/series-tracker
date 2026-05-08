"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Notice } from "@/components/Notice";
import { supabase } from "@/lib/supabase/browser";
import { errorMessage } from "@/lib/errors";

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<CallbackShell />}>
      <CallbackContent />
    </Suspense>
  );
}

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");

  useEffect(() => {
    async function finishLogin() {
      try {
        const code = searchParams.get("code");

        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
        } else {
          const { data, error: sessionError } = await supabase.auth.getSession();
          if (sessionError) throw sessionError;
          if (!data.session) throw new Error("No se encontró sesión en el enlace de acceso");
        }

        router.replace("/");
      } catch (err) {
        setError(errorMessage(err));
      }
    }

    finishLogin();
  }, [router, searchParams]);

  return (
    <CallbackShell error={error} />
  );
}

function CallbackShell({ error = "" }: { error?: string }) {
  return (
    <AppShell>
      <div className="grid min-h-screen content-center gap-4 px-5 text-center safe-bottom">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-mint">SeriesTracker</p>
        <h1 className="text-2xl font-bold text-white">Entrando...</h1>
        <p className="text-sm text-zinc-400">Estamos validando el enlace de acceso.</p>
        {error ? <Notice message={error} /> : null}
      </div>
    </AppShell>
  );
}
