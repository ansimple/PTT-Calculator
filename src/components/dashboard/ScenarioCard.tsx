import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  FileCheck, 
  Receipt,
  Scale
} from 'lucide-react';
import { ScenarioCalculationResult } from '../../types/calculator';
import { useCalculatorStore } from '../../stores/useCalculatorStore';
import { formatWon, formatNumberWithComma } from '../../utils/formatters';

interface ScenarioCardProps {
  scenario: ScenarioCalculationResult;
  isStandard: boolean;
  isSelected: boolean;
}

export const ScenarioCard: React.FC<ScenarioCardProps> = ({
  scenario,
  isStandard,
  isSelected,
}) => {
  const { 
    setSelectedScenarioId, 
    setActiveChecklistScenarioId, 
    setIsReceiptModalOpen 
  } = useCalculatorStore();

  const isEligible = scenario.eligibilityStatus === 'ELIGIBLE';
  const hasSavings = scenario.taxSavingsAmount > 0;

  const handleSelect = () => {
    setSelectedScenarioId(scenario.scenarioId);
  };

  const handleOpenChecklist = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveChecklistScenarioId(scenario.scenarioId);
  };

  const handleOpenReceipt = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedScenarioId(scenario.scenarioId);
    setIsReceiptModalOpen(true);
  };

  return (
    <div
      onClick={handleSelect}
      className={`relative rounded-2xl p-4 sm:p-5 transition-all cursor-pointer border flex flex-col justify-between ${
        isSelected
          ? 'bg-brown-900 border-amber-500/80 shadow-2xl ring-2 ring-amber-500/30'
          : 'bg-brown-900/70 border-brown-800 hover:border-brown-700 hover:bg-brown-900/90'
      }`}
    >
      {/* Top Badge & Status */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span
            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
              isStandard
                ? 'bg-stone-800 text-stone-300 border-stone-700'
                : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
            }`}
          >
            {scenario.scenarioBadge}
          </span>

          {/* Checklist status indicator */}
          {!isStandard && (
            <div className="flex items-center gap-1">
              {isEligible ? (
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>적격 충족</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                  <Clock className="w-3.5 h-3.5" />
                  <span>요건 점검 필요</span>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Title & Description */}
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-1.5">
            {scenario.scenarioName}
          </h3>
          <p className="text-xs text-stone-400 leading-snug mt-1 line-clamp-2">
            {scenario.scenarioDescription}
          </p>
        </div>

        {/* Cost Summary Box */}
        <div className="p-3 rounded-xl bg-brown-950/80 border border-brown-800/80 space-y-2 mt-3">
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-stone-400">총 등기 소요비용</span>
            <span className="text-lg font-bold text-amber-400 font-mono">
              {formatWon(scenario.grandTotal)}
            </span>
          </div>

          <div className="pt-2 border-t border-brown-800/60 grid grid-cols-2 gap-2 text-[11px] text-stone-300">
            <div>
              <span className="text-stone-400">지방세 합계: </span>
              <span className="font-mono font-semibold">
                {formatNumberWithComma(scenario.taxBreakdown.totalLocalTax)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-stone-400">공적 부대비용: </span>
              <span className="font-mono font-semibold">
                {formatNumberWithComma(scenario.registrationExpenses.totalExpenses)}
              </span>
            </div>
          </div>
        </div>

        {/* Savings Badge */}
        {hasSavings && (
          <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-950/50 border border-emerald-600/40 text-emerald-300 text-xs font-semibold">
            <div className="flex items-center gap-1">
              <Scale className="w-3.5 h-3.5 text-emerald-400" />
              <span>일반 대비 총 절세액</span>
            </div>
            <span className="font-mono text-sm font-bold text-emerald-400">
              +{formatWon(scenario.taxSavingsAmount)}
            </span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-4 mt-3 border-t border-brown-800/80">
        {!isStandard && (
          <button
            type="button"
            onClick={handleOpenChecklist}
            className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              isEligible
                ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-600/40 hover:bg-emerald-600/30'
                : 'bg-amber-600/20 text-amber-300 border border-amber-600/40 hover:bg-amber-600/30'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>{isEligible ? '요건 점검 완료' : '요건 점검 문답'}</span>
          </button>
        )}

        <button
          type="button"
          onClick={handleOpenReceipt}
          className="py-2 px-3 rounded-xl bg-brown-800 hover:bg-brown-700 text-stone-200 text-xs font-medium border border-brown-700/60 transition flex items-center justify-center gap-1 shrink-0"
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>명세서</span>
        </button>
      </div>
    </div>
  );
};
