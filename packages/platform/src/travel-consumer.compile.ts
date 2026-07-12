import {
  resolveShareTokenGate,
  type ShareTokenGateRecord
} from "@xwlc/platform";

type TravelResource = "travel_itinerary";
type TravelScope = "itinerary_view";

const fixture: ShareTokenGateRecord<TravelResource, TravelScope> = {
  expiresAt: "2027-01-01T00:00:00.000Z",
  ownerId: "travel-owner",
  resourceId: "travel-itinerary",
  resourceType: "travel_itinerary",
  revokedAt: null,
  scope: "itinerary_view",
  tokenId: "travel-token"
};

export const travelShareGateCompileFixture = resolveShareTokenGate({
  record: fixture,
  secretVerified: true
});
