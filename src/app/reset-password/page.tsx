"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [email, setEmail] = useState("");
  const [requestSent, setRequestSent] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestError, setRequestError] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setRequestLoading(true);
    setRequestError("");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setRequestError(data.error || "Errore durante la richiesta.");
      } else {
        setRequestSent(true);
      }
    } catch {
      setRequestError("Errore di connessione. Riprova.");
    } finally {
      setRequestLoading(false);
    }
  };

  const handleNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError("");
    if (password !== confirmPassword) {
      setResetError("Le password non coincidono.");
      return;
    }
    if (password.length < 6) {
      setResetError("La password deve avere almeno 6 caratteri.");
      return;
    }
    setResetLoading(true);
    try {
      const res = await fetch("/api/auth/new-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResetError(data.error || "Errore durante il reset.");
      } else {
        setResetSuccess(true);
        setTimeout(() => router.push("/login"), 3000);
      }
    } catch {
      setResetError("Errore di connessione. Riprova.");
    } finally {
      setResetLoading(false);
    }
  };

  if (token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Nuova password</h1>
              <p className="text-gray-500 mt-2">Scegli una nuova password per il tuo account.</p>
            </div>
            {resetSuccess ? (
              <div className="text-center">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <p className="text-green-700 font-medium">Password aggiornata con successo!</p>
                  <p className="text-green-600 text-sm mt-1">Verrai reindirizzato alla pagina di accesso...</p>
                </div>
                <Link href="/login" className="text-cyan-600 hover:text-cyan-700 font-medium">Vai al login</Link>
              </div>
            ) : (
              <form onSubmit={handleNewPassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nuova password</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent" placeholder="Minimo 6 caratteri" required minLength={6} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Conferma password</label>
                  <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent" placeholder="Ripeti la password" required minLength={6} />
                </div>
                {resetError && (<div className="bg-red-50 border border-red-200 rounded-lg p-3"><p className="text-red-600 text-sm">{resetError}</p></div>)}
                <button type="submit" disabled={resetLoading} className="w-full bg-[#0b3c5d] text-white py-3 rounded-lg font-semibold hover:bg-[#0d4a73] transition-colors disabled:opacity-50">{resetLoading ? "Aggiornamento..." : "Aggiorna password"}</button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Password dimenticata?</h1>
            <p className="text-gray-500 mt-2">Inserisci la tua email e ti invieremo un link per reimpostare la password.</p>
          </div>
          {requestSent ? (
            <div className="text-center">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <p className="text-green-700 font-medium">Email inviata!</p>
                <p className="text-green-600 text-sm mt-1">Se l&apos;email è registrata, riceverai un link per reimpostare la password. Controlla anche la cartella spam.</p>
              </div>
              <Link href="/login" className="text-cyan-600 hover:text-cyan-700 font-medium">Torna al login</Link>
            </div>
          ) : (
            <form onSubmit={handleRequestReset} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email aziendale</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent" placeholder="La tua email registrata" required />
              </div>
              {requestError && (<div className="bg-red-50 border border-red-200 rounded-lg p-3"><p className="text-red-600 text-sm">{requestError}</p></div>)}
              <button type="submit" disabled={requestLoading} className="w-full bg-[#0b3c5d] text-white py-3 rounded-lg font-semibold hover:bg-[#0d4a73] transition-colors disabled:opacity-50">{requestLoading ? "Invio in corso..." : "Invia link di reset"}</button>
              <div className="text-center">
                <Link href="/login" className="text-gray-500 hover:text-gray-700 text-sm">Torna al login</Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
