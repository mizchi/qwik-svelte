// based qwikify-react on https://github.com/BuilderIO/qwik/blob/main/packages/qwik-react/src/react/qwikify.tsx
import {
  RenderOnce,
  SSRRaw,
  component$,
  implicit$FirstArg,
  noSerialize,
  useSignal,
  useTask$,
  type NoSerialize,
  type QRL,
  $,
  useOn,
  useOnDocument,
  SkipRender,
} from '@builder.io/qwik';

import { isBrowser, isServer } from '@builder.io/qwik/build';
import type { ComponentType, SvelteComponent } from 'svelte';
// TODO: declare self
import type { QwikifyProps } from "./types";

interface QwikifyOptions {
  tagName?: string;
  eagerness?: 'load' | 'visible' | 'idle' | 'hover';
  event?: string | string[];
  clientOnly?: boolean;
}

type IsoSvelteCmp = (ComponentType<any>) | {
  render: (props: any) => {
    html: string;
    css: {
      code: string;
      map: string;
    },
    head: string
  }
}

const useWakeupSignal = (props: QwikifyProps<{}>, opts: QwikifyOptions = {}) => {
  const signal = useSignal(false);
  const activate = $(() => (signal.value = true));
  const clientOnly = !!(props['client:only'] || opts?.clientOnly);
  if (isServer) {
    if (props['client:visible'] || opts?.eagerness === 'visible') {
      useOn('qvisible', activate);
    }
    if (props['client:idle'] || opts?.eagerness === 'idle') {
      useOnDocument('qidle', activate);
    }
    if (props['client:load'] || clientOnly || opts?.eagerness === 'load') {
      useOnDocument('qinit', activate);
    }
    if (props['client:hover'] || opts?.eagerness === 'hover') {
      useOn('mouseover', activate);
    }
    if (props['client:event']) {
      useOn(props['client:event'], activate);
    }
    if (opts?.event) {
      useOn(opts?.event, activate);
    }
  }
  return [signal, clientOnly, activate] as const;
};

// TODO: Slot not supported yet
export function qwikifySvelteQrl<PROPS extends {}>(
  isoCmp$: QRL<IsoSvelteCmp>,
  opts?: QwikifyOptions
) {
  return component$((props: QwikifyProps<PROPS>) => {
    const hostRef = useSignal<Element>();
    const appState = useSignal<NoSerialize<SvelteComponent>>();
    const [signal, isClientOnly] = useWakeupSignal(props, opts);
    const TagName = opts?.tagName ?? ('qwik-svelte' as any);
    useTask$(async ({ track }) => {
      const trackedProps = track(() => ({ ...props }));
      track(signal);
      if (!isBrowser) return;
      if (appState.value) {
        appState.value.$set(trackedProps);
        return;
      }
      if (hostRef.value) {
        const Client: any = await isoCmp$.resolve();
        appState.value = noSerialize(
          new Client({
            target: hostRef.value,
            hydrate: true,
            props: trackedProps,
          })
        );
      }
    });
    if (isServer && !isClientOnly) {
      const renderer = isoCmp$.resolve();
      return <RenderOnce>
        <TagName ref={hostRef}>
          {renderer.then((renderer: any) => {
            const markup = renderer.render({...props});
            const result = `<style>${markup.css?.code}</style>${markup.html}`;
            return <SSRRaw data={result}/>;  
          })}
        </TagName>
      </RenderOnce>;
    }
    return (
      <RenderOnce>
        <TagName
          {...props}
          ref={(el: Element) => {
            hostRef.value = el;
          }}
        >
          {SkipRender}
        </TagName>
      </RenderOnce>
    );
  });
}

export const qwikifySvelte$ = /*#__PURE__*/ implicit$FirstArg(qwikifySvelteQrl);