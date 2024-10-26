import { createRoot } from 'react-dom/client';
import App from './app/app';
import { FluentProvider } from '@fluentui/react-components';
import { darkTheme, lightTheme } from './app/theme';

const theme = window.matchMedia('(prefers-color-scheme: dark)')?.matches
  ? 'dark'
  : 'light';

const node = document.getElementById('root');
const root = createRoot(node as HTMLElement);

root.render(
  <FluentProvider theme={theme === 'light' ? lightTheme : darkTheme}>
    <App />
  </FluentProvider>,
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
navigator.serviceWorker?.register('worker.js');
