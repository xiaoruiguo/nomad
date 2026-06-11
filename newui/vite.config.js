import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
export default defineConfig({
    plugins: [react(), tailwindcss()],
    base: "/ui/",
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    server: {
        proxy: {
            "/v1": {
                target: "http://127.0.0.1:4646",
                changeOrigin: true,
                ws: true,
            },
        },
    },
    build: {
        outDir: "dist",
        sourcemap: true,
        rollupOptions: {
            output: {
                manualChunks: {
                    react: ["react", "react-dom", "react-router-dom"],
                    query: ["@tanstack/react-query"],
                    ui: [
                        "@radix-ui/react-dialog",
                        "@radix-ui/react-dropdown-menu",
                        "@radix-ui/react-tooltip",
                        "@radix-ui/react-tabs",
                        "@radix-ui/react-popover",
                        "@radix-ui/react-select",
                        "@radix-ui/react-separator",
                        "@radix-ui/react-switch",
                        "@radix-ui/react-slot",
                    ],
                    codemirror: [
                        "@codemirror/view",
                        "@codemirror/state",
                        "@codemirror/lang-json",
                        "@codemirror/lang-javascript",
                        "@codemirror/theme-one-dark",
                    ],
                    d3: ["d3-scale", "d3-array", "d3-shape"],
                },
            },
        },
    },
});
