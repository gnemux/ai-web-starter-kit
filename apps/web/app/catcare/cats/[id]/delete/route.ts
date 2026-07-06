import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { deleteCatCareCatById } from "@/lib/catcare/product-service";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await deleteCatCareCatById(id);

  revalidatePath("/catcare");
  revalidatePath("/catcare/cats");
  revalidatePath(`/catcare/cats/${id}`);

  redirect("/catcare/cats?saved=deleted");
}
