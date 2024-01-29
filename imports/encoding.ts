export { encodeBase64 } from "https://deno.land/std@0.213.0/encoding/base64.ts";
export { encodeHex } from "https://deno.land/std@0.213.0/encoding/hex.ts";

export const encode = (text: string) => new TextEncoder().encode(text);
