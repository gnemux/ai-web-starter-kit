import { CatCareSectionPage } from "../../../section-page";

type CatCarePlanResultsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function CatCarePlanResultsPage({
  params
}: CatCarePlanResultsPageProps) {
  const { id } = await params;

  return (
    <CatCareSectionPage
      activeNav="results"
      nextPath={`/catcare/plans/${encodeURIComponent(id)}/results`}
      section="results"
    />
  );
}
