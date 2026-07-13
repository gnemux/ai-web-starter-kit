import { getCatCareCatPhotoById } from "@/lib/catcare/product-service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const result = await getCatCareCatPhotoById(id);

  if (!result.ok) {
    return new Response(null, {
      headers: { "Cache-Control": "private, no-store" },
      status: result.error.code === "unauthorized" ? 401 : 404
    });
  }

  return new Response(result.data.body, {
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Type": result.data.contentType,
      "X-Content-Type-Options": "nosniff"
    }
  });
}
