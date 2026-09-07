import { Prisma, PrismaClient } from "@prisma/client";

import type { WebhookReceipt } from "@/lib/whatsapp-webhook";

const cache = globalThis as unknown as { whatsappPrisma?: PrismaClient };

export async function persistWhatsAppReceipt(receipt: WebhookReceipt): Promise<void> {
  // Reuse one lazy server client. Unlike the app's general client, it must not
  // log Prisma errors that could include the incoming message data/arguments.
  const client = cache.whatsappPrisma ??= new PrismaClient({ log: [] });
  // PostgreSQL ON CONFLICT DO NOTHING also handles concurrent redeliveries.
  await client.whatsAppWebhookReceipt.createMany({
    data: [{ ...receipt, payload: receipt.payload as Prisma.InputJsonObject }],
    skipDuplicates: true,
  });
}
