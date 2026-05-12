import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  // 現在のモード（dev/build）に対応する環境変数を読み込む。
  const env = loadEnv(mode, '.', '');
  return {
    // React 変換と Tailwind 処理を有効化。
    plugins: [react(), tailwindcss()],
    define: {
      // ビルド時置換で Gemini API キーをクライアントコードから参照可能にする。
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        // プロジェクトルート基準の "@/..." インポートを有効化。
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // AI Studio では DISABLE_HMR 環境変数で HMR を無効化できる。
      // エージェント編集時のちらつき防止のため、通常は変更しない。
      // AI Studio 互換性を保ちつつ、ローカルでは切替可能にする。
      hmr: process.env.DISABLE_HMR !== 'true',
      proxy: {
        '/api': {
          target: `http://localhost:${env.TRIVIA_API_PORT || 8787}`,
          changeOrigin: true,
        },
      },
    },
  };
});
