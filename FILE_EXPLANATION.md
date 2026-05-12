# Biz-Knowledge Sticky ファイル解説

このドキュメントは、プロジェクト内の各ファイルが何をしているかをまとめたものです。

## ルートファイル

### .env.example
- `GEMINI_API_KEY`:
  Gemini API を使うためのキー例。
- `APP_URL`:
  アプリ公開 URL の例。AI Studio 側で自動注入される想定。

### .gitignore
- `node_modules/`, `dist/`, `build/`, `coverage/`:
  生成物や依存を Git 管理対象から除外。
- `.env*` と `!.env.example`:
  機密を含む環境変数ファイルは除外し、テンプレートだけ追跡。

### index.html
- `<div id="root"></div>`:
  React アプリのマウント先。
- `<script type="module" src="/src/main.tsx"></script>`:
  エントリーポイントを読み込み。

### metadata.json
- `name`, `description`:
  アプリのメタ情報。
- `requestFramePermissions: ["geolocation"]`:
  位置情報権限が必要であることを宣言。

### package.json
- `scripts.dev`:
  Vite 開発サーバーを `3000` 番ポートで起動。
- `scripts.build` / `preview`:
  本番ビルド作成と確認。
- `scripts.lint`:
  TypeScript の型チェック (`tsc --noEmit`)。
- `dependencies`:
  React、Gemini SDK、Recharts、Tailwind など実行時依存。

### package-lock.json
- npm が自動生成する依存解決ファイル。
- バージョン再現性のために保持される。手編集は通常不要。

### tsconfig.json
- `target: "ES2022"`:
  出力対象の JS 機能レベル。
- `module: "ESNext"`, `moduleResolution: "bundler"`:
  Vite 前提のモジュール解決設定。
- `jsx: "react-jsx"`:
  React 19 向け JSX 変換設定。
- `noEmit: true`:
  TypeScript は型検査のみ行い、出力はしない。

### vite.config.ts
- `plugins: [react(), tailwindcss()]`:
  React と Tailwind の Vite プラグインを有効化。
- `loadEnv(mode, '.', '')`:
  `.env` 系の値を読み込み。
- `define['process.env.GEMINI_API_KEY']`:
  フロント側コードが参照する API キーをビルド時埋め込み。
- `resolve.alias['@']`:
  `@` をプロジェクトルートの別名に設定。
- `server.hmr`:
  `DISABLE_HMR` でホットリロードを切替。

### README.md
- アプリ概要、機能、セットアップ、データ保存仕様のユーザー向け説明。

## src 配下

### src/main.tsx
- `createRoot(...).render(...)`:
  React アプリを `#root` に描画。
- `<StrictMode>`:
  開発時に潜在バグを検出しやすくする。

### src/App.tsx
- アプリ全体のレイアウトとタブ遷移を管理するメインコンポーネント。
- `useUserStats()`:
  学習統計やスコア更新関数を取得。
- `useCurrentTime()`:
  ヘッダー表示用の現在時刻を 1 秒ごとに更新。
- `menuItems`:
  左メニューの定義 (ダッシュボード、ドリル、雑学、天気、ニュース)。
- `showStreakAnim` と `useEffect`:
  連続ログイン日数が更新されたときに演出表示。
- `ContentWindow` の中身を `activeTab` で切替:
  - `dashboard`: `Dashboard`
  - `learning`: `QuizModule`
  - `trivia`: `TriviaModule`
  - `local`: `LocalModule`
  - `news`: `NewsModule`

### src/index.css
- Google Fonts を読み込み。
- `@theme`:
  `--font-sans`, `--font-mono`, `--font-serif` を定義。
- `.olive-button`:
  雑学モジュールなどで使う共通ボタンスタイル。

### src/types.ts
- 型定義:
  - `Question`: クイズ 1 問の構造。
  - `Trivia`: 雑学カードの構造。
  - `TriviaLog`: 雑学のアウトプット記録。
  - `UserStats`: 学習統計の全体構造。
  - `UserAccount`: ユーザー情報 (現在未使用)。
- 定数:
  - `CATEGORY_LABELS`: カテゴリ表示名の辞書。
  - `INITIAL_STATS`: 初期状態。
  - `QUESTIONS`: クイズ問題データ本体。

## src/components

### src/components/MenuSticky.tsx
- 左メニューの 1 項目を表示するコンポーネント。
- props:
  `title`, `icon`, `isActive`, `onClick`, `color`。
- `colors`:
  カラーテーマごとの背景色・文字色を定義。
- `motion.button`:
  hover/tap 時のアニメーション。
- `isActive` のとき:
  枠強調と右サイドバー表示。

### src/components/ContentWindow.tsx
- 右側コンテンツ領域の共通ラッパー。
- props:
  `title`, `icon`, `children`, `color`。
- `colors`:
  タブ色ごとの背景・枠色。
- `motion.div`:
  タブ切替時のフェード + スライド演出。

