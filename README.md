# Biz-Knowledge Sticky

Biz-Knowledge Sticky は、ビジネス一般常識を日々の習慣として学べる Web アプリです。  
クイズで基礎知識をインプットし、雑学ネタでアウトプットし、ニュースと地域情報で時事感度を高めることを目的にしています。

## アプリの概要

このアプリは 5 つの機能を 1 画面にまとめた学習ダッシュボードです。

- 成績レポート: 学習進捗、カテゴリ別スコア、レーダーチャート、学習カレンダーを表示
- 一般常識ドリル: カテゴリ選択式のタイムアタッククイズ
- 雑学ネタ帳: 今日の雑学と会話ログの記録
- お天気情報: 現在地ベースの天気・地域ニュース
- 最新トピックス: IT / 経済 / 政治社会のニュース一覧

## 想定ユースケース

- 就活生・新社会人が毎日少しずつ一般常識を強化したい
- 朝会前に時事ネタを短時間で把握したい
- 学んだ知識を会話で使って定着させたい

## 画面構成

- 左側: 付箋風メニューで機能タブを切り替え
- 右側: 選択した機能のコンテンツ表示
- ヘッダー: 現在時刻、ランク、連続ログイン日数を表示
- フッター: 固定情報表示

## 主要機能の詳細

### 1. 成績レポート

- 総合スコア (XP) とランクを表示
- カテゴリ別スコアをレーダーチャートで可視化
- 日別学習ログを折れ線グラフで表示
- 学習カレンダーで日ごとの獲得 XP とカテゴリ履歴を確認

ランクは累積スコアに応じて変化します。

- 0 - 100: インターン
- 101 - 300: シニア
- 301 - 500: マネージャー
- 501 以上: エグゼクティブ

### 2. 一般常識ドリル

- カテゴリ別問題 (英語、漢字、ビジネスマナー、政治、気象、行政)
- 1 問ごとに制限時間 10 秒
- 正解時に XP を加算
- 回答後に解説を表示

### 3. 雑学ネタ帳

- サーバー側の日次配布テーブルで雑学を 1 ブラウザ 1 件配布
- 「誰かに話した」ログを記録
- 反応 (ウケた / 知ってた / 滑った) とメモを保存
- アウトプット回数に応じて博識レベルを更新

### 4. お天気情報

- ブラウザの Geolocation API で現在地を取得
- Gemini API で現在地周辺の住所・天気・地域ニュースを取得
- 手動リフレッシュ可能

### 5. 最新トピックス

- Gemini API + Google Search ツールで最新ニュースを収集
- カテゴリ別 (IT、経済、政治社会) に記事を表示
- 当日のニュースは localStorage にキャッシュし、再読込を高速化

## データ保存

学習データはブラウザの localStorage に保存されます。

- biz_knowledge_stats: ユーザー統計データ
- biz_daily_news: 当日ニュースのキャッシュ
- biz_daily_news_date: キャッシュ日付
- biz_daily_news_time: ニュース取得時刻
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
import { QUESTIONS, STATIC_TRIVIA, CATEGORY_LABELS } from './types';
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

- 周辺地域情報 (住所、天気、地域ニュース)
- 最新ニューストピック

API キー未設定時は該当機能でエラーになります。クイズやローカル保存ベースの機能は利用可能です。

## 補足

- 本アプリは学習支援を目的としたデモ実装です
- ニュースや地域情報は外部 API 応答に依存します

## 開発者向け解説

- ファイルごとの役割と主要関数の説明: [FILE_EXPLANATION.md](FILE_EXPLANATION.md)
