import { createCatCareCatAction } from "../../actions";
import { CatProfileForm } from "../../cat-profile-ui";
import { getCatCareContentContext } from "../../catcare-shell";

export default async function NewCatCareCatPage() {
  const context = await getCatCareContentContext();

  return (
    <>
      <CatProfileForm
        action={createCatCareCatAction}
        locale={context.locale}
        mode="create"
      />
    </>
  );
}
