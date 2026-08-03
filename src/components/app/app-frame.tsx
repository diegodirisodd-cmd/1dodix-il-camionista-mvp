"use client";

import { useState } from "react";
import Link from "next/link";

import { LogoutButton } from "@/components/logout-button";
import { SubscriptionBadge } from "@/components/subscription-badge";
import { type Role } from "@/lib/roles";
import { hasActiveSubscription } from "@/lib/subscription";

import { AppSidebar } from "./app-sidebar";

type AppUser = {
  email: string;
  role: Role;
  subscriptionActive: boolean;
};

export function AppFrame({ user, children }: { user: AppUser; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const subscriptionActive = hasActiveSubscription(user);

  return (
    <div className="min-h-screen bg-[#f5f7fa] text-textStrong">
      <AppSidebar open={open} onClose={() => setOpen(false)} user={user} />

      <div className="md:ml-64">
        <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/95 backdrop-blur">
          <div className="flex items-center justify-between px-4 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setOpen(true)}
                className="inline-flex items-center justify-center rounded-md border border-neutral-200 px-3 py-2 text-sm font-semibold text-textStrong shadow-sm transition hover:bg-neutral-50 md:hidden"
                aria-label="Apri menu"
              >
                Menu
              </button>
              <Link href="/" className="text-lg font-semibold text-textStrong">
                DodiX – Il Camionista
              </Link>
            </div>

            <div className="flex items-center gap-3 text-sm text-neutral-600">
              <SubscriptionBadge active={subscriptionActive} role={user.role} />
              <LogoutButton variant="light" />
            </div>
          </div>
        </header>

        <main className="px-6 py-8">
          <div className="mx-auto flex max-w-6xl flex-col space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