### src/components/Dashboard.tsx
- 成績・可視化画面。
- `radarData`:
  `stats.categoryScores` をレーダーチャート用に整形。
- カレンダー生成:
  当月日数と開始曜日から日付グリッドを作成し、`learningLog` と突合。
- `showCalendar`:
  プロファイル表示とカレンダー表示をトグル。
- グラフ:
  - `LineChart`: 学習進捗
  - `RadarChart`: カテゴリスキル

### src/components/QuizModule.tsx
- 一般常識クイズ画面。
- `selectedCategory`:
  カテゴリ未選択時はカテゴリ選択 UI を表示。
- カテゴリ選択時:
  `QUESTIONS` から抽出しシャッフル。
- `timeLeft`:
  1 秒ごとのカウントダウン。0 で時間切れ回答処理。
- `handleAnswer(idx)`:
  - 回答状態を確定
  - 解説文を表示
  - 正解なら `onComplete(10, category)` でスコア加算
- `nextQuestion()`:
  次問へ進むかカテゴリ選択へ戻る。

### src/components/TriviaModule.tsx
- 雑学カード表示とアウトプット記録。
- 初期表示:
  サーバーの `/api/trivia/assign` から当日のブラウザ割り当てトリビアを取得。
  同日同ブラウザは常に同じネタ、別ブラウザには異なるネタを配布。
- `hasTalked`:
  そのネタを既に記録済みかを判定。
- `handleLogSubmit()`:
  反応とメモを `TriviaLog` にして `onUpdateStats` へ渡す。
- 下部統計:
  博識レベル、アウトプット数、ウケた回数、最近ログを表示。

### src/components/LocalModule.tsx
- 現在地ベースのローカル情報表示。
- `useGeolocation()`:
  ブラウザ位置情報を取得。
- `refreshData()`:
  `getActualLocalInfo(lat, lon)` を呼び、住所・天気・地域ニュースを更新。
- `useEffect`:
  位置情報取得後に自動で初回ロード。
- UI:
  天気カード、地域ニュース、周辺スポット導線。

### src/components/NewsModule.tsx
- 最新ニュース一覧表示。
- `fetchNews(force = false)`:
  - 当日のキャッシュがあれば localStorage から復元
  - ない場合 `getActualNewsTopics()` を呼んで取得
  - 取得結果を localStorage へ保存
- `lastUpdated`:
  最終更新時刻を表示。
- UI:
  カテゴリごとの記事カード、読み込みスケルトン、失敗時メッセージ。

## src/hooks

### src/hooks/useCurrentTime.ts
- 現在時刻を保持するカスタムフック。
- `setInterval` で 1 秒ごとに更新。
- アンマウント時に `clearInterval` してリーク防止。

### src/hooks/useGeolocation.ts
- Geolocation API の結果を `location` と `error` で返す。
- `navigator.geolocation.getCurrentPosition` を 1 回実行。
- 未対応ブラウザ時はエラー文言を設定。

### src/hooks/useUserStats.ts
- 学習統計の状態管理フック。
- 初期化:
  `biz_knowledge_stats` を localStorage から復元。失敗時は `INITIAL_STATS`。
- 永続化:
  `stats` 更新時に localStorage へ保存。
- 連続ログイン判定:
  `lastLoginDate` と今日の日付差で `loginStreak` を更新。
- `updateScore(points, category, isTrivia, triviaLogEntry)`:
  - 総スコア加算
  - カテゴリ別スコア更新（最大100）
  - スコアに応じてランク更新
  - 雑学時は知識レベルとログを更新
  - 当日 `learningLog` を追記/更新
  - 履歴は直近 30 日に制限

## src/lib

### src/lib/utils.ts
- `cn(...inputs)`:
  `clsx` でクラス名を条件結合し、`tailwind-merge` で競合クラスを解決するユーティリティ。

## src/services

### src/services/geminiService.ts
- Gemini API を呼ぶサービス群。
- `getGenAI()`:
  `GEMINI_API_KEY` を検証し、`GoogleGenAI` インスタンスを遅延生成・再利用。
- `getAIExplanation(...)`:
  クイズ回答の正誤に応じた短い日本語解説を生成。
- `getActualLocalInfo(lat, lon)`:
  現在地周辺の住所・天気・地域ニュースを JSON で取得。
- `getActualNewsTopics()`:
  IT/経済/政治社会カテゴリのニュースを JSON で取得。
- `getDailyTrivia(dayOfWeek)`:
  曜日カテゴリに応じた雑学ネタを JSON で生成（現状 UI では固定データ中心）。

## 補足
- 各 UI コンポーネントは `motion/react` を使って遷移・ホバー演出を付与。
- このプロジェクトは「関数・ブロック単位」で理解する構成になっており、行ごとの追跡が必要な場合はこのファイルを起点に対象ファイルを確認すると把握しやすいです。
