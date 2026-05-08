"use client";

import { useState } from "react";
import { LogIn, Mail } from "lucide-react";
import { supabase } from "@/lib/supabase/browser";
import { Button } from "@/components/Button";
import { Field } from "@/components/Field";
import { Notice } from "@/components/Notice";
import { errorMessage } from "@/lib/errors";

export function AuthView() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function sendOtp() {
    setLoading(true);
    setError("");
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: { shouldCreateUser: true }
      });
      if (error) throw error;
      setStep("otp");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp() {
    setLoading(true);
    setError("");
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: code.trim(),
        type: "email"
      });
      if (error) throw error;
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
        {step === "email" ? (
          <>
            <h1 className="mt-3 text-4xl font-bold leading-tight text-white">Entra directo.</h1>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              Escribe tu email y te mandamos un código de acceso.
            </p>
          </>
        ) : (
          <>
            <h1 className="mt-3 text-4xl font-bold leading-tight text-white">Código enviado.</h1>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              Revisa tu correo <span className="text-white">{email}</span> e introduce el código de 6 dígitos.
            </p>
          </>
        )}
      </section>

      <section className="grid gap-4">
        {error ? <Notice message={error} /> : null}
        {step === "email" ? (
          <>
            <Field
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && email && sendOtp()}
            />
            <Button onClick={sendOtp} disabled={loading || !email.trim()}>
              <Mail size={18} />
              {loading ? "Enviando..." : "Enviar código"}
            </Button>
          </>
        ) : (
          <>
            <Field
              label="Código de 6 dígitos"
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              onKeyDown={(e) => e.key === "Enter" && code.length === 6 && verifyOtp()}
            />
            <Button onClick={verifyOtp} disabled={loading || code.length !== 6}>
              <LogIn size={18} />
              {loading ? "Verificando..." : "Entrar"}
            </Button>
            <button
              onClick={() => { setStep("email"); setCode(""); setError(""); }}
              className="text-sm text-zinc-500 hover:text-zinc-300"
            >
              Usar otro email
            </button>
          </>
        )}
      </section>
    </div>
  );
}
