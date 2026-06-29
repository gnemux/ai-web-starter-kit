import { NextResponse } from "next/server";

import type { ServiceErrorCode } from "@xwlc/core";

import { listDemoItems } from "@/lib/services/demo-items";

const statusByErrorCode: Record<ServiceErrorCode, number> = {
  validation_error: 400,
  unauthorized: 401,
  forbidden: 403,
  not_found: 404,
  conflict: 409,
  configuration_error: 500,
  system_error: 500
};

export async function GET() {
  const result = await listDemoItems();

  return NextResponse.json(sanitizeApiResult(result), {
    status: result.ok ? 200 : statusByErrorCode[result.error.code]
  });
}

function sanitizeApiResult(
  result: Awaited<ReturnType<typeof listDemoItems>>
) {
  if (result.ok || !isInternalError(result.error.code)) {
    return result;
  }

  return {
    ok: false,
    error: {
      code: result.error.code,
      message: "The demo data service is temporarily unavailable."
    }
  } satisfies typeof result;
}

function isInternalError(code: ServiceErrorCode) {
  return code === "configuration_error" || code === "system_error";
}
