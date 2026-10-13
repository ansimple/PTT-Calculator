import React from 'react';
import { 
  X, 
  CheckSquare, 
  Square, 
  CheckCircle2, 
  AlertTriangle, 
  BookOpen, 
  RotateCcw 
} from 'lucide-react';
import { useCalculatorStore } from '../../stores/useCalculatorStore';

export const ChecklistDrawer: React.FC = () => {
  const {
    activeChecklistScenarioId,
    setActiveChecklistScenarioId,
    scenarios,
    toggleChecklistItem,
    resetChecklist,
    setSelectedScenarioId,
  } = useCalculatorStore();

  if (!activeChecklistScenarioId) return null;

  const currentScenario = scenarios.find(s => s.scenarioId === activeChecklistScenarioId);
  if (!currentScenario) return null;

  const questions = currentScenario.checklist;
  const isEligible = currentScenario.eligibilityStatus === 'ELIGIBLE';
  const checkedCount = questions.filter(q => q.checked).length;
  const totalCount = questions.length;

  const handleClose = () => {
    setActiveChecklistScenarioId(null);
  };

  const handleApplyThis = () => {
    setSelectedScenarioId(currentScenario.scenarioId);
    setActiveChecklistScenarioId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-xl bg-brown-900 border border-brown-700 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-stone-100">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-brown-800 bg-brown-900 flex items-center justify-between shrink-0">
          <div className="space-y-1 min-w-0 pr-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                의성군 실무 점검표
              </span>
              <span className="text-xs text-stone-400">
                진행도: {checkedCount}/{totalCount}
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white leading-snug break-keep">
              {currentScenario.scenarioName} 요건 심사
            </h3>
            <p className="text-[11px] text-stone-400 font-mono">
              근거: {currentScenario.legalBasis}
            </p>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-brown-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Banner */}
        <div className="px-4 sm:px-5 py-3 border-b border-brown-800 shrink-0">
          {isEligible ? (
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <div className="text-emerald-200 font-bold">모든 법정 요건 충족 (적격 확정)</div>
                <div className="text-[11px] text-emerald-300/80 font-normal">
                  본 감면 혜택을 안전하게 적용할 수 있습니다.
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <div className="text-amber-200 font-bold">요건 확인 진행 중 ({checkedCount}/{totalCount})</div>
                <div className="text-[11px] text-amber-300/80 font-normal">
                  의뢰인과의 문답을 통해 모든 항목을 체크해 주세요.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Questions Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 bg-brown-950/70">
          {questions.map((q, idx) => (
            <div
              key={q.id}
              onClick={() => toggleChecklistItem(currentScenario.scenarioId, q.id)}
              className={`p-3.5 rounded-xl border transition cursor-pointer space-y-1.5 ${
                q.checked
                  ? 'bg-brown-900 border-amber-500/60 shadow-md ring-1 ring-amber-500/30'
                  : 'bg-brown-900/60 border-brown-800 hover:border-brown-700'
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  className="mt-0.5 text-amber-400 focus:outline-none"
                >
                  {q.checked ? (
                    <CheckSquare className="w-5 h-5 text-amber-400" />
                  ) : (
                    <Square className="w-5 h-5 text-stone-500" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="text-xs sm:text-sm font-semibold text-stone-100 leading-snug">
                    <span className="text-amber-400 mr-1.5">Q{idx + 1}.</span>
                    {q.question}
                  </div>

                  {q.helperText && (
                    <p className="text-[11px] text-stone-400 leading-relaxed mt-1">
                      {q.helperText}
                    </p>
                  )}

                  {q.legalReference && (
                    <div className="flex items-center gap-1 text-[10px] text-amber-300/70 font-mono mt-1">
                      <BookOpen className="w-3 h-3" />
                      <span>{q.legalReference}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Post Management Warnings */}
          {currentScenario.postManagementNotice.length > 0 && (
            <div className="p-3.5 rounded-xl bg-brown-900 border border-brown-800 text-xs space-y-1.5 text-stone-300">
              <div className="font-bold text-amber-300 flex items-center gap-1">
                <span>⚠️ 사후관리 및 추징 유의사항</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-stone-400">
                {currentScenario.postManagementNotice.map((notice, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {notice}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3.5 sm:p-4 border-t border-brown-800 bg-brown-900 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <button
            onClick={() => resetChecklist(currentScenario.scenarioId)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs text-stone-400 hover:text-stone-200 hover:bg-brown-800 whitespace-nowrap transition"
          >
            <RotateCcw className="w-3.5 h-3.5 shrink-0" />
            <span>체크 초기화</span>
          </button>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={handleClose}
              className="px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold text-stone-300 hover:bg-brown-800 whitespace-nowrap transition"
            >
              닫기
            </button>
            <button
              onClick={handleApplyThis}
              className="px-3.5 sm:px-5 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/30 whitespace-nowrap transition"
            >
              이 감면으로 적용하기
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
