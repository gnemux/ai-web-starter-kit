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

  return NextResponse.json(sanitizeApiResult(result), {
    status: result.ok ? 200 : statusByErrorCode[result.error.code]
  });
}

function sanitizeApiResult<T>(
  result: Awaited<ReturnType<typeof generateAiTextFromJson>>
) {
  if (result.ok || !isInternalError(result.error.code)) {
    return result;
  }

  return {
    ok: false,
    error: {
      code: result.error.code,
      message: "The AI service is temporarily unavailable."
    }
  } satisfies typeof result;
}

function isInternalError(code: ServiceErrorCode) {
  return code === "configuration_error" || code === "system_error";
}
