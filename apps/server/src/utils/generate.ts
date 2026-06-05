import { exportJWK, generateKeyPair } from "jose";

const DEFAULT_KEY_ALGORITHM = "ES256";
const DEFAULT_KEY_KID = "unbound-es256-1";

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

export async function generateJWKPair() {
    const { privateKey, publicKey } = await generateKeyPair(
        DEFAULT_KEY_ALGORITHM,
        {
            extractable: true,
        },
    );

    const privateJwk = await exportJWK(privateKey);
    const publicJwk = await exportJWK(publicKey);

    return {
        private: {
            kty: privateJwk.kty,
            crv: privateJwk.crv,
            d: privateJwk.d,
            x: privateJwk.x,
            y: privateJwk.y,
            kid: DEFAULT_KEY_KID,
            alg: DEFAULT_KEY_ALGORITHM,
            use: "sig",
        },
        public: {
            kty: publicJwk.kty,
            crv: publicJwk.crv,
            x: publicJwk.x,
            y: publicJwk.y,
            kid: DEFAULT_KEY_KID,
            alg: DEFAULT_KEY_ALGORITHM,
            use: "sig",
        },
    };
}