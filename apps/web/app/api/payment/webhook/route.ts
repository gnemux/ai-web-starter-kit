import { NextResponse } from "next/server";

import { processPaymentWebhook } from "@/lib/services/payment";

export async function POST(request: Request) {
  const rawBody = await request.text();

  if (!rawBody.trim()) {
    return NextResponse.json(
      {
        error: "Invalid JSON payload."
      },
      { status: 400 }
    );
  }

  const result = await processPaymentWebhook({
    creemSignature: request.headers.get("creem-signature"),
    rawBody
  });

  if (!result.ok) {
    const status =
      result.error.code === "configuration_error"
        ? 403
        : result.error.message.includes("signature")
          ? 401
          : 400;

    return NextResponse.json(
      {
        error: result.error.message
      },
      { status }
    );
  }

  return NextResponse.json(result.data, { status: 200 });
}
