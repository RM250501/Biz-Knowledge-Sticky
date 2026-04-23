import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  // clsx で条件付きクラスを結合し、twMerge で Tailwind の競合を解消する。
  return twMerge(clsx(inputs));
}
