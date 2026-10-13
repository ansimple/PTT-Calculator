import React from 'react';
import { 
  Building2, 
  Printer, 
  Receipt, 
  Download
} from 'lucide-react';
import { useCalculatorStore } from '../../stores/useCalculatorStore';
import { usePwaInstall } from '../../hooks/usePwaInstall';

export const Header: React.FC = () => {
  const { 
    setIsPrintModalOpen, 
    setIsReceiptModalOpen,
  } = useCalculatorStore();

  const { isInstallable, isInstalled, installApp } = usePwaInstall();

  return (
    <header className="h-14 border-b border-brown-800 bg-brown-900/95 backdrop-blur px-3 sm:px-5 flex items-center justify-between gap-2 z-20 shrink-0 no-print">
      {/* Brand & Logo */}
      <div className="flex items-center min-w-0">
        <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mr-2 shrink-0">
          <Building2 className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <h1 className="text-xs sm:text-sm font-semibold tracking-tight text-stone-100 flex items-center gap-1.5 sm:gap-2 truncate">
            <span className="font-bold tracking-normal text-amber-400 truncate">
              의성군 취등록세 & 등기비용 계산기
            </span>
            <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 font-mono font-medium shrink-0">
              2026 현행 실무
            </span>
          </h1>
        </div>
      </div>

      {/* Top Action Buttons */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <button
          onClick={() => setIsReceiptModalOpen(true)}
          title="상세 비용 명세서 및 카카오톡 상담 텍스트 복사"
          className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-brown-800 text-stone-200 hover:bg-brown-750 border border-brown-700/70 text-xs font-semibold transition"
        >
          <Receipt className="w-3.5 h-3.5" />
          <span className="hidden xs:inline sm:inline">비용 </span>
          <span>명세서</span>
        </button>

        <button
          onClick={() => setIsPrintModalOpen(true)}
          title="공식 A4 견적서 인쇄 및 PDF 저장"
          className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md shadow-amber-600/25 transition"
        >
          <Printer className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">A4 </span>
          <span>인쇄/PDF</span>
        </button>

        {isInstallable && !isInstalled && (
          <button
            onClick={installApp}
            title="홈 화면에 PWA 앱 설치"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 text-xs font-bold transition animate-pulse hover:animate-none"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden md:inline">앱 설치</span>
          </button>
        )}
      </div>
    </header>
  );
};
