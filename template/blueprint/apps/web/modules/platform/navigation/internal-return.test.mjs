import assert from "node:assert/strict";
import test from "node:test";
import { normalizeInternalReturn } from "./internal-return.ts";

test("return paths remain same-origin", () => {
  for (const input of ["https://evil.example", "//evil.example", "/\\evil.example", "/\u0007evil", "javascript:alert(1)"]) assert.equal(normalizeInternalReturn(input, "/login"), "/login");
  assert.equal(normalizeInternalReturn("/account?ready=1#profile"), "/account?ready=1#profile");
});
