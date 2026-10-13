import React from 'react';
import { Layers, Sparkles } from 'lucide-react';
import { useCalculatorStore } from '../../stores/useCalculatorStore';
import { ScenarioCard } from './ScenarioCard';

export const ScenarioGrid: React.FC = () => {
  const { scenarios, selectedScenarioId } = useCalculatorStore();

  const standardScenario = scenarios.find(s => s.scenarioId === 'STANDARD');
  const exemptionScenarios = scenarios.filter(s => s.scenarioId !== 'STANDARD');

  return (
    <div className="space-y-4">
      {/* Dashboard Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span>감면 시나리오 비교 분석</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono">
                총 {scenarios.length}개 시나리오
              </span>
            </h2>
            <p className="text-[11px] text-stone-400">
              카드를 선택하여 요건을 점검하고 세부 영수증을 확인하세요
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Scenarios */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Always display Standard first */}
        {standardScenario && (
          <ScenarioCard
            key={standardScenario.scenarioId}
            scenario={standardScenario}
            isStandard={true}
            isSelected={selectedScenarioId === standardScenario.scenarioId}
          />
        )}

        {/* Exemption Scenarios */}
        {exemptionScenarios.map((scenario) => (
          <ScenarioCard
            key={scenario.scenarioId}
            scenario={scenario}
            isStandard={false}
            isSelected={selectedScenarioId === scenario.scenarioId}
          />
        ))}
      </div>

      {/* Helper guide box */}
      <div className="p-3 rounded-xl bg-brown-900/60 border border-brown-800 text-xs text-stone-300 flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-stone-200">
            💡 상담 안내 팁 (One-Input Multi-Output)
          </p>
          <p className="text-[11px] text-stone-400 leading-relaxed">
            고객과의 대화 중 해당하는 혜택 카드의 <strong className="text-amber-300">[요건 점검 문답]</strong>을 눌러 3~5개 법정 요건을 체크하면 적격 여부가 즉시 판정되며, 하단 [명세서] 및 상단 [인쇄/PDF] 버튼으로 견적서를 바로 발행할 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
};
