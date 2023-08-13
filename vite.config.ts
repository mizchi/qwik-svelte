import { defineConfig } from "vite";
import { qwikVite } from "@builder.io/qwik/optimizer";
import { qwikSvelte } from "./src/vite";
import sveltePreprocess from "svelte-preprocess";

export default defineConfig(() => {
  return {
    build: {
      target: "es2020",
      lib: {
        entry: ['./src/index.ts', './src/vite.ts'],
        formats: ['es', 'cjs'],
        fileName: (format, entryName) => `${entryName}.${format === 'es' ? 'mjs' : 'cjs'}`,
      },
      rollupOptions: {
        external: [
          '@builder.io/qwik',
          '@builder.io/qwik/build',
          'svelte',
          'svelte/compiler',
          'svelte/internal',
          'node:path',
          'path',
        ],
      }
    },
    plugins: [qwikSvelte({
      preprocess: sveltePreprocess(),
      css: "injected"
    }), qwikVite()],
  };
});
