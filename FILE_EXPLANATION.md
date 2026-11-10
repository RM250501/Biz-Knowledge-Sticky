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
- `scripts.dev:api` / `start`:
  API サーバー (`server/index.ts`) を起動。
- `scripts.check:questions`:
  問題データの形式チェック (`scripts/validateQuestions.ts`)。
- `scripts.check:streak`:
  連続ログイン日数の計算チェック (`scripts/checkStreak.ts`)。
- `dependencies`:
  React、Gemini SDK（サーバー側のみで使用）、Recharts、Tailwind など実行時依存。

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
- `define['import.meta.env.VITE_DEBUG_MODE']`:
  デバッグ用フラグ。`GEMINI_API_KEY` はクライアントに埋め込まない。
- `server.proxy['/api']`:
  開発時に `/api` へのリクエストを API サーバーへ転送。
- `resolve.alias['@']`:
  `@` をプロジェクトルートの別名に設定。
- `server.hmr`:
  `DISABLE_HMR` でホットリロードを切替。

### .github/workflows/ci.yml
- GitHub Actions の CI。PR と main への push で、型チェック・問題データチェック・日付計算チェック・ビルドを実行する。

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
  - `CATEGORY_LABELS`: カテゴリ表示名の辞書（`shared/categories.ts` から再エクスポート）。
  - `INITIAL_STATS`: 初期状態。
- クイズ問題データは `src/data/questions/` に移動。

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
- 一般常識クイズ画面の入口。状態は `useQuizSession` に任せ、画面を切り替えるだけ。
- `launchPreset`:
  ダッシュボードのショートカットから渡された設定で即開始する。

### src/components/quiz/
- `types.ts`: 出題方法・終了条件・`QuizLaunchPreset` などの型と選択肢の定数。
- `QuizSetup.tsx`: 学習設定画面（出題方法、終了条件、時間/問題数、カテゴリ）。カテゴリごとの問題数も表示。
- `QuizPlay.tsx`: 出題画面（タイマー/進捗、選択肢、解説、次へボタン）。
- `QuizSummary.tsx`: 結果画面（回答数・正解数、正誤表、コメント）。

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
- お天気情報画面の入口。データ取得は `useWeatherRegion` に任せ、各カードを並べる。

### src/components/weather/
- `WeatherSettingsPanel.tsx`: 現在地 / 地域指定の切り替えと地域名検索。
- `CurrentWeatherCards.tsx`: 現在の天気カードと降水量レベルカード。
- `ForecastCharts.tsx`: 3 時間ごとの降水量・気温グラフ（recharts）。
- `WeatherConditionIcon.tsx`: 天気の文言からアイコンを選ぶ。

### src/components/NewsModule.tsx
- 最新ニュース一覧表示。
- `fetchNews(force = false)`:
  - 当日のキャッシュがあれば localStorage から復元
  - ない場合 `fetchNewsTopics()` で API サーバー (`/api/news`) から取得
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

### src/hooks/useQuizSession.ts
- クイズ 1 セッション分の状態とロジック。
- `start(preset?)`:
  問題をシャッフルして出題リストを作る。各問題の選択肢の並びも毎回入れ替える。
- `answer(idx)`:
  回答を記録し、正解なら `onCorrect(10, category)` で XP を加算。
- 時間制ではタイマーが 0 になると結果画面へ進む。
- 結果画面に入ると `/api/quiz/report` でレポートを作る。通信に失敗したらローカル集計に切り替える。

### src/hooks/useWeatherRegion.ts
- 表示地域の設定（localStorage `biz_weather_settings_v1`）と天気データ取得。
- 位置情報が取れないときは東京駅の座標を使う。

### src/hooks/useUserStats.ts
- 学習統計の状態管理フック。
- 初期化:
  `biz_knowledge_stats` を localStorage から復元。失敗時は `INITIAL_STATS`。
- 永続化:
  `stats` 更新時に localStorage へ保存。
- 複数タブ:
  別のタブの更新を `storage` イベントで取り込み、更新時も別タブの最新データを土台にする（XP や記録の上書きを防ぐ）。
