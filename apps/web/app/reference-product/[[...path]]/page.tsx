import { redirect } from "next/navigation";

type ReferenceProductRedirectProps = {
  params: Promise<{
    path?: string[];
  }>;
};

export default async function ReferenceProductRedirect({
  params
}: ReferenceProductRedirectProps) {
  const { path = [] } = await params;
  const suffix = path.length > 0 ? `/${path.join("/")}` : "";

  redirect(`/catcare${suffix}`);
}
