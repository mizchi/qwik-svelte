import { defineConfig } from "vite";
import { qwikVite } from "@builder.io/qwik/optimizer";
import sveltePreprocess from "svelte-preprocess";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig((options) => {
  return {
    build: {
      target: "es2020",
      lib: {
        entry: ['./src/index.qwik.ts'],
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
        ],
      }
    },
    plugins: [
      svelte({
        preprocess: sveltePreprocess(),
        compilerOptions: {
          // @ts-ignore
          generate: options.mode === "ssr" ? "ssr" as const : "dom" as const,
          hydratable: true,
        },
      }),
      qwikVite()
    ],
  };
});