- 連続ログイン判定:
  ローカルの日付で `lastLoginDate` と今日を比べ、`loginStreak` を更新（計算は `src/lib/streak.ts`）。
  開いたまま日付をまたいでも、1 分ごとの確認とタブ復帰時の確認で更新される。
- `markQuestionAnswered(questionId)`:
  回答した問題 ID を `completedQuestions` に記録する。
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

### src/lib/streak.ts
- `nextLoginStreak(prev, todayKey)`: 連続ログイン日数を計算する。
- 旧バージョンの保存データ（`dateKeyVersion` なし、UTC の日付）は実際の日付と 1 日ずれることがあるため、差が 2 日までは連続として扱う。

### src/lib/shuffle.ts
- Fisher–Yates で配列を偏りなく並べ替える。

## src/data

### src/data/questions/
- カテゴリごとの問題データ（`english.ts`、`kanji.ts`、`manners.ts`、`governance.ts`、`weather.ts`、`economy.ts`）。各 20 問。
- `index.ts`: 全カテゴリを結合した `QUESTIONS` と、カテゴリ別の問題数 `QUESTION_COUNT_BY_CATEGORY`。
- 問題を追加したら `npm run check:questions` で形式を確認する。

## src/services

### src/services/apiClient.ts
- API サーバーを呼ぶクライアント。Gemini API はブラウザから直接呼ばない。
- `fetchNewsTopics(force)`: `/api/news` から最新ニュースを取得。
- `requestQuizReport(sessionLog)`: `/api/quiz/report` からクイズ結果レポートを取得。

### src/services/weatherService.ts
- Open-Meteo などの外部 API から天気・予報・地名を取得する。

## server

### server/index.ts
- Express の API サーバー。`/api/trivia`、`/api/news`、`/api/quiz/report` をまとめる。
- `dist/` があればビルド済みフロントエンドも配信する。

### server/index.ts の `TRUST_PROXY`
- リバースプロキシの後ろで動かすとき、利用者の IP を正しく取るための設定（回数制限に使う）。

### server/gemini.ts
- Gemini クライアントの生成と、使用モデルの決定（環境変数 `GEMINI_MODEL`、既定値 `gemini-3.6-flash`）。`GEMINI_API_KEY` はここでだけ読む。

### server/trivia/
- `routes.ts`: 日替わり雑学の割り当て（同日同ブラウザは同じネタ、別ブラウザには別のネタ）。
- `generator.ts`: 雑学の AI 生成、別の AI 呼び出しによる事実確認、フォールバックデータ。
- `db.ts`: sql.js（SQLite）での割り当て保存。`.data/trivia.db` に書き出す（初回起動時に自動作成。Git の管理対象外）。

### server/routes/
- `news.ts`: Google 検索連携で最新ニュースを取得。同じ日はメモリにキャッシュする。
- `quizReport.ts`: クイズ結果の総括とコメントを AI で作る。キー未設定・失敗時はローカル集計を返す。

## shared

- `categories.ts`: カテゴリ表示名の辞書（クライアント・サーバー共通）。
- `quizReport.ts`: レポートの型と、AI を使わないローカル集計 `buildLocalQuizReport`。

## scripts

- `validateQuestions.ts`: 問題データの ID 重複、選択肢数、正解番号、空欄などを検査する。
- `checkGemini.ts`: Gemini API に実際に接続し、モデルの存在・構造化出力・Google 検索連携を確認する。API キーが必要なので CI では実行しない。`npm run check:gemini` で実行。
- `checkStreak.ts`: 連続ログイン日数（`nextLoginStreak`）、日数差（`diffInDays`）、日付キー（`toLocalDateKey`）の計算を確認する。実行環境に左右されないよう、日数差は米国東部時間（夏時間の切り替えあり）、日付キーは日本時間に固定して検証する。`npm run check:streak` で実行。

## 補足
- 各 UI コンポーネントは `motion/react` を使って遷移・ホバー演出を付与。
- このプロジェクトは「関数・ブロック単位」で理解する構成になっており、行ごとの追跡が必要な場合はこのファイルを起点に対象ファイルを確認すると把握しやすいです。
