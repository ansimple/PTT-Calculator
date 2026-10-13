import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  Share2, 
  Check, 
  Receipt, 
  Building2, 
  Coins, 
  Scale, 
  AlertCircle 
} from 'lucide-react';
import { useCalculatorStore } from '../../stores/useCalculatorStore';
import { UISEONG_EUP_MYEON_LIST } from '../../types/calculator';
import { formatWon, formatNumberWithComma, formatArea } from '../../utils/formatters';

export const ReceiptModal: React.FC = () => {
  const {
    isReceiptModalOpen,
    setIsReceiptModalOpen,
    scenarios,
    selectedScenarioId,
    input,
    setIsPrintModalOpen,
  } = useCalculatorStore();

  const [copied, setCopied] = useState(false);

  if (!isReceiptModalOpen) return null;

  const currentScenario = scenarios.find(s => s.scenarioId === selectedScenarioId) || scenarios[0];
  const eupMyeonName = UISEONG_EUP_MYEON_LIST.find(e => e.code === input.eupMyeon)?.name || '의성군';

  // 카카오톡/문자 전송용 요약 텍스트 생성
  const generateShareText = () => {
    return `[경북 의성군 부동산 등기비용 상담 안내]
■ 대상 물건 정보
 - 물건 소재지: 경북 의성군 ${eupMyeonName}
 - 물건 구분: ${input.propertyType === 'HOUSING' ? '주택' : input.propertyType === 'AGRICULTURAL_LAND' ? '농지' : '부동산'} (${formatArea(input.exclusiveAreaSqm)})
 - 취득 가액: ${formatWon(input.purchasePrice)} (시가표준액: ${formatWon(input.officialStandardPrice)})

■ 세무 검토 및 감면 적용 결과
▶ 적용 시나리오: ${currentScenario.scenarioName}
 - 본세(취득세): ${formatNumberWithComma(currentScenario.taxBreakdown.finalBaseTax)} (감면 혜택: -${formatNumberWithComma(currentScenario.taxBreakdown.exemptTaxAmount)})
 - 지방교육세: ${formatNumberWithComma(currentScenario.taxBreakdown.localEducationTax)}
 - 농어촌특별세: ${formatNumberWithComma(currentScenario.taxBreakdown.ruralSpecialTax)}
 🔹 지방세 납부 합계: ${formatWon(currentScenario.taxBreakdown.totalLocalTax)}

■ 등기 동반 공적 부대비용
 - 국민주택채권 할인부담금: ${formatNumberWithComma(currentScenario.registrationExpenses.bondPaymentAmount)} (채권액 ${formatWon(currentScenario.registrationExpenses.bondRequiredAmount)})
 - 대한민국 정부수입인지: ${formatNumberWithComma(currentScenario.registrationExpenses.stampTax)}
 - 대법원 등기신청수수료: ${formatNumberWithComma(currentScenario.registrationExpenses.registrationFee)}
 🔹 등기 공적비용 합계: ${formatWon(currentScenario.registrationExpenses.totalExpenses)}

🏆 총 등기 소요 예상 비용: ${formatWon(currentScenario.grandTotal)}
💡 비감면 일반과세 대비 총 절세액: ${formatWon(currentScenario.taxSavingsAmount)}

■ 사후관리 필수 유의사항 (추징 방지)
${currentScenario.postManagementNotice.map(n => ` - ${n}`).join('\n')}`;
  };

  const handleCopyShareText = async () => {
    try {
      await navigator.clipboard.writeText(generateShareText());
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error(err);
      alert('클립보드 복사 중 오류가 발생했습니다.');
    }
  };

  const handleOpenPrint = () => {
    setIsReceiptModalOpen(false);
    setIsPrintModalOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl bg-brown-900 border border-brown-700 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-stone-100">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-brown-800 flex items-center justify-between shrink-0 bg-brown-900">
          <div className="flex items-center gap-2 min-w-0 pr-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Receipt className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-white truncate">
                등기 비용 상세 산출 명세서
              </h3>
              <p className="text-[11px] text-stone-400 truncate">
                {eupMyeonName} / {currentScenario.scenarioName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleCopyShareText}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-brown-800 hover:bg-brown-750 text-stone-200 border border-brown-700'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? '복사 완료' : '상담 텍스트 복사'}</span>
            </button>

            <button
              onClick={handleOpenPrint}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>A4 인쇄</span>
            </button>

            <button
              onClick={() => setIsReceiptModalOpen(false)}
              className="p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-brown-800 transition ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Receipt Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-brown-950/80 font-sans">
          
          {/* Target Property Overview */}
          <div className="p-4 rounded-2xl bg-brown-900/90 border border-brown-800 space-y-2 text-xs">
            <div className="font-bold text-white flex items-center justify-between border-b border-brown-800/80 pb-2">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-amber-400" />
                <span>대상 물건 개요</span>
              </span>
              <span className="text-amber-300 font-mono">경북 의성군 {eupMyeonName}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1 text-[11px] text-stone-300">
              <div>
                <span className="text-stone-400 block">취득가액 (과표):</span>
                <span className="font-mono font-bold text-stone-100">{formatWon(input.purchasePrice)}</span>
              </div>
              <div>
                <span className="text-stone-400 block">시가표준액 (공시가):</span>
                <span className="font-mono font-bold text-stone-100">{formatWon(input.officialStandardPrice)}</span>
              </div>
              <div>
                <span className="text-stone-400 block">주거전용면적:</span>
                <span className="font-mono font-bold text-stone-100">{formatArea(input.exclusiveAreaSqm)}</span>
              </div>
            </div>
          </div>

          {/* Section A: 지방세 명세 */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
              <span>[A] 지방세 납부 세액 (취득세 본세 및 부가세)</span>
            </div>

            <div className="rounded-2xl bg-brown-900 border border-brown-800 overflow-hidden text-xs">
              <div className="p-3.5 border-b border-brown-800/80 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-stone-200">
                    1. 취득세 본세 (세율 {currentScenario.taxBreakdown.standardTaxRate}%)
                  </span>
                  <span className="font-mono font-bold text-stone-100">
                    {formatNumberWithComma(currentScenario.taxBreakdown.finalBaseTax)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px] text-stone-400 pl-3">
                  <span>- 산출세액:</span>
                  <span className="font-mono">{formatNumberWithComma(currentScenario.taxBreakdown.calculatedTaxAmount)}</span>
                </div>
                {currentScenario.taxBreakdown.exemptTaxAmount > 0 && (
                  <div className="flex justify-between items-center text-[11px] text-emerald-400 pl-3">
                    <span>- 감면공제 ({currentScenario.scenarioName}):</span>
                    <span className="font-mono">-{formatNumberWithComma(currentScenario.taxBreakdown.exemptTaxAmount)}</span>
                  </div>
                )}
              </div>

              <div className="p-3.5 border-b border-brown-800/80 flex justify-between items-center">
                <div>
                  <span className="font-semibold text-stone-200">2. 지방교육세</span>
                  <span className="text-[10px] text-stone-400 block pl-3">취득세 본세 감면 연동 계산</span>
                </div>
                <span className="font-mono font-bold text-stone-100">
                  {formatNumberWithComma(currentScenario.taxBreakdown.localEducationTax)}
                </span>
              </div>

              <div className="p-3.5 border-b border-brown-800/80 flex justify-between items-center">
                <div>
                  <span className="font-semibold text-stone-200">3. 농어촌특별세</span>
                  <span className="text-[10px] text-stone-400 block pl-3">
                    {currentScenario.taxBreakdown.ruralSpecialTax === 0
                      ? '국민주택규모 이하(의성군 읍·면 특례) 전액 비과세'
                      : '국민주택규모 초과 과세'}
                  </span>
                </div>
                <span className="font-mono font-bold text-stone-100">
                  {formatNumberWithComma(currentScenario.taxBreakdown.ruralSpecialTax)}
                </span>
              </div>

              <div className="p-3.5 bg-brown-950/60 flex justify-between items-center font-bold text-stone-200">
                <span>지방세 납부 합계</span>
                <span className="font-mono text-amber-300 text-sm">
                  {formatNumberWithComma(currentScenario.taxBreakdown.totalLocalTax)}
                </span>
              </div>
            </div>
          </div>

          {/* Section B: 등기 공적비용 명세 */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5" />
              <span>[B] 등기 동반 법정 공적 부대비용</span>
            </div>

            <div className="rounded-2xl bg-brown-900 border border-brown-800 overflow-hidden text-xs">
              <div className="p-3.5 border-b border-brown-800/80 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-stone-200">4. 제1종 국민주택채권 매입할인</span>
                  <span className="font-mono font-bold text-stone-100">
                    {formatNumberWithComma(currentScenario.registrationExpenses.bondPaymentAmount)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px] text-stone-400 pl-3">
                  <span>- 시가표준액 기준 채권발행액 (매입률 {currentScenario.registrationExpenses.bondRate}%):</span>
                  <span className="font-mono">{formatNumberWithComma(currentScenario.registrationExpenses.bondRequiredAmount)}</span>
                </div>
                <div className="flex justify-between items-center text-[11px] text-stone-400 pl-3">
                  <span>- 일자별 즉시할인율 적용 본인부담금:</span>
                  <span className="font-mono">{input.bondDiscountRate}%</span>
                </div>
              </div>

              <div className="p-3.5 border-b border-brown-800/80 flex justify-between items-center">
                <div>
                  <span className="font-semibold text-stone-200">5. 대한민국 정부수입인지세</span>
                  <span className="text-[10px] text-stone-400 block pl-3">인지세법 제3조 부동산 소유권 이전</span>
                </div>
                <span className="font-mono font-bold text-stone-100">
                  {formatNumberWithComma(currentScenario.registrationExpenses.stampTax)}
                </span>
              </div>

              <div className="p-3.5 border-b border-brown-800/80 flex justify-between items-center">
                <div>
                  <span className="font-semibold text-stone-200">6. 대법원 등기신청수수료</span>
                  <span className="text-[10px] text-stone-400 block pl-3">
                    {input.registrationMethod === 'E_FORM' ? 'e-Form 전자표준양식' : input.registrationMethod === 'ELECTRONIC' ? '전자신청' : '서면방문'}
                  </span>
                </div>
                <span className="font-mono font-bold text-stone-100">
                  {formatNumberWithComma(currentScenario.registrationExpenses.registrationFee)}
                </span>
              </div>

              <div className="p-3.5 bg-brown-950/60 flex justify-between items-center font-bold text-stone-200">
                <span>공적 부대비용 합계</span>
                <span className="font-mono text-amber-300 text-sm">
                  {formatNumberWithComma(currentScenario.registrationExpenses.totalExpenses)}
                </span>
              </div>
            </div>
          </div>

          {/* Grand Total Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-bold text-stone-200">
                총 등기 소요 예상 비용 [A + B]
              </span>
              <span className="text-xl sm:text-2xl font-bold text-amber-400 font-mono">
                {formatWon(currentScenario.grandTotal)}
              </span>
            </div>

            {currentScenario.taxSavingsAmount > 0 && (
              <div className="pt-2 border-t border-amber-500/20 flex items-center justify-between text-xs font-semibold text-emerald-400">
                <span className="flex items-center gap-1">
                  <Scale className="w-4 h-4" />
                  <span>일반 과세(비감면) 대비 절세 혜택</span>
                </span>
                <span className="font-mono text-base font-bold">
                  +{formatWon(currentScenario.taxSavingsAmount)}
                </span>
              </div>
            )}
          </div>

          {/* Post Management Warnings */}
          <div className="p-4 rounded-2xl bg-brown-900 border border-brown-800 space-y-2 text-xs">
            <div className="font-bold text-amber-300 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" />
              <span>상담 시 고객 안내 필수사항 (사후관리 및 추징)</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-stone-400 leading-relaxed">
              {currentScenario.postManagementNotice.map((notice, idx) => (
                <li key={idx}>{notice}</li>
              ))}
            </ul>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-brown-800 bg-brown-900 flex items-center justify-end gap-2 shrink-0">
          <button
            onClick={() => setIsReceiptModalOpen(false)}
            className="px-5 py-2 rounded-xl text-xs font-semibold text-stone-300 hover:bg-brown-800 transition"
          >
            닫기
          </button>
        </div>

      </div>
    </div>
  );
};
