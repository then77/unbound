import { defineConfig, type UserConfig } from "tsdown";

const baseConfig: UserConfig = {
    format: ["esm", "cjs"],
    platform: "neutral",
    dts: true,
    treeshake: true,
    unbundle: true,
    clean: true,
    minify: false,
    outDir: "dist",
};

export default defineConfig([
    // unbound-auth
    {
        ...baseConfig,
        entry: {
            index: "src/index.ts",
        },
    },

    // unbound-auth/adapters
    {
        ...baseConfig,
        entry: {
            "adapters/index": "src/adapters/index.ts",
        },
    },

    // CDN build
    {
        ...baseConfig,
        entry: {
            "unbound.min": "src/index.ts",
        },
        format: ["iife"],
        globalName: "Unbound",
        platform: "browser",
        dts: false,
        unbundle: false,
        minify: true,
    },
]);
