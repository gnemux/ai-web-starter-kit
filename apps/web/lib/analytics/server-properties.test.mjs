import assert from "node:assert/strict";
import test from "node:test";

import { sanitizeServerProperties } from "./server-properties.ts";

test("final server sanitizer keeps safe product result and outcome", () => {
  assert.deepEqual(
    sanitizeServerProperties({
      outcome: "revoked",
      provider: "posthog",
      result: "updated",
      unknown: "blocked"
    }),
    {
      outcome: "revoked",
      provider: "posthog",
      result: "updated"
    }
  );
});
