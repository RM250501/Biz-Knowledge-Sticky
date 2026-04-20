import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface ContentWindowProps {
  title: string;
  icon: any;
  children: React.ReactNode;
  color?: "yellow" | "blue" | "green" | "pink" | "purple";
  key?: string;
}

export const ContentWindow = ({ 
  title, 
  icon: Icon, 
  children, 
  color = "yellow" 
}: ContentWindowProps) => {
  const colors = {
    yellow: "bg-[#fffde7] border-[#fff59d]",
    blue: "bg-[#f1f8ff] border-[#bbdefb]",
    green: "bg-[#f1f8e9] border-[#c8e6c9]",
    pink: "bg-[#fdf2f7] border-[#f8bbd0]",
    purple: "bg-[#f8f1f9] border-[#e1bee7]"
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={cn(
        "flex-1 h-full p-8 rounded-2xl border-2 shadow-inner overflow-auto",
        colors[color]
      )}
    >
      <div className="flex items-center gap-3 mb-8 border-b pb-4 border-black/5">
        <div className="p-3 bg-white rounded-xl shadow-sm">
          <Icon size={24} className="text-gray-700" />
        </div>
        <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tight">{title}</h2>
      </div>
      {children}
    </motion.div>
  );
};
