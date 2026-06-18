import { NextResponse } from "next/server";

import type { ServiceErrorCode } from "@starter/core";

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

  return NextResponse.json(result, {
    status: result.ok ? 200 : statusByErrorCode[result.error.code]
  });
}
