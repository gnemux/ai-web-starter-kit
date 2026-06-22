import { NextResponse } from "next/server";

import { acknowledgeSandboxWebhook } from "@/lib/services/payment";

export async function POST(request: Request) {
  let payload: Record<string, unknown>;

  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      {
        error: "Invalid JSON payload."
      },
      { status: 400 }
    );
  }

  const result = acknowledgeSandboxWebhook(payload);

  if (!result.ok) {
    const status =
      result.error.code === "configuration_error" ? 403 : 400;

    return NextResponse.json(
      {
        error: result.error.message
      },
      { status }
    );
  }

  return NextResponse.json(result.data, { status: 202 });
}
