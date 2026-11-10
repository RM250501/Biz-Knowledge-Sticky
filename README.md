# Biz-Knowledge Sticky

Biz-Knowledge Sticky は、ビジネス一般常識を日々の習慣として学べる Web アプリです。学習レポート、4 択クイズ、日替わり雑学、天気、最新ニュースを 1 画面で扱えます。

## 主な機能

- 成績レポート: XP、ランク、カテゴリ別スコア、学習カレンダーを表示
- 一般常識ドリル: 6 カテゴリ × 20 問（計 120 問）の 4 択クイズ、時間制 / 出題数制に対応
- 雑学ネタ帳: 1 ブラウザ 1 日 1 件の雑学を配布し、反応とメモを保存
- お天気情報: 現在地または地域指定で、現在天気と予報を表示
- 最新トピックス: Gemini API と Google Search で最新ニュースを収集

## 画面構成

- 左側の付箋風メニューで機能を切り替える
- 右側に選択中モジュールを表示する
- 上部ヘッダーに現在時刻、連続ログイン日数、現在ランクを表示する
- ライト / ダークテーマを切り替えられる

## データ保存

学習データはブラウザの localStorage に保存されます。

- `biz_knowledge_stats`
- `biz_daily_news`
- `biz_daily_news_date`
- `biz_daily_news_time`
- `biz_weather_settings_v1`
- `biz_knowledge_browser_id_v1`
- `biz_knowledge_daily_trivia_v2_<browserId>`
- `last_seen_streak`

## 技術スタック

- React 19 + TypeScript + Vite
- Tailwind CSS 4, lucide-react, motion, recharts
- Gemini API / Google Search
- Express + Node.js

## セットアップ

前提: Node.js (LTS 推奨)

1. 依存関係をインストールする

   npm install

2. ルートに `.env.local` を作成し、API キーを設定する

   GEMINI_API_KEY=your_api_key_here

3. 開発サーバーを起動する

   npm run dev

4. 別ターミナルで API サーバーを起動する（雑学・ニュース・クイズレポート）

   npm run dev:api

5. ブラウザでアクセスする

   http://localhost:3000

## 利用可能なスクリプト

- `npm run dev`: 開発サーバー起動
- `npm run dev:api`: API サーバー起動
- `npm run start`: API サーバー起動
- `npm run serve:prod`: 本番ビルド後に API サーバーを起動
- `npm run build`: 本番ビルド作成
- `npm run preview`: ビルド結果をローカル確認
- `npm run lint`: TypeScript 型チェック
- `npm run check:questions`: クイズ問題データの形式チェック
- `npm run check:streak`: 連続ログイン日数の計算チェック
- `npm run clean`: `dist` を削除

## 環境変数

- `GEMINI_API_KEY`: Gemini API を利用する機能で必要。API サーバーだけが読み、ブラウザ向けのビルドには含めない
- 未設定でも、クイズ（レポートはローカル集計）や天気など一部の機能は使える
- `.env.local` は Git に含めない。キーを `.env.example` などのコミット対象ファイルに書かない

## ディレクトリ構成

- `src/`: フロントエンド（React）
  - `components/quiz/`, `components/weather/`: 各モジュールの部品
  - `data/questions/`: クイズ問題データ（カテゴリ別）
  - `services/apiClient.ts`: API サーバーの呼び出し
- `server/`: API サーバー（Express）。Gemini API の呼び出しはすべてここで行う
- `shared/`: クライアントとサーバーで共有する型・関数
- `scripts/`: 開発用スクリプト

## 参考

- ファイルごとの役割は [FILE_EXPLANATION.md](FILE_EXPLANATION.md)

## 補足

- 本アプリは学習支援を目的としたデモ実装です
- ニュースや地域情報は外部 API 応答に依存します
