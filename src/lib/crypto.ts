import crypto from "crypto";

const KEY_LENGTH = 64;

function normalizeSecret(secret: string) {
  return secret.replace(/\s+/g, "").toLocaleLowerCase("it-IT");
}

export function hashSecret(secret: string) {
  const normalizedSecret = normalizeSecret(secret);
  const salt = crypto.randomBytes(16).toString("hex");
  const key = crypto.scryptSync(normalizedSecret, salt, KEY_LENGTH).toString("hex");
  return `scrypt$${salt}$${key}`;
}

export function verifySecret(secret: string, storedHash: string) {
  const [algorithm, salt, key] = storedHash.split("$");

  if (algorithm !== "scrypt" || !salt || !key) {
    return false;
  }

  const candidate = crypto.scryptSync(normalizeSecret(secret), salt, KEY_LENGTH);
  const stored = Buffer.from(key, "hex");

  return stored.length === candidate.length && crypto.timingSafeEqual(stored, candidate);
}
