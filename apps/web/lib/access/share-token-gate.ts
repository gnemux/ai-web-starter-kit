import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

export type ShareTokenHashResult =
  | { data: string; ok: true }
  | {
      error: {
        code: "validation_error";
        fields: { token: "invalid" };
        message: string;
      };
      ok: false;
    };

export function createShareTokenCredential() {
  const secret = randomBytes(32).toString("base64url");
  const hashResult = hashShareTokenSecret(secret);

  if (!hashResult.ok) {
    throw new Error("Generated share token could not be hashed.");
  }

  return { secret, tokenHash: hashResult.data };
}

export function hashShareTokenSecret(secret: string): ShareTokenHashResult {
  const normalized = secret.trim();

  if (normalized.length < 32) {
    return {
      error: {
        code: "validation_error",
        fields: { token: "invalid" },
        message: "Share token is invalid."
      },
      ok: false
    };
  }

  return {
    data: createHash("sha256")
      .update(normalized, "utf8")
      .digest("base64url"),
    ok: true
  };
}

export function verifyShareTokenSecret(secret: string, hash: string): boolean {
  const hashResult = hashShareTokenSecret(secret);

  if (!hashResult.ok) {
    return false;
  }

  const actual = Buffer.from(hashResult.data);
  const expected = Buffer.from(hash);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
