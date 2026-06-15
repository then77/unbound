import ky from "ky";

export async function getFaviconBase64(domain: string): Promise<string | null> {
    try {
        const blob = await ky
            .get("https://www.google.com/s2/favicons", {
                searchParams: {
                    domain,
                    sz: "64",
                },
            })
            .blob();

        const buffer = await blob.arrayBuffer();
        return `data:${blob.type || "image/png"};base64,${arrayBufferToBase64(buffer)}`;
    } catch {
        return null;
    }
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = "";

    const bytes = new Uint8Array(buffer);

    for (const byte of bytes) {
        binary += String.fromCharCode(byte);
    }

    return btoa(binary);
}
