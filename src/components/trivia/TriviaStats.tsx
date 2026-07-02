interface TriviaStatsProps {
  knowledgeLevel: number;
  outputCount: number;
  funnyCount: number;
}

export function TriviaStats({ knowledgeLevel, outputCount, funnyCount }: TriviaStatsProps) {
  return (
    <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm text-center">
        <h4 className="text-[10px] font-sans font-black text-gray-400 uppercase tracking-widest mb-2">博識レベル</h4>
        <div className="text-3xl font-bold text-[#5A5A40]">{knowledgeLevel}</div>
        <p className="text-[10px] text-gray-400 mt-1 italic">Knowledge Level</p>
      </div>
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm text-center">
        <h4 className="text-[10px] font-sans font-black text-gray-400 uppercase tracking-widest mb-2">アウトプット数</h4>
        <div className="text-3xl font-bold text-[#5A5A40]">{outputCount}</div>
        <p className="text-[10px] text-gray-400 mt-1 italic">Total Outputs</p>
      </div>
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm text-center">
        <h4 className="text-[10px] font-sans font-black text-gray-400 uppercase tracking-widest mb-2">ウケた回数</h4>
        <div className="text-3xl font-bold text-[#5A5A40]">{funnyCount}</div>
        <p className="text-[10px] text-gray-400 mt-1 italic">Success Count</p>
      </div>
    </div>
  );
}
