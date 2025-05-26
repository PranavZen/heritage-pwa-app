import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { store } from './store';
import { Provider } from 'react-redux';
import 'swiper/css';
import './scss/_index.scss';
import * as serviceWorkerRegistration from '../src/serviceWorkerRegistration';
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
);

serviceWorkerRegistration.register();
