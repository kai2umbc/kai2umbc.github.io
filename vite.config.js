import path from "path";
import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
    ],
    base: "/",  // Ensure it's "/" for GitHub Pages root repo
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),  // Alias for src
        },
    },
    build: {
        rollupOptions: {
            input: "/index.html",  // Ensure using the correct entry point
        },
    },
});
