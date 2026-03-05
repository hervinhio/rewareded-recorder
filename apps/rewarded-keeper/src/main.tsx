import { createRoot } from 'react-dom/client';
import App from './app/app';

const node = document.getElementById('root');
const root = createRoot(node as HTMLElement);

root.render(<App />);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
navigator.serviceWorker?.register('worker.js');
