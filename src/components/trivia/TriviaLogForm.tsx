import { motion } from 'motion/react';
import { Frown, Meh, Smile } from 'lucide-react';
import { cn } from '../../lib/utils';

type TriviaReaction = 'funny' | 'failed' | 'known';

interface TriviaLogFormProps {
  reaction: TriviaReaction;
  note: string;
  onReactionChange: (reaction: TriviaReaction) => void;
  onNoteChange: (note: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export function TriviaLogForm({
  reaction,
  note,
  onReactionChange,
  onNoteChange,
  onSubmit,
  onCancel,
}: TriviaLogFormProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="mt-8 p-8 bg-white rounded-3xl border border-gray-100 shadow-xl"
    >
      <h3 className="text-xl font-bold mb-6 text-center">相手の反応はどうでしたか？</h3>
      <div className="flex justify-center gap-8 mb-8">
        {[
          { id: 'funny', icon: Smile, label: 'ウケた', color: 'text-green-500' },
          { id: 'known', icon: Meh, label: '知ってた', color: 'text-yellow-500' },
          { id: 'failed', icon: Frown, label: '滑った', color: 'text-red-500' },
        ].map(r => (
          <button
            key={r.id}
            onClick={() => onReactionChange(r.id as TriviaReaction)}
            className={cn(
              'flex flex-col items-center gap-2 p-4 rounded-2xl transition-all',
              reaction === r.id ? 'bg-gray-50 scale-110 ring-2 ring-gray-200' : 'opacity-40 hover:opacity-100'
            )}
          >
            <r.icon size={32} className={r.color} />
            <span className="text-xs font-sans font-bold">{r.label}</span>
          </button>
        ))}
      </div>
      <textarea
        id="trivia-log-note"
        name="triviaLogNote"
        value={note}
        onChange={(e) => onNoteChange(e.target.value)}
        placeholder="メモ（相手の反応など）"
        className="w-full p-4 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-yellow-200 mb-6 font-sans text-sm"
        rows={3}
      />
      <div className="flex justify-end gap-4">
        <button onClick={onCancel} className="px-6 py-2 text-gray-400 font-sans font-bold text-sm">
          キャンセル
        </button>
        <button onClick={onSubmit} className="olive-button font-sans font-bold text-sm">
          記録を保存
        </button>
      </div>
    </motion.div>
  );
}
