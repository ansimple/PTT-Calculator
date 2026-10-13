import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  PropertyCalculationInput, 
  ScenarioCalculationResult, 
  ScenarioId,
  ChecklistQuestion 
} from '../types/calculator';
import { generateAllScenarios } from '../engines/ExemptionMatrixEngine';

interface CalculatorState {
  // 1. 입력 상태
  input: PropertyCalculationInput;
  setInput: (partial: Partial<PropertyCalculationInput>) => void;
  resetInput: () => void;

  // 2. 시나리오별 체크리스트 상태
  checklistMap: Record<string, ChecklistQuestion[]>;
  toggleChecklistItem: (scenarioId: ScenarioId, questionId: string) => void;
  resetChecklist: (scenarioId: ScenarioId) => void;

  // 3. 연산 결과 및 활성 시나리오
  scenarios: ScenarioCalculationResult[];
  selectedScenarioId: ScenarioId;
  setSelectedScenarioId: (id: ScenarioId) => void;

  // 4. UI 모달 상태
  activeChecklistScenarioId: ScenarioId | null;
  setActiveChecklistScenarioId: (id: ScenarioId | null) => void;
  isReceiptModalOpen: boolean;
  setIsReceiptModalOpen: (open: boolean) => void;
  isPrintModalOpen: boolean;
  setIsPrintModalOpen: (open: boolean) => void;
}

export const INITIAL_INPUT: PropertyCalculationInput = {
  eupMyeon: 'ANGYE_MYEON', // 기본값: 안계면 (17개 면 특례 100㎡ 적용)
  isUiseongUrbanArea: false,
  propertyType: 'HOUSING',
  acquisitionCause: 'SALE',
  purchasePrice: 250_000_000,        // 2억 5천만원
  officialStandardPrice: 180_000_000, // 1억 8천만원
  exclusiveAreaSqm: 84.95,           // 84.95㎡
  ownedHousingCount: 1,              // 무주택자 1주택 취득
  isTemporaryTwoHomes: false,
  isCorporate: false,
  registrationMethod: 'E_FORM',      // e-Form 사전작성
  bondDiscountRate: 10.5,            // 10.5%
};

export const useCalculatorStore = create<CalculatorState>()(
  persist(
    (set, get) => ({
      input: INITIAL_INPUT,
      checklistMap: {},
      scenarios: generateAllScenarios(INITIAL_INPUT),
      selectedScenarioId: 'FIRST_HOME',
      activeChecklistScenarioId: null,
      isReceiptModalOpen: false,
      isPrintModalOpen: false,

      setInput: (partial) => {
        const nextInput = { ...get().input, ...partial };
        const nextScenarios = generateAllScenarios(nextInput, get().checklistMap);
        
        // 현재 선택된 시나리오가 여전히 결과에 존재하는지 검증
        let nextSelectedId = get().selectedScenarioId;
        if (!nextScenarios.some(s => s.scenarioId === nextSelectedId)) {
          nextSelectedId = 'STANDARD';
        }

        set({
          input: nextInput,
          scenarios: nextScenarios,
          selectedScenarioId: nextSelectedId,
        });
      },

      resetInput: () => {
        const nextScenarios = generateAllScenarios(INITIAL_INPUT);
        set({
          input: INITIAL_INPUT,
          checklistMap: {},
          scenarios: nextScenarios,
          selectedScenarioId: 'STANDARD',
        });
      },

      toggleChecklistItem: (scenarioId, questionId) => {
        const currentChecklistMap = { ...get().checklistMap };
        const currentScenario = get().scenarios.find(s => s.scenarioId === scenarioId);
        const list = currentChecklistMap[scenarioId] || currentScenario?.checklist || [];

        const updatedList = list.map(item => 
          item.id === questionId ? { ...item, checked: !item.checked } : item
        );

        currentChecklistMap[scenarioId] = updatedList;

        const nextScenarios = generateAllScenarios(get().input, currentChecklistMap);
        set({
          checklistMap: currentChecklistMap,
          scenarios: nextScenarios,
        });
      },

      resetChecklist: (scenarioId) => {
        const currentChecklistMap = { ...get().checklistMap };
        delete currentChecklistMap[scenarioId];
        const nextScenarios = generateAllScenarios(get().input, currentChecklistMap);
        set({
          checklistMap: currentChecklistMap,
          scenarios: nextScenarios,
        });
      },

      setSelectedScenarioId: (id) => set({ selectedScenarioId: id }),
      setActiveChecklistScenarioId: (id) => set({ activeChecklistScenarioId: id }),
      setIsReceiptModalOpen: (open) => set({ isReceiptModalOpen: open }),
      setIsPrintModalOpen: (open) => set({ isPrintModalOpen: open }),
    }),
    {
      name: 'uiseong-ptt-calculator-store',
      partialize: (state) => ({
        input: state.input,
        checklistMap: state.checklistMap,
        selectedScenarioId: state.selectedScenarioId,
      }),
    }
  )
);
