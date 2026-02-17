import { NextResponse } from "next/server";
import {
  applyPaymentWebhookUpdate,
  PaymentRequest,
  UserSide,
} from "@/lib/payment-visibility";

type StripeWebhookPayload = {
  side?: UserSide;
  request?: PaymentRequest;
};

export async function POST(httpRequest: Request) {
  try {
    const payload = (await httpRequest.json()) as StripeWebhookPayload;

    if (!payload.side || !payload.request) {
      return NextResponse.json(
        { error: "Payload non valido: side e request sono obbligatori." },
        { status: 400 },
      );
    }

    const updatedRequest = applyPaymentWebhookUpdate(payload.request, payload.side);

    return NextResponse.json({ request: updatedRequest });
  } catch {
    return NextResponse.json({ error: "Webhook Stripe non valido." }, { status: 400 });
  }
}
