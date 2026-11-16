import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  // 現在のモード（dev/build）に対応する環境変数を読み込む。
  const env = loadEnv(mode, '.', '');
  
  // 開発サーバーと preview の両方で /api を API サーバーへ転送する。
  const apiProxy = {
    '/api': {
      target: `http://localhost:${env.TRIVIA_API_PORT || 8787}`,
      changeOrigin: true,
    },
  };

  return {
    // React 変換と Tailwind 処理を有効化。
    plugins: [react(), tailwindcss()],
    define: {
      // GEMINI_API_KEY はサーバー側だけで読む。クライアントのビルドには埋め込まない。
      'import.meta.env.VITE_DEBUG_MODE': JSON.stringify(env.VITE_DEBUG_MODE || 'false'),
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
      proxy: apiProxy,
    },
    preview: {
      proxy: apiProxy,
    },
    build: {
      rollupOptions: {
        output: {
          // ライブラリを用途ごとに別ファイルにする。アプリのコードだけ変えたときは、
          // ライブラリ部分はブラウザのキャッシュがそのまま使われる。
          manualChunks(id) {
            if (!id.includes('node_modules')) return undefined;
            // グラフ（recharts とその専用の依存）。成績レポート・お天気を開くまで読み込まない。
            // clsx などアプリ本体でも使うものは入れない（入れると最初に読み込まれてしまう）。
            if (/[\\/]node_modules[\\/](recharts|d3-[^\\/]+|victory-vendor|internmap|decimal\.js-light|es-toolkit|immer|reselect|redux|@reduxjs|react-redux|eventemitter3|tiny-invariant)[\\/]/.test(id)) return 'charts';
            // アプリ本体でも使う小さなライブラリ。明示しないと、それを読み込む charts に取り込まれてしまう。
            if (/[\\/]node_modules[\\/](clsx|tailwind-merge|lucide-react)[\\/]/.test(id)) return 'ui';
            if (/[\\/]node_modules[\\/](motion|framer-motion|motion-dom|motion-utils)[\\/]/.test(id)) return 'motion';
            if (/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) return 'react';
            // それ以外は Vite に任せる。ただし charts から読み込まれるものは charts に取り込まれるので、
            // アプリ本体でも使うライブラリを足したときは、上の 'ui' に加えること。
            return undefined;
          },
        },
      },
    },
  };
});
