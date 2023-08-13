// import { Counter } from "./components/counter/counter";
// import { Logo } from "./components/logo/logo";

import App from "./components/App.svelte";
import {qwikifySvelte$} from "./qwikify";

const QApp = qwikifySvelte$<{name: string}>(App, {
  eagerness: 'load',
});

export default () => {
  return (
    <>
      <head>
        <meta charSet="utf-8" />
        <title>Qwik Blank App</title>
      </head>
      <body>
        <QApp name="svelte"/>
      </body>
    </>
  );
};
