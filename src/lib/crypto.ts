import crypto from "crypto";

const KEY_LENGTH = 64;

export function hashSecret(secret: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const key = crypto.scryptSync(secret, salt, KEY_LENGTH).toString("hex");
  return `scrypt$${salt}$${key}`;
}

export function verifySecret(secret: string, storedHash: string) {
  const [algorithm, salt, key] = storedHash.split("$");

  if (algorithm !== "scrypt" || !salt || !key) {
    return false;
  }

  const candidate = crypto.scryptSync(secret, salt, KEY_LENGTH);
  const stored = Buffer.from(key, "hex");

  return stored.length === candidate.length && crypto.timingSafeEqual(stored, candidate);
}
