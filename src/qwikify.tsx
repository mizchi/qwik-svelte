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
import type { ComponentType } from 'svelte';
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
    // const { scopeId } = useStylesScoped$(
    //   `q-slot{display:none} q-slotc,q-slotc>q-slot{display:contents}`
    // );
    const hostRef = useSignal<Element>();
    const internalState = useSignal<NoSerialize<any>>();
    const appState = useSignal<NoSerialize<{instance?: any, html?: string}>>();
    const [signal, isClientOnly] = useWakeupSignal(props, opts);
    // const hydrationKeys = {};
    const TagName = opts?.tagName ?? ('qwik-svelte' as any);
    useTask$(async ({ track }) => {
      const trackedProps = track(() => ({ ...props }));
      track(signal);
      if (!isBrowser) return;
      const ClientCmp: any = await isoCmp$.resolve();
      if (internalState.value) {
        if (internalState.value.root) {
          appState.value?.instance.$set(trackedProps);
        }
      } else {
        const hostElement = hostRef.value;
        if (hostElement) {
          const app = new ClientCmp({
            target: hostElement,
            hydrate: true,
            props: trackedProps,
          });
          appState.value = noSerialize({
            instance: app,
          });
        }
      }
    });
    if (isServer && !isClientOnly) {
      const renderer = isoCmp$.resolve();
      return <RenderOnce key={2}>
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