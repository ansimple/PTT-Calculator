import { useState } from 'react';
import { 
  Building2, 
  Layers, 
  Receipt, 
  ChevronRight
} from 'lucide-react';
import { Header } from './components/common/Header';
import { PropertyForm } from './components/input/PropertyForm';
import { ScenarioGrid } from './components/dashboard/ScenarioGrid';
import { ChecklistDrawer } from './components/checklist/ChecklistDrawer';
import { ReceiptModal } from './components/report/ReceiptModal';
import { PrintReportModal } from './components/report/PrintReportModal';
import { useCalculatorStore } from './stores/useCalculatorStore';

export default function App() {
  const [mobileTab, setMobileTab] = useState<'input' | 'scenarios'>('input');
  const { scenarios, selectedScenarioId, setIsReceiptModalOpen } = useCalculatorStore();

  const selectedScenario = scenarios.find(s => s.scenarioId === selectedScenarioId) || scenarios[0];

  return (
    <div className="flex flex-col min-h-screen bg-brown-950 text-stone-100 overflow-x-hidden font-sans print:h-auto print:overflow-visible print:bg-white print:text-black">
      {/* Top Header */}
      <Header />

      {/* Mobile Tab Switcher (Visible only on screens < lg) */}
      <div className="lg:hidden flex items-center bg-brown-900 border-b border-brown-800 p-1.5 shrink-0 no-print">
        <button
          onClick={() => setMobileTab('input')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            mobileTab === 'input'
              ? 'bg-amber-600 text-white shadow-md'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>1. 부동산 정보 입력</span>
        </button>

        <button
          onClick={() => setMobileTab('scenarios')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            mobileTab === 'scenarios'
              ? 'bg-amber-600 text-white shadow-md'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>2. 감면 비교 ({scenarios.length})</span>
        </button>
      </div>

      {/* Main Workspace: Responsive 2-Column on Desktop (lg+), Tabbed on Mobile */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 lg:p-6 no-print">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">
          
          {/* Left Column: Property Input Form (Visible on desktop or when mobileTab === 'input') */}
          <div className={`lg:col-span-5 lg:block space-y-4 ${mobileTab === 'input' ? 'block' : 'hidden lg:block'}`}>
            <PropertyForm />

            {/* Mobile Next Step Button */}
            <div className="lg:hidden pt-2">
              <button
                type="button"
                onClick={() => setMobileTab('scenarios')}
                className="w-full py-3.5 px-4 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm shadow-xl shadow-amber-600/30 flex items-center justify-center gap-2 transition"
              >
                <span>감면 비교 및 견적 도출 ({scenarios.length}개)</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Column: Scenario Comparison Grid & Quick Summary */}
          <div className={`lg:col-span-7 lg:block space-y-5 ${mobileTab === 'scenarios' ? 'block' : 'hidden lg:block'}`}>
            <ScenarioGrid />
          </div>

        </div>
      </main>

      {/* Modals & Drawers */}
      <ChecklistDrawer />
      <ReceiptModal />
      <PrintReportModal />

      {/* Mobile Sticky Bottom Floating Action (Visible on mobile when in scenarios view) */}
      <div className="lg:hidden fixed bottom-3 left-3 right-3 z-30 no-print">
        <button
          onClick={() => setIsReceiptModalOpen(true)}
          className="w-full py-3 px-4 rounded-2xl bg-brown-900/95 border border-amber-500/50 shadow-2xl backdrop-blur-md flex items-center justify-between text-xs text-white"
        >
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-amber-500/20 text-amber-400">
              <Receipt className="w-4 h-4" />
            </span>
            <span className="font-semibold truncate">
              {selectedScenario.scenarioName}
            </span>
          </div>
          <div className="flex items-center gap-1 font-mono font-bold text-amber-400 text-sm">
            <span>{selectedScenario.grandTotal.toLocaleString()}원</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </button>
      </div>
    </div>
  );
}
