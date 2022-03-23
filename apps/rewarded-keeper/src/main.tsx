import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom';
import App from './app/app';

declare global {
  interface Window { cordova: any; }
}
window.cordova = window.cordova || false;

const startApp = () => {
  ReactDOM.render(
    <StrictMode>
      <App />
    </StrictMode>,
    document.getElementById('root')
  );
}

if(!window.cordova) {
  startApp()
} else {
  document.addEventListener('deviceready', startApp, false)
}