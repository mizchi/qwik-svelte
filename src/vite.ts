import path from "path";
import { compile, preprocess } from "svelte/compiler";

// TODO: hot reload
export function qwikSvelte(opts: {
  preprocess?: any,
  css?: 'injected' | 'external' | 'none' | boolean;
}) {
  return {
    name: "qwik-svelte",
    resolveId(id: string, importer: string | undefined) {
      if (id.endsWith(".svelte") && importer) {
        return path.join(path.dirname(importer), id);
      }
    },
    async transform(code: string, id: string, options?: {ssr: boolean}) {
      if (id.endsWith(".svelte")) {
        const { code: preprocessed } = await preprocess(code, opts.preprocess ?? [], {
          filename: id,
        });
        if (options?.ssr) {
          const server = compile(preprocessed, {
            filename: id,
            css: opts.css,
            generate: "ssr"
          });
          return {
            code: server.js.code,
            map: server.js.map,
          }  
        } else {
          const client = compile(preprocessed, {
            filename: id,
            generate: "dom",
            css: opts.css,
            hydratable: true,
          });
          return {
            code: client.js.code,
            map: client.js.map,
          }  
        }
      }
    },
  };
}

