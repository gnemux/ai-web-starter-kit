import { uploadAnonymousCareEvidence } from "@/lib/catcare/product-service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ submissionId: string }> }
) {
  const { submissionId } = await params;
  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return Response.json(
      { error: "照片请求无效。" },
      { headers: { "Cache-Control": "no-store" }, status: 400 }
    );
  }

  const result = await uploadAnonymousCareEvidence({
    file: formData.get("photo"),
    secret: String(formData.get("token") ?? "").trim(),
    submissionId
  });

  if (!result.ok) {
    const status = result.error.code === "unauthorized"
      ? 401
      : result.error.code === "forbidden"
        ? 403
        : result.error.code === "validation_error"
          ? 400
          : 500;

    return Response.json(
      { error: result.error.message },
      { headers: { "Cache-Control": "no-store" }, status }
    );
  }

  return Response.json(result.data, {
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff"
    }
  });
}
