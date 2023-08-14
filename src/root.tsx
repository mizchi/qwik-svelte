import { component$, useSignal } from "@builder.io/qwik";
import App from "./components/App.svelte";
import {qwikifySvelte$} from "./svelte";

const QApp = qwikifySvelte$<{name: string, counter: number, onUpdate: (current: number) => void}>(App as any, {
  eagerness: 'load',
});

export default component$(() => {
  const counter = useSignal(1);
  return (
    <>
      <head>
        <meta charSet="utf-8" />
        <title>Qwik Blank App</title>
      </head>
      <body>
        <h2>Qwik</h2>
        <button onClick$={() => counter.value++}>{counter.value}</button>
        <hr />
        <QApp name="svelte" counter={counter.value} onUpdate$={(current) => {
          console.log('onUpdate', current);
        }} />
      </body>
    </>
  );
});
