# Biz-Knowledge Sticky

Biz-Knowledge Sticky は、ビジネス一般常識を毎日の習慣として学べる Web アプリです。  
現在の仕様は、学習の進捗確認、4択クイズ、日替わり雑学のアウトプット、現在地ベースの天気表示、最新ニュースの確認を 1 画面でまとめて扱う構成です。

## 現在の仕様

### 画面構成

- 左側の付箋風メニューで機能を切り替える
- 右側に選択中モジュールを表示する
- 上部ヘッダーに現在時刻、連続ログイン日数、現在ランクを表示する
- 下部フッターに固定情報を表示する

### 機能一覧

- 成績レポート: 総合 XP、現在ランク、強いカテゴリ、学習ログ、学習カレンダーを表示する
- 一般常識ドリル: 6 カテゴリの 4 択クイズを出題する。出題方法はカテゴリ別またはランダム、終了条件は時間制または出題数制を選べる
- 雑学ネタ帳: 1 ブラウザ 1 日 1 件の雑学を配布し、話した記録と反応メモを残せる
- お天気情報: Geolocation と地域指定の両方に対応し、現在天気と 3 時間ごとの予報を表示する
- 最新トピックス: IT・経済・政治社会の最新ニュースをカテゴリ別に表示し、当日分はキャッシュする

### 学習データの扱い

- 学習進捗は localStorage に保存される
- 学習ログは直近 30 日分を保持する
- 雑学のアウトプット記録はブラウザ単位で蓄積される
- ニュースは日付単位でキャッシュされる
- 天気の表示地域設定も localStorage に保存される

## 想定ユースケース

- 就活生・新社会人が毎日少しずつ一般常識を強化したい
- 朝会前に時事ネタを短時間で把握したい
- 学んだ知識を会話で使って定着させたい

## 主要機能の詳細

### 1. 成績レポート

- 総合スコア (XP) とランクを表示
- カテゴリ別スコアをレーダーチャートで可視化
- 当月の学習カレンダーで日ごとの獲得 XP と履歴を確認
- 詳細表示では総合 XP と博識レベルの進捗バーを切り替えられる

ランクは累積スコアに応じて変化します。

- 0 - 100: インターン
- 101 - 300: シニア
- 301 - 500: マネージャー
- 501 以上: エグゼクティブ

### 2. 一般常識ドリル

- カテゴリ別問題 (英語、漢字、ビジネスマナー、政治、気象、行政)
- 1 問ごとに制限時間 10 秒
- 出題方法はカテゴリ別またはランダムを選択できる
- 終了条件は「時間」または「出題数」を選択できる
- 正解時に 10 XP を加算し、カテゴリ別スコアにも反映する
- 回答後は各問題に紐づく解説を表示する

### 3. 雑学ネタ帳

- サーバー側で 1 ブラウザ 1 日 1 件の雑学を割り当てる
- 取得できない場合は固定の雑学データにフォールバックする
- 「今日、誰かに話した！」から反応 (ウケた / 知ってた / 滑った) とメモを記録できる
- 記録すると博識レベルと雑学ログが更新される

### 4. お天気情報

- ブラウザの Geolocation API で現在地を取得する
- 現在地の代わりに都道府県・市区名を指定して表示先を切り替えられる
- 現在天気、湿度、風速、降水確率、1 時間降水量、3 時間ごとの予報を表示する
- 手動リフレッシュ可能

### 5. 最新トピックス

- Gemini API + Google Search ツールで最新ニュースを収集する
- カテゴリ別 (IT・テクノロジー、経済・ビジネス、政治・社会) に記事を表示する
- 当日のニュースは localStorage にキャッシュし、再読込を高速化する

## データ保存

学習データはブラウザの localStorage に保存されます。

