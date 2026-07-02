# Biz-Knowledge Sticky

Biz-Knowledge Sticky は、ビジネス一般常識を日々の習慣として学べる Web アプリです。学習レポート、4 択クイズ、日替わり雑学、天気、最新ニュースを 1 画面で扱えます。

## 主な機能

- 成績レポート: XP、ランク、カテゴリ別スコア、学習カレンダーを表示
- 一般常識ドリル: 6 カテゴリの 4 択クイズ、時間制 / 出題数制に対応
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

4. 別ターミナルで雑学配布 API サーバーを起動する

   npm run dev:api

5. ブラウザでアクセスする

   http://localhost:3000

## 利用可能なスクリプト

- `npm run dev`: 開発サーバー起動
- `npm run dev:api`: 雑学配布 API サーバー起動
- `npm run start`: API サーバー起動
- `npm run serve:prod`: 本番ビルド後に API サーバーを起動
- `npm run build`: 本番ビルド作成
- `npm run preview`: ビルド結果をローカル確認
- `npm run lint`: TypeScript 型チェック
- `npm run clean`: `dist` を削除

## 環境変数

- `GEMINI_API_KEY`: Gemini API を利用する機能で必要
- 未設定でも、ローカル保存ベースの機能や一部 UI は確認できる

## 参考

- ファイルごとの役割は [FILE_EXPLANATION.md](FILE_EXPLANATION.md)

## 補足

- 本アプリは学習支援を目的としたデモ実装です
- ニュースや地域情報は外部 API 応答に依存します
