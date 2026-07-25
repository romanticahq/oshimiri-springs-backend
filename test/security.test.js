import { describe, expect, it } from "vitest";
import { createOpaqueToken, hashPassword, hashToken, verifyPassword } from "../src/utils/security.js";
import { createPublicReference } from "../src/utils/reference.js";

describe("security utilities", () => {
  it("hashes and verifies passwords without storing plaintext", async () => {
    const hash = await hashPassword("a-strong-test-password");
    expect(hash).not.toContain("a-strong-test-password");
    expect(await verifyPassword("a-strong-test-password", hash)).toBe(true);
    expect(await verifyPassword("wrong-password", hash)).toBe(false);
  });

  it("creates opaque tokens and stable token hashes", () => {
    const token = createOpaqueToken();
    expect(token.length).toBeGreaterThan(32);
    expect(hashToken(token)).toHaveLength(64);
    expect(hashToken(token)).toBe(hashToken(token));
  });

  it("creates non-identifying public references", () => {
    expect(createPublicReference("PRD")).toMatch(/^OSH-PRD-[A-F0-9]{8}$/);
  });
});