- biz_knowledge_stats: ユーザー統計データ
- biz_daily_news: 当日ニュースのキャッシュ
- biz_daily_news_date: キャッシュ日付
- biz_daily_news_time: ニュース取得時刻
- biz_weather_settings_v1: 天気モジュールの表示地域設定
- biz_knowledge_browser_id_v1: 雑学配布用のブラウザ識別子
- biz_knowledge_daily_trivia_v2_<browserId>: 当日配布された雑学のキャッシュ
- last_seen_streak: 連続ログイン演出の表示管理

注意:

- 保存先はブラウザ単位です
- 別ブラウザやシークレットモードでは共有されません
- localStorage を削除すると学習履歴は初期化されます

## 技術スタック

- フロントエンド: React 19 + TypeScript + Vite
- UI: Tailwind CSS 4, lucide-react
- アニメーション: motion
- グラフ: recharts
- AI 連携: @google/genai (Gemini)
- サーバー: Express + Node.js

## セットアップ手順

前提:

- Node.js (推奨: LTS)

1. 依存関係をインストール

   npm install

2. ルートに .env.local を作成し、API キーを設定

   GEMINI_API_KEY=your_api_key_here

3. 開発サーバーを起動

   npm run dev

4. 別ターミナルで雑学配布 API サーバーを起動

   npm run dev:api

5. ブラウザでアクセス

   http://localhost:3000

## localhost での実行手順（インポート含む）

以下は、Windows の PowerShell で実行する想定です。

1. プロジェクト直下へ移動

   cd C:\Users\st20234151\Documents\卒論\Biz-Knowledge-Sticky

2. Node.js バージョン確認（推奨: LTS）

   node -v
   npm -v

3. 依存パッケージをインストール

   npm install

4. 環境変数ファイルを作成（未作成の場合）

   .env.local に以下を設定:

   GEMINI_API_KEY=your_api_key_here

5. 開発サーバー起動

   npm run dev

6. 別ターミナルで雑学配布 API を起動

   npm run dev:api

7. ブラウザで確認

   http://localhost:3000

8. 停止方法

   ターミナルで Ctrl + C

### 主要インポート（外部ライブラリ）

このプロジェクトで実際に利用している主要インポート例です。

```ts
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from '@google/genai';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, Radar
} from 'recharts';
import { LayoutDashboard, BookOpen, Newspaper } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
```

### 主要インポート（アプリ内モジュール）

```ts
import App from './App.tsx';
import './index.css';

import { MenuSticky } from './components/MenuSticky';
import { ContentWindow } from './components/ContentWindow';
import { Dashboard } from './components/Dashboard';
import { QuizModule } from './components/QuizModule';

import { useUserStats } from './hooks/useUserStats';
import { useCurrentTime } from './hooks/useCurrentTime';
import { useGeolocation } from './hooks/useGeolocation';

import { cn } from './lib/utils';
import { getActualNewsTopics, getActualLocalInfo } from './services/geminiService';
import { QUESTIONS, CATEGORY_LABELS } from './types';
```

### npm install で失敗したとき

```powershell
npm cache clean --force
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
npm install
```

補足:

- Gemini API を使う機能（ニュース、ローカル情報）は `GEMINI_API_KEY` が必須です
- API キー未設定でも、静的データ中心の画面は確認できます

## 利用可能なスクリプト

- npm run dev: 開発サーバー起動
- npm run dev:api: 雑学配布 API サーバー起動
- npm run build: 本番ビルド作成
- npm run preview: ビルド結果をローカル確認
- npm run lint: TypeScript 型チェック
- npm run clean: dist を削除

## API キーについて

このアプリは Gemini API を使って以下を生成・取得します。

- 周辺地域情報 (住所、天気)
- 最新ニューストピック
- 日替わり雑学の生成

API キー未設定時は該当機能でエラーになります。クイズやローカル保存ベースの機能は利用可能です。

## 補足

- 本アプリは学習支援を目的としたデモ実装です
- ニュースや地域情報は外部 API 応答に依存します

## 開発者向け解説

- ファイルごとの役割と主要関数の説明: [FILE_EXPLANATION.md](FILE_EXPLANATION.md)
