import { NextResponse } from "next/server";

import type { ServiceErrorCode } from "@starter/core";

import { generateAiTextFromJson } from "@/lib/services/ai";

const statusByErrorCode: Record<ServiceErrorCode, number> = {
  validation_error: 400,
  unauthorized: 401,
  forbidden: 403,
  not_found: 404,
  conflict: 409,
  configuration_error: 500,
  system_error: 500
};

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

  const result = await generateAiTextFromJson(payload);

  return NextResponse.json(result, {
    status: result.ok ? 200 : statusByErrorCode[result.error.code]
  });
}
