import "server-only";

import { serviceOk, type ServiceResult } from "@xwlc/core";

import { createSupabaseServerClient } from "../../supabase/server";

import {
  CatCareCatsWorkspace,
  CatCarePlan,
  CatCarePlanListWorkspace,
  CatCareWorkspace,
  getAuthenticatedOwnerId,
  loadCatCarePlanSummaries,
  loadCatCareWorkspaceStats,
  loadCatSummaries,
  loadCats
} from "./core";

export async function getCatCareWorkspace(): Promise<
  ServiceResult<CatCareWorkspace>
> {
  const clientResult = await createSupabaseServerClient();

  if (!clientResult.ok) {
    return clientResult;
  }

  const ownerResult = await getAuthenticatedOwnerId(clientResult.data);

  if (!ownerResult.ok) {
    return ownerResult;
  }

  const [catsResult, statsResult] = await Promise.all([
    loadCatSummaries(clientResult.data, ownerResult.data),
    loadCatCareWorkspaceStats(clientResult.data, ownerResult.data)
  ]);

  if (!catsResult.ok) {
    return catsResult;
  }

  if (!statsResult.ok) {
    return statsResult;
  }

  return serviceOk({
    cats: catsResult.data,
    ...statsResult.data
  });
}

export async function getCatCareCatsWorkspace(): Promise<
  ServiceResult<CatCareCatsWorkspace>
> {
  const clientResult = await createSupabaseServerClient();

  if (!clientResult.ok) {
    return clientResult;
  }

  const ownerResult = await getAuthenticatedOwnerId(clientResult.data);

  if (!ownerResult.ok) {
    return ownerResult;
  }

  const catsResult = await loadCats(clientResult.data, ownerResult.data);

  if (!catsResult.ok) {
    return catsResult;
  }

  return serviceOk({ cats: catsResult.data });
}

export async function getCatCarePlanListWorkspace(): Promise<
  ServiceResult<CatCarePlanListWorkspace>
> {
  const clientResult = await createSupabaseServerClient();

  if (!clientResult.ok) {
    return clientResult;
  }

  const ownerResult = await getAuthenticatedOwnerId(clientResult.data);

  if (!ownerResult.ok) {
    return ownerResult;
  }

  const [catsResult, plansResult] = await Promise.all([
    loadCatSummaries(clientResult.data, ownerResult.data),
    loadCatCarePlanSummaries(clientResult.data, ownerResult.data)
  ]);

  if (!catsResult.ok) {
    return catsResult;
  }

  if (!plansResult.ok) {
    return plansResult;
  }

  return serviceOk({
    cats: catsResult.data,
    plans: plansResult.data
  });
}

export async function getCatCarePlanResultsWorkspace(): Promise<
  ServiceResult<{ plans: CatCarePlan[] }>
> {
  const clientResult = await createSupabaseServerClient();

  if (!clientResult.ok) {
    return clientResult;
  }

  const ownerResult = await getAuthenticatedOwnerId(clientResult.data);

  if (!ownerResult.ok) {
    return ownerResult;
  }

  const plansResult = await loadCatCarePlanSummaries(
    clientResult.data,
    ownerResult.data
  );

  if (!plansResult.ok) {
    return plansResult;
  }

  return serviceOk({ plans: plansResult.data });
}

