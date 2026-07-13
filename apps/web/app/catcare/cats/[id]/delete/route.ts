import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { deleteCatCareCatById } from "@/lib/catcare/product-service";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const result = await deleteCatCareCatById(id);

  if (!result.ok) {
    const planId = result.error.fields?.planId;
    const reason = result.error.fields?.reason;

    if (result.error.code === "not_found") {
      redirect("/catcare/cats?saved=already_deleted");
    }

    const query = new URLSearchParams({
      delete_error:
        reason === "active_share_link"
          ? "active_share_link"
          : planId
            ? "active_plan"
            : "delete_failed"
    });

    if (planId && planId !== "unknown") {
      query.set("plan_id", planId);
    }

    redirect(`/catcare/cats/${id}?${query.toString()}`);
  }

  revalidatePath("/catcare");
  revalidatePath("/catcare/cats");
  revalidatePath(`/catcare/cats/${id}`);

  redirect("/catcare/cats?saved=deleted");
}
