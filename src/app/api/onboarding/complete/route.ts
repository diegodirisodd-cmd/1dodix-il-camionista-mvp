import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { routeForUser } from "@/lib/navigation";

export async function POST() {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json({ error: "Non autenticato." }, { status: 401 });
    }

    const redirectTo = routeForUser({ role: user.role, onboardingCompleted: true });

    return NextResponse.json({ success: true, redirectTo });
  } catch (error) {
    console.error("Errore nel completamento onboarding", error);
    return NextResponse.json({ error: "Impossibile completare l'onboarding." }, { status: 500 });
  }
}
