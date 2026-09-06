import { defineConfig } from "vite";

// Minimal on purpose -- add plugins (PWA, SSR, etc.) as this project's actual needs arrive,
// don't pre-build them speculatively.
export default defineConfig({
    plugins: [],
});
