import { NextResponse } from "next/server";

import { processPaymentWebhook } from "@/lib/services/payment";

export async function POST(request: Request) {
  const rawBody = await request.text();

  if (!rawBody.trim()) {
    return NextResponse.json(
      {
        error: "Invalid webhook payload."
      },
      { status: 400 }
    );
  }

  const result = await processPaymentWebhook({
    creemSignature: request.headers.get("creem-signature"),
    rawBody
  });

  if (!result.ok) {
    const response = mapWebhookErrorResponse(result.error);

    return NextResponse.json(
      {
        error: response.error
      },
      { status: response.status }
    );
  }

  return NextResponse.json(result.data, { status: 200 });
}

function mapWebhookErrorResponse(error: {
  code: string;
  message: string;
}): { error: string; status: number } {
  if (error.code === "configuration_error") {
    return {
      error: "Webhook endpoint is not available.",
      status: 403
    };
  }

  if (error.message.toLowerCase().includes("signature")) {
    return {
      error: "Webhook signature verification failed.",
      status: 401
    };
  }

  return {
    error: "Invalid webhook payload.",
    status: 400
  };
}
