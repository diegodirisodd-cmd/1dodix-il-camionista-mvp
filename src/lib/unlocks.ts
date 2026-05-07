import "server-only";

import { prisma } from "./prisma";
import { type Role } from "./roles";

export type UnlockState = {
  unlockedByMe: boolean;
  unlockedByOther: boolean;
  bothUnlocked: boolean;
};

const EMPTY_STATE: UnlockState = {
  unlockedByMe: false,
  unlockedByOther: false,
  bothUnlocked: false,
};

function counterpartRole(role: Role): "COMPANY" | "TRANSPORTER" | null {
  if (role === "COMPANY") return "TRANSPORTER";
  if (role === "TRANSPORTER") return "COMPANY";
  return null;
}

export async function getUnlockState(
  requestId: number,
  userId: number,
  role: Role,
): Promise<UnlockState> {
  if (role === "ADMIN") {
    const unlocks = await prisma.requestUnlock.findMany({
      where: { requestId },
      select: { userRole: true },
    });
    const hasCompany = unlocks.some((u) => u.userRole === "COMPANY");
    const hasTransporter = unlocks.some((u) => u.userRole === "TRANSPORTER");
    const both = hasCompany && hasTransporter;
    return { unlockedByMe: both, unlockedByOther: both, bothUnlocked: both };
  }

  const other = counterpartRole(role);
  if (!other) return EMPTY_STATE;

  const unlocks = await prisma.requestUnlock.findMany({
    where: { requestId },
    select: { userId: true, userRole: true },
  });

  const unlockedByMe = unlocks.some((u) => u.userId === userId);
  const unlockedByOther = unlocks.some((u) => u.userRole === other);

  return {
    unlockedByMe,
    unlockedByOther,
    bothUnlocked: unlockedByMe && unlockedByOther,
  };
}

export async function getUnlockStatesForRequests(
  requestIds: number[],
  userId: number,
  role: Role,
): Promise<Map<number, UnlockState>> {
  const result = new Map<number, UnlockState>();
  if (requestIds.length === 0) return result;

  const unlocks = await prisma.requestUnlock.findMany({
    where: { requestId: { in: requestIds } },
    select: { requestId: true, userId: true, userRole: true },
  });

  const grouped = new Map<number, { userId: number; userRole: string }[]>();
  for (const u of unlocks) {
    const list = grouped.get(u.requestId);
    if (list) list.push({ userId: u.userId, userRole: u.userRole });
    else grouped.set(u.requestId, [{ userId: u.userId, userRole: u.userRole }]);
  }

  if (role === "ADMIN") {
    for (const id of requestIds) {
      const list = grouped.get(id) ?? [];
      const hasCompany = list.some((u) => u.userRole === "COMPANY");
      const hasTransporter = list.some((u) => u.userRole === "TRANSPORTER");
      const both = hasCompany && hasTransporter;
      result.set(id, { unlockedByMe: both, unlockedByOther: both, bothUnlocked: both });
    }
    return result;
  }

  const other = counterpartRole(role);
  for (const id of requestIds) {
    if (!other) {
      result.set(id, EMPTY_STATE);
      continue;
    }
    const list = grouped.get(id) ?? [];
    const unlockedByMe = list.some((u) => u.userId === userId);
    const unlockedByOther = list.some((u) => u.userRole === other);
    result.set(id, {
      unlockedByMe,
      unlockedByOther,
      bothUnlocked: unlockedByMe && unlockedByOther,
    });
  }

  return result;
}
