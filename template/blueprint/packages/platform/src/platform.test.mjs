import assert from "node:assert/strict";
import test from "node:test";
import { requireAuthenticatedActor, requireOwner, requireVerifiedEmail } from "./index.ts";

const owner = { id: "owner-a", type: "user", emailVerified: true };
test("platform actor guards remain product and provider independent", () => {
  assert.equal(requireAuthenticatedActor(null).code, "authentication_required");
  assert.equal(requireAuthenticatedActor(owner).ok, true);
  assert.equal(requireVerifiedEmail({ ...owner, emailVerified: false }).code, "email_verification_required");
  assert.equal(requireOwner(owner, { ownerId: "owner-b" }).code, "owner_required");
  assert.equal(requireOwner(owner, { ownerId: "owner-a" }).ok, true);
});
