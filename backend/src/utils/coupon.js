import crypto from "node:crypto";

export function createCouponCode() {
  return `SME-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
}
