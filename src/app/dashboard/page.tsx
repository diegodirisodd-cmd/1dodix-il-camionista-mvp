import { Suspense } from "react";

import { getSessionUser } from "@/lib/auth";
import { LogoutButton } from "@/components/logout-button";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await getSessionUser();

  if (!user) {
    // Protezione difensiva: il middleware dovrebbe già bloccare l'accesso.
    redirect("/login");
  }

  return (
    <section>
      <h1>Area protetta</h1>
      <p>Benvenuto, {user.email}.</p>

      <div className="form-field">
        <strong>Ruolo:</strong> {user.role}
      </div>
      <div className="form-field">
        <strong>Creato il:</strong> {new Date(user.createdAt).toLocaleString("it-IT")}
      </div>

      <Suspense fallback={<p>Chiusura sessione...</p>}>
        <LogoutButton />
      </Suspense>
    </section>
  );
}
