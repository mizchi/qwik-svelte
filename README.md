# @mizchi/qwik-svelte

Qwikify svelte components on qwik.

```bash
$ npm install @mizchi/qwik-svelte @sveltejs/vite-plugin-svelte svelte svelte-preprocess -D
```

**CAUTION** - This is PoC phase. You should check it works on your app.

## How to use

### vite.config.ts

Setup ssr for svelte with `@sveltejs/vite-plugin-svelte`.

```ts
import { defineConfig } from "vite";
import { qwikVite } from "@builder.io/qwik/optimizer";
import sveltePreprocess from "svelte-preprocess";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig((options) => {
  return {
    plugins: [
      // with ssr config
      svelte({
        preprocess: sveltePreprocess(),
        compilerOptions: {
          generate: options.mode === "ssr" ? "ssr" : "dom",
          hydratable: true,
        },
      }),
      qwikVite()
    ],
  };
});
```

(To use `@sveltejs/vite-plugin-svelte`, you may need `"type": "module"` in `package.json`)

### Use svelte components

```svelte
<!-- src/components/App.svelte -->
<script lang="ts">
  export let name: string;
  let count = 0;
</script>

<div class="app">
  <h1>Hello {name}!</h1>
  <button on:click={() => count++}>{count}</button>
</div>

<style>
  h1 {
    color: blue;
  }
</style>
```

Render with `qwikifySvelte$`

```tsx
import App from "./components/App.svelte";
import { qwikifySvelte$ } from "@mizchi/qwik-svelte";

const QApp = qwikifySvelte$<{name: string}>(App, {
  eagerness: 'load',
});

export default () => {
  return <QApp name="svelte"/>;
};
```

---

# How to contribute

## develop

```bash
# clone
$ pnpm install
$ pnpm dev # check for src/root.tsx
$ pnpm build # emit lib files
```

## TODO

- [ ] unit testing
- [ ] `<Slot>`
- [ ] Check re-render with props change
- [ ] Props types for svelte component

## My motivation

Looking at [qwik-react](https://github.com/BuilderIO/qwik/tree/main/packages/qwik-react), I felt that qwik could be treated as a meta-framework that could replace astro. qwik itself would be kept to the core for describing the critical path, calling the runtime when hydration occurs.

Therefore, I first tried targeting svelte, which is not JSX.

## LICENSE

MIT
