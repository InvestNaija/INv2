export async function encryptPassword(
  password: string,
  cleanPublicKeyB64: string,
): Promise<string> {
  const binaryKey = atob(cleanPublicKeyB64);
  const buf = new Uint8Array(binaryKey.length);
  for (let i = 0; i < binaryKey.length; i++) buf[i] = binaryKey.charCodeAt(i);

  const publicKey = await window.crypto.subtle.importKey(
    "spki",
    buf.buffer,
    { name: "RSA-OAEP", hash: "SHA-256" },
    true,
    ["encrypt"],
  );

  const encodedPassword = new TextEncoder().encode(password);
  const encryptedBuffer = await window.crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    publicKey,
    encodedPassword,
  );

  return btoa(String.fromCharCode(...new Uint8Array(encryptedBuffer)));
}