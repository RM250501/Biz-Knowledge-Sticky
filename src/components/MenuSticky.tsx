import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface MenuStickyProps {
  title: string;
  icon: any;
  isActive: boolean;
  onClick: () => void;
  color?: "yellow" | "blue" | "green" | "pink" | "purple";
  key?: string;
}

export const MenuSticky = ({ 
  title, 
  icon: Icon, 
  isActive, 
  onClick, 
  color = "yellow" 
}: MenuStickyProps) => {
  // 付箋テーマごとの配色定義。
  const colors = {
    yellow: "bg-[#fff9c4] border-[#fbc02d] text-[#5d4037]",
    blue: "bg-[#e3f2fd] border-[#64b5f6] text-[#1565c0]",
    green: "bg-[#e8f5e9] border-[#81c784] text-[#2e7d32]",
    pink: "bg-[#fce4ec] border-[#f06292] text-[#880e4f]",
    purple: "bg-[#f3e5f5] border-[#ba68c8] text-[#4a148c]"
  };

  return (
    <motion.button
      onClick={onClick}
      // 付箋らしい軽い動きを表現するアニメーション。
      whileHover={{ x: 10, rotate: 1 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "w-full p-4 mb-4 text-left shadow-md border-l-4 transition-all relative group overflow-hidden",
        colors[color],
        isActive ? "ring-2 ring-black/20 translate-x-4 shadow-lg" : "opacity-80 hover:opacity-100"
      )}
    >
      <div className="flex items-center gap-3">
        <Icon size={20} />
        <span className="font-bold text-sm uppercase tracking-tight">{title}</span>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, x: -10 }}
              // 補助テキストはホバー時のみ表示。
        whileHover={{ opacity: 1, x: 0 }}
        className="mt-2 text-[10px] font-medium opacity-60 overflow-hidden h-0 group-hover:h-auto transition-all"
      >
        クリックして詳細を表示
      </motion.div>

      {isActive && (
              // アクティブ項目の右側マーカー。
        <div className="absolute right-0 top-0 bottom-0 w-1 bg-black/20" />
      )}
    </motion.button>
  );
};
