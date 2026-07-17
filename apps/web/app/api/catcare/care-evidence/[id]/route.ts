import { getCatCareEvidenceAttachmentById } from "@/lib/catcare/product-service";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const result = await getCatCareEvidenceAttachmentById(id);

  if (!result.ok) {
    return new Response(null, {
      headers: { "Cache-Control": "private, no-store" },
      status: result.error.code === "unauthorized" ? 401 : 404
    });
  }

  const download = new URL(request.url).searchParams.get("download") === "1";
  const headers: Record<string, string> = {
    "Cache-Control": "private, no-store",
    "Content-Type": result.data.contentType,
    "X-Content-Type-Options": "nosniff"
  };

  if (download) {
    headers["Content-Disposition"] = `attachment; filename="${result.data.downloadName}"`;
  }

  return new Response(result.data.body, { headers });
}
