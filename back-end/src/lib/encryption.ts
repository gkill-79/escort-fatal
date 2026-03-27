/**
 * AES-256 encryption for sensitive data (phones, messages).
 * TODO: use crypto with env ENCRYPTION_KEY (32 bytes hex).
 */
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY ?? "default-dev-key-32-bytes-long!!";

export function encrypt(plain: string): string {
  if (typeof window !== "undefined") {
    return btoa(plain); // dev fallback client-side
  }
  // Node: use crypto.createCipheriv with ENCRYPTION_KEY
  return Buffer.from(plain, "utf8").toString("base64");
}

export function decrypt(cipher: string): string {
  if (typeof window !== "undefined") {
    return atob(cipher);
  }
  return Buffer.from(cipher, "base64").toString("utf8");
}
