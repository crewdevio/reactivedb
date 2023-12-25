import { Crypto } from "./mod.ts";

const crypto = new Crypto({ name: "HMAC", hash: "SHA-512" }, true, [
  "sign",
  "verify",
]);

await crypto.generateKey();

const { toBase64 } = await crypto.exportToJWKBase64();

console.log(toBase64());
