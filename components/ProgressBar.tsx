
import React from 'react';
import { ThemeMode } from '../types';

interface ProgressBarProps {
  progress: number;
  colorClass?: string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  theme?: ThemeMode;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  progress, 
  colorClass = 'bg-blue-600', 
  label,
  size = 'md',
  theme = 'light'
}) => {
  const isDark = theme === 'dark';
  const height = size === 'sm' ? 'h-1.5' : size === 'md' ? 'h-2.5' : 'h-4';
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between mb-1">
          <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>{label}</span>
          <span className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-gray-700'}`}>{clampedProgress.toFixed(0)}%</span>
        </div>
      )}
      <div className={`w-full rounded-full ${height} overflow-hidden transition-colors ${isDark ? 'bg-slate-800' : 'bg-gray-200'}`}>
        <div 
          className={`${height} ${colorClass} rounded-full transition-all duration-500 ease-out`} 
          style={{ width: `${clampedProgress}%` }}
        ></div>
      </div>
    </div>
  );
};
