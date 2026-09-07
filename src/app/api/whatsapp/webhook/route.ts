import { createWhatsAppWebhook } from "@/lib/whatsapp-webhook";
import { persistWhatsAppReceipt } from "@/lib/whatsapp-webhook-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const handlers = createWhatsAppWebhook({
  config: () => ({
    verifyToken: process.env.WHATSAPP_VERIFY_TOKEN,
    appSecret: process.env.META_APP_SECRET,
    wabaId: process.env.WHATSAPP_WABA_ID,
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
  }),
  persist: persistWhatsAppReceipt,
});

export const GET = handlers.GET;
export const POST = handlers.POST;
