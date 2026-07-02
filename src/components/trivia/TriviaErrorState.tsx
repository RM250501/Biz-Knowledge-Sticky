import { Frown } from 'lucide-react';

interface TriviaErrorStateProps {
  message: string;
  onRetry: () => void;
  onCheckCache: () => void;
}

export function TriviaErrorState({ message, onRetry, onCheckCache }: TriviaErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-4 text-center p-8">
      <Frown size={48} className="text-gray-300" />
      <p className="text-gray-500 font-serif">{message}</p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button onClick={onRetry} className="olive-button text-xs">
          再取得する
        </button>
        <button onClick={onCheckCache} className="text-xs font-sans font-bold text-yellow-600 hover:underline">
          キャッシュを確認する
        </button>
      </div>
    </div>
  );
}
