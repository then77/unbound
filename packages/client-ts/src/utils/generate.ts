type HashEncoding = "base64" | "base64url" | "hex";

function encodeHash(bytes: Uint8Array, encoding: HashEncoding) {
    if (encoding === "hex") {
        return Array.from(bytes, (byte) =>
            byte.toString(16).padStart(2, "0"),
        ).join("");
    }

    let binary = "";
    for (const byte of bytes) {
        binary += String.fromCharCode(byte);
    }

    const base64 = btoa(binary);
    if (encoding === "base64") return base64;

    return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export function generateRandomString(length = 32) {
    const CHARS =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";

    while (result.length < length) {
        const bytes = crypto.getRandomValues(new Uint8Array(length));

        for (const byte of bytes) {
            // 62 chars
            if (byte < 248) {
                result += CHARS[byte % 62];

                if (result.length === length) {
                    return result;
                }
            }
        }
    }

    return result;
}

export async function generateHash(
    text: string,
    encoding: HashEncoding = "hex",
): Promise<string> {
    const data = new TextEncoder().encode(text);
    const hash = await crypto.subtle.digest("SHA-256", data);

    return encodeHash(new Uint8Array(hash), encoding);
}

export async function generatePKCE() {
    const verifier = generateRandomString(64);
    const challenge = await generateHash(verifier, "base64url");

    return { verifier, challenge };
}
