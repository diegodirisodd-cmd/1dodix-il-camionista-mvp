import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { routeForUser } from "@/lib/navigation";

export async function POST() {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json({ error: "Non autenticato." }, { status: 401 });
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { onboardingCompleted: true },
      select: { role: true, onboardingCompleted: true },
    });

    const redirectTo = routeForUser({ role: updated.role, onboardingCompleted: updated.onboardingCompleted });

    return NextResponse.json({ success: true, redirectTo });
  } catch (error) {
    console.error("Errore nel completamento onboarding", error);
    return NextResponse.json({ error: "Impossibile completare l'onboarding." }, { status: 500 });
  }
}
