import { randomBytes } from "node:crypto";

export function createPublicReference(prefix) {
  return `OSH-${prefix}-${randomBytes(4).toString("hex").toUpperCase()}`;
}
