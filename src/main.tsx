import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// ルート DOM ノードに React アプリを初期描画する。
createRoot(document.getElementById('root')!).render(
  // StrictMode で開発時に潜在的な問題を検出しやすくする。
  <StrictMode>
    <App />
  </StrictMode>,
);
