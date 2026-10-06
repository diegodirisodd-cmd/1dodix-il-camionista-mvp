import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { displayName } from "@/lib/load-flow";
import { notifyNewMessage } from "@/lib/load-notifications";
import { prisma } from "@/lib/prisma";
import { REQUEST_STATUS, maskContacts } from "@/lib/request-flow";

const NOTIFY_GAP_MS = 30 * 60 * 1000;

async function loadThread(applicationId: number, userId: number) {
  if (!Number.isInteger(applicationId) || applicationId <= 0) return null;
  const app = await prisma.application.findUnique({
    where: { id: applicationId },
    select: {
      id: true,
      transporterId: true,
      transporter: { select: { email: true, firstName: true, lastName: true, companyName: true } },
      request: {
        select: {
          id: true,
          pickup: true,
          delivery: true,
          status: true,
          companyId: true,
          transporterId: true,
          company: { select: { email: true, firstName: true, lastName: true, companyName: true } },
        },
      },
    },
  });
  if (!app) return null;
  const isCompany = app.request.companyId === userId;
  const isTransporter = app.transporterId === userId;
  if (!isCompany && !isTransporter) return null;
  const contactsOpen =
    (app.request.status === REQUEST_STATUS.CONFIRMED || app.request.status === REQUEST_STATUS.DELIVERED) &&
    app.request.transporterId === app.transporterId;
  return { app, isCompany, contactsOpen };
}

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

  const thread = await loadThread(Number(params.id), user.id);
  if (!thread) return NextResponse.json({ error: "Conversazione non trovata" }, { status: 404 });

  const messages = await prisma.message.findMany({
    where: { applicationId: thread.app.id },
    orderBy: { createdAt: "asc" },
    take: 300,
    select: { id: true, senderId: true, body: true, createdAt: true, readAt: true },
  });

  await prisma.message.updateMany({
    where: { applicationId: thread.app.id, senderId: { not: user.id }, readAt: null },
    data: { readAt: new Date() },
  });

  return NextResponse.json({
    contactsOpen: thread.contactsOpen,
    messages: messages.map((m) => ({ ...m, mine: m.senderId === user.id })),
  });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

  const thread = await loadThread(Number(params.id), user.id);
  if (!thread) return NextResponse.json({ error: "Conversazione non trovata" }, { status: 404 });
  if (thread.app.request.status === REQUEST_STATUS.CANCELLED) {
    return NextResponse.json({ error: "Il carico è stato annullato." }, { status: 409 });
  }

  const body = (await req.json().catch(() => null)) as { body?: unknown } | null;
  const raw = typeof body?.body === "string" ? body.body.trim().slice(0, 2000) : "";
  if (!raw) return NextResponse.json({ error: "Messaggio vuoto" }, { status: 400 });

  const { text, masked } = thread.contactsOpen ? { text: raw, masked: false } : maskContacts(raw);

  const last = await prisma.message.findFirst({
    where: { applicationId: thread.app.id, senderId: user.id },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });

  const message = await prisma.message.create({
    data: { applicationId: thread.app.id, senderId: user.id, body: text },
    select: { id: true, senderId: true, body: true, createdAt: true, readAt: true },
  });

  if (!last || Date.now() - last.createdAt.getTime() > NOTIFY_GAP_MS) {
    const sender = thread.isCompany ? thread.app.request.company : thread.app.transporter;
    const recipient = thread.isCompany ? thread.app.transporter : thread.app.request.company;
    await notifyNewMessage(recipient, thread.app.request, displayName(sender), thread.isCompany ? "TRANSPORTER" : "COMPANY");
  }

  return NextResponse.json({ message: { ...message, mine: true }, masked }, { status: 201 });
}
