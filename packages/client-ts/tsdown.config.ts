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
    // unbound-auth and adapters
    {
        ...baseConfig,
        entry: {
            index: "src/index.ts",
            "adapters/index": "src/adapters/index.ts",
        },
    },

    // CDN build
    {
        ...baseConfig,
        entry: {
            "unbound.min": "src/browser.ts",
        },
        format: ["iife"],
        globalName: "Unbound",
        platform: "browser",
        dts: false,
        unbundle: false,
        minify: true,
        outputOptions: {
            entryFileNames: "[name].js",
        },
        // Always bundle jose in cdn build for auth
        deps: {
            alwaysBundle: ["jose"],
        },
    },
]);
