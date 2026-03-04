"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function StripeSuccessContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const sessionId = searchParams.get("session_id");
    const requestId = searchParams.get("requestId");
    const role = searchParams.get("role");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [errorMessage, setErrorMessage] = useState("");

  const requestPath = useMemo(() => {
        if (!requestId || !role) return null;
        if (role === "company") {
                return `/dashboard/company/requests/${requestId}`;
        }
        if (role === "transporter") {
                return `/dashboard/transporter/requests/${requestId}`;
        }
        return null;
  }, [requestId, role]);

  useEffect(() => {
        if (!sessionId || !requestId || !role) {
                setStatus("error");
                setErrorMessage("Parametri mancanti. Controlla il link e riprova.");
                return;
        }

                const confirm = async () => {
                        try {
                                  const response = await fetch("/api/stripe/confirm", {
                                              method: "POST",
                                              headers: { "Content-Type": "application/json" },
                                              body: JSON.stringify({
                                                            session_id: sessionId,
                                                            requestId: Number(requestId),
                                                            role,
                                              }),
                                  });

                          if (response.ok && requestPath) {
                                      setStatus("success");
                                      setTimeout(() => {
                                                    router.push(requestPath);
                                      }, 2500);
                          } else {
                                      const data = await response.json().catch(() => ({}));
                                      setStatus("error");
                                      setErrorMessage(
                                                    data.error || "Errore nella conferma del pagamento. Il pagamento è stato comunque elaborato."
                                                  );
                          }
                        } catch (err) {
                                  console.error("Stripe confirm error:", err);
                                  setStatus("error");
                                  setErrorMessage(
                                              "Errore di rete. Il pagamento è stato elaborato ma la conferma non è riuscita. Torna alla dashboard per verificare."
                                            );
                        }
                };

                void confirm();
  }, [requestId, requestPath, role, router, sessionId]);

  if (status === "loading") {
        return (
                <section className="space-y-4 p-6">
                        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                                  <p className="font-semibold">Conferma pagame"use client";
                                  
                                  import { Suspense, useEffect, useMemo, useState } from "react";
                                  import { useRouter, useSearchParams } from "next/navigation";
                                  
                                  function StripeSuccessContent() {
                                      const router = useRouter();
                                    const searchParams = useSearchParams();
                                    const sessionId = searchParams.get("session_id");
                                    const requestId = searchParams.get("requestId");
                                    const role = searchParams.get("role");
                                  
                                    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
                                      const [errorMessage, setErrorMessage] = useState("");
                                    
                                      const requestPath = useMemo(() => {
                                            if (!requestId || !role) return null;
                                        if (role === "company") {
                                                return `/dashboard/company/requests/${requestId}`;
                                      }
                                        if (role === "transporter") {
                                                return `/dashboard/transporter/requests/${requestId}`;
                                      }
                                        return null;
                                      }, [requestId, role]);
                                    
                                      useEffect(() => {
                                            if (!sessionId || !requestId || !role) {
                                                    setStatus("error");
                                          setErrorMessage("Parametri mancanti. Controlla il link e riprova.");
                                          return;
                                      }
                                    
                                        const confirm = async () => {
                                                try {
                                                          const response = await fetch("/api/stripe/confirm", {
                                                                      method: "POST",
                                                                      headers: { "Content-Type": "application/json" },
                                                                      body: JSON.stringify({
                                                                                    session_id: sessionId,
                                                                                    requestId: Number(requestId),
                                                                                    role,
                                                                      }),
                                                          });
                                                  
                                                          if (response.ok && requestPath) {
                                                            setStatus("success");
                                              setTimeout(() => {
                                                            router.push(requestPath);
                                      }, 2500);
                                      } else {
                                                  const data = await response.json().catch(() => ({}));
                                              setStatus("error");
                                              setErrorMessage(
                                                data.error || "Errore nella conferma del pagamento. Il pagamento è stato comunque elaborato."
                                              );
                                      }
                                      } catch (err) {
                                                console.error("Stripe confirm error:", err);
                                            setStatus("error");
                                            setErrorMessage(
                                              "Errore di rete. Il pagamento è stato elaborato ma la conferma non è riuscita. Torna alla dashboard per verificare."
                                            );
                                      }
                                      };
                                    
                                        void confirm();
                                      }, [requestId, requestPath, role, router, sessionId]);
                                    
                                      if (status === "loading") {
                                            return (
                                          <section className="space-y-4 p-6">
                                                  <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                                                            <p className="font-semibold">Conferma pagamento in corso...</p>p>
                                                            <p className="mt-1 text-blue-600">Attendere, non chiudere questa pagina.</p>p>
                                                  </div>div>
                                          </section>section>
                                        );
                                      }
                                    
                                      if (status === "error") {
                                            return (
                                          <section className="space-y-4 p-6">
                                                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                                            <p className="font-semibold">Attenzione</p>p>
                                                            <p className="mt-1">{errorMessage}</p>p>
                                                  </div>div>
                                                  <button
                                                              type="button"
                                                              className="btn-primary"
                                                              onClick={() => (requestPath ? router.push(requestPath) : router.push("/dashboard"))}
                                                            >
                                                            Torna alla dashboard
                                                  </button>button>
                                          </section>section>
                                        );
                                      }
          <p className="mt-1 text-emerald-600">Verrai reindirizzato automaticamente tra pochi secondi...</p>p>
                                    </>div>
                                  </p>div>
                              <button
                                        type="button"
                                        className="btn-primary"
                                        onClick={() => (requestPath ? router.push(requestPath) : router.back())}
                                      >
                                      Vai ai dettagli ora
                              </button>button>
                        </div>section>
                  );
                  }
                
                export default function StripeSuccessPage() {
                    return (
                    <Suspense
                            fallback={
                                      <section className="space-y-4 p-6">
                                                <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                                                            <p className="font-semibold">Caricamento...</p>p>
                                                </div>div>
                                      </section>section>
                      }
                        >
                          <StripeSuccessContent />
                    </Suspense>Suspense>
                  );
                  }</p>
