import React, { useState, useEffect } from 'react';

interface NumberWonInputProps {
  value: number;
  onChange: (val: number) => void;
  label: string;
  helperText?: string;
  placeholder?: string;
  step?: number;
  min?: number;
  className?: string;
}

export const NumberWonInput: React.FC<NumberWonInputProps> = ({
  value,
  onChange,
  label,
  helperText,
  placeholder = '0',
  className = '',
}) => {
  const [text, setText] = useState<string>(value > 0 ? value.toLocaleString() : '');

  useEffect(() => {
    const numeric = parseInt(text.replace(/[^0-9]/g, '') || '0', 10);
    if (numeric !== value) {
      setText(value > 0 ? value.toLocaleString() : '');
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    if (raw === '') {
      setText('');
      onChange(0);
      return;
    }
    const num = parseInt(raw, 10);
    setText(num.toLocaleString());
    onChange(num);
  };

  // 한글 금액 요약 (예: 2억 5,000만원)
  const getKoreanWonSummary = (val: number) => {
    if (val <= 0) return '';
    const eok = Math.floor(val / 100_000_000);
    const man = Math.floor((val % 100_000_000) / 10_000);
    let str = '';
    if (eok > 0) str += `${eok}억 `;
    if (man > 0) str += `${man.toLocaleString()}만 `;
    return `(${str.trim()}원)`;
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
        <label className="text-xs font-semibold text-stone-300">
          {label}
        </label>
        {value > 0 && (
          <span className="text-[11px] font-medium text-amber-300 font-mono whitespace-nowrap">
            {getKoreanWonSummary(value)}
          </span>
        )}
      </div>

      <div className="relative">
        <input
          type="text"
          value={text}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full bg-brown-900 border border-brown-700/80 rounded-xl px-3.5 py-2.5 text-sm text-stone-100 placeholder-stone-500 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition"
        />
        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-stone-400 pointer-events-none">
          원
        </span>
      </div>

      {helperText && (
        <p className="text-[11px] text-stone-400 leading-tight">
          {helperText}
        </p>
      )}
    </div>
  );
};
