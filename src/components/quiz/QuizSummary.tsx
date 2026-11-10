import React from 'react';
import { AlertCircle, CheckCircle2, ChevronRight, MessageSquare, RotateCcw, Settings2 } from 'lucide-react';
import { CATEGORY_LABELS } from '../../types';
import type { QuizReport } from '../../../shared/quizReport';
import type { QuizSettings } from './types';

interface QuizSummaryProps {
  message: string;
  settings: QuizSettings;
  answeredCount: number;
  correctCount: number;
  report: QuizReport | null;
  reportLoading: boolean;
  onBackToSetup: () => void;
  onRestart: () => void;
}

const StatTile = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
    <div className="text-[10px] font-black text-gray-400 uppercase">{label}</div>
    {children}
  </div>
);

const ReportTable = ({ report }: { report: QuizReport }) => (
  <div className="overflow-x-auto rounded-lg border border-gray-100 bg-white shadow-sm">
    <table className="min-w-full divide-y divide-gray-200 text-sm text-gray-700">
      <thead className="bg-gray-50">
        <tr>
          {['カテゴリ', '問題', '自分の回答', '正解', '結果'].map((h) => (
            <th key={h} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-100">
        {report.correctnessTable.map((r, i) => (
          <tr key={`${r.id}-${i}`} className="hover:bg-gray-50">
            <td className="px-3 py-3 align-top whitespace-nowrap">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                {CATEGORY_LABELS[r.category] || r.category}
              </span>
            </td>
            <td className="px-3 py-3 align-top min-w-[12rem]">{r.question}</td>
            <td className="px-3 py-3 align-top">{r.userAnswer}</td>
            <td className="px-3 py-3 align-top">{r.correctAnswer}</td>
            <td className="px-3 py-3 align-top whitespace-nowrap">
              {r.isCorrect ? (
                <span className="inline-flex items-center gap-2 text-green-700 bg-green-50 px-2 py-1 rounded-full text-sm font-semibold">
                  <CheckCircle2 size={16} /> 正解
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 text-red-700 bg-red-50 px-2 py-1 rounded-full text-sm font-semibold">
                  <AlertCircle size={16} /> 不正解
                </span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const QuizSummary = ({
  message,
  settings,
  answeredCount,
  correctCount,
  report,
  reportLoading,
  onBackToSetup,
  onRestart,
}: QuizSummaryProps) => (
  <div className="max-w-3xl mx-auto space-y-6">
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
      <div className="flex items-center gap-2 text-gray-500 text-xs font-black uppercase tracking-[0.2em]">
        <Settings2 size={14} /> セッション終了
      </div>
      <h2 className="text-2xl font-black text-gray-800">{message || 'セッションが終了しました'}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatTile label="回答数">
          <div className="text-xl font-black text-gray-800">{answeredCount}</div>
        </StatTile>
        <StatTile label="正解数">
          <div className="text-xl font-black text-green-600">{correctCount}</div>
        </StatTile>
        <StatTile label="出題方法">
          <div className="text-sm font-bold text-gray-800">
            {settings.sourceMode === 'random' ? 'カテゴリランダム' : `カテゴリ別: ${CATEGORY_LABELS[settings.category] || settings.category}`}
          </div>
        </StatTile>
        <StatTile label="終了条件">
          <div className="text-sm font-bold text-gray-800">
            {settings.endMode === 'time' ? `${settings.durationMinutes}分` : `${settings.questionTarget}問`}
          </div>
        </StatTile>
      </div>
    </div>

    <div className="flex gap-3">
      <button
        onClick={onBackToSetup}
        className="flex-1 py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
      >
        <RotateCcw size={18} /> 設定に戻る
      </button>
      <button
        onClick={onRestart}
        className="flex-1 py-4 bg-white text-gray-900 rounded-xl font-bold border border-gray-200 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
      >
        <ChevronRight size={18} /> 同じ設定でもう一度
      </button>
    </div>

    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
      <div className="flex items-center gap-2 text-gray-500 text-xs font-black uppercase tracking-[0.2em]">
        <Settings2 size={14} /> セッションレポート
      </div>
      {answeredCount === 0 ? (
        <p className="text-gray-500">回答がなかったため、レポートはありません。</p>
      ) : reportLoading || !report ? (
        <p className="text-gray-500">レポートを生成中です…</p>
      ) : (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-800">{report.summary}</h3>
          <ReportTable report={report} />
          {report.comment && (
            <div className="p-4 bg-gradient-to-r from-blue-50 via-white to-white border-l-4 border-blue-400 rounded flex items-start gap-3">
              <MessageSquare size={20} className="text-blue-800 shrink-0" />
              <div>
                <div className="font-bold text-blue-900">{report.source === 'ai' ? 'AIコメント' : 'コメント'}</div>
                <div className="text-blue-800 mt-1 text-sm leading-relaxed">{report.comment}</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  </div>
);
