import React from 'react';
import { X, Printer } from 'lucide-react';
import { useCalculatorStore } from '../../stores/useCalculatorStore';
import { UISEONG_EUP_MYEON_LIST } from '../../types/calculator';
import { formatWon, formatNumberWithComma, formatArea } from '../../utils/formatters';

export const PrintReportModal: React.FC = () => {
  const {
    isPrintModalOpen,
    setIsPrintModalOpen,
    scenarios,
    selectedScenarioId,
    input,
  } = useCalculatorStore();

  if (!isPrintModalOpen) return null;

  const currentScenario = scenarios.find(s => s.scenarioId === selectedScenarioId) || scenarios[0];
  const eupMyeonName = UISEONG_EUP_MYEON_LIST.find(e => e.code === input.eupMyeon)?.name || '의성군';

  const handlePrint = () => {
    window.print();
  };

  const todayStr = new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  return (
    <div className="print-modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static print:inset-auto print:block print:overflow-visible">
      {/* Modal Dialog Window */}
      <div className="print-modal-container bg-brown-900 border border-brown-800 rounded-2xl sm:rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl text-stone-100 overflow-hidden print:border-none print:shadow-none print:max-w-none print:max-h-none print:w-full print:bg-white print:text-black print:rounded-none print:block print:overflow-visible">
        
        {/* Header Bar (Hidden on print) */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-brown-800 no-print shrink-0 bg-brown-900 gap-2">
          <div className="flex items-center gap-2 min-w-0 pr-1">
            <span className="p-1 sm:p-1.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
              <Printer className="w-4 h-4 sm:w-5 sm:h-5" />
            </span>
            <div className="min-w-0">
              <h3 className="font-bold text-xs sm:text-base text-white whitespace-nowrap truncate">
                부동산 등기비용 및 취등록세 상담 견적서
              </h3>
              <p className="text-[10px] sm:text-[11px] text-stone-400 hidden sm:block">
                화면 요소 없이 깔끔한 공식 A4 견적서 단일 페이지 규격으로 인쇄 및 PDF 저장됩니다.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg shadow-amber-600/25 whitespace-nowrap transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span>A4 인쇄 / PDF</span>
            </button>
            <button
              onClick={() => setIsPrintModalOpen(false)}
              className="p-1.5 sm:p-2 text-stone-400 hover:text-white hover:bg-brown-800 rounded-xl transition cursor-pointer"
              title="닫기"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Paper Sheet Preview Container */}
        <div className="flex-1 overflow-auto p-2 sm:p-6 bg-brown-950/90 print:p-0 print:bg-white print:overflow-visible print:block">
          <div className="sm:hidden text-center text-[10.5px] text-amber-300/90 mb-2 no-print bg-amber-500/10 py-1 px-2.5 rounded-lg border border-amber-500/20">
            💡 좌우로 스크롤하여 정식 A4 견적서 규격 레이아웃을 확인하세요
          </div>
          
          {/* Formal Legal Document Sheet (A4 Fit, 1-Page Layout) */}
          <div className="print-sheet bg-white text-stone-900 shadow-2xl min-w-[520px] md:min-w-0 max-w-3xl mx-auto border border-stone-300 p-5 sm:p-8 print:border-none print:shadow-none print:p-0 print:m-0 print:max-w-none print:w-full print:min-w-0 font-serif select-text leading-tight text-[11px]">
            
            {/* 1. Header Metadata Bar */}
            <div className="border-b-2 border-stone-800 pb-2 mb-4 flex justify-between items-center text-[10px] text-stone-600 font-sans">
              <div>
                <span className="font-bold text-stone-800">문서번호:</span> 제2026-등기-{input.eupMyeon}-{Date.now().toString().slice(-4)}호
              </div>
              <div>
                <span className="font-bold text-stone-800">발행일자:</span> {todayStr}
              </div>
            </div>

            {/* 2. Official Document Title */}
            <div className="text-center my-3 sm:my-4 space-y-1">
              <h1 className="text-lg sm:text-2xl font-bold tracking-normal sm:tracking-widest text-stone-900 border-b border-stone-400 pb-1.5 sm:pb-2 inline-block px-3 sm:px-8">
                부동산 등기비용 및 취등록세 상담 견적서
              </h1>
              <p className="text-[10px] text-stone-500 tracking-normal pt-1">
                경상북도 의성군 관할 부동산 취등록세 및 법정 공적 부대비용 산출 기준
              </p>
            </div>

            {/* 3. Property & Client Summary Table */}
            <div className="my-4 overflow-x-auto">
              <h3 className="font-bold text-xs text-stone-900 mb-1.5 flex items-center gap-1 border-l-2 border-stone-800 pl-1.5">
                1. 대상 부동산 및 거래 기본사항
              </h3>
              <table className="w-full border-collapse border border-stone-400 text-center text-[10.5px]">
                <tbody>
                  <tr className="bg-stone-100">
                    <th className="border border-stone-400 py-1.5 px-2 font-semibold w-24 whitespace-nowrap">소재지</th>
                    <td className="border border-stone-400 py-1.5 px-2 text-left" colSpan={3}>
                      경상북도 의성군 {eupMyeonName} 일원
                    </td>
                  </tr>
                  <tr>
                    <th className="border border-stone-400 py-1.5 px-2 font-semibold bg-stone-100 whitespace-nowrap">물건 유형</th>
                    <td className="border border-stone-400 py-1.5 px-2 text-left">
                      {input.propertyType === 'HOUSING' ? '주택 (단독/공동)' : input.propertyType === 'AGRICULTURAL_LAND' ? '농지 (전·답·과)' : '일반 부동산'}
                    </td>
                    <th className="border border-stone-400 py-1.5 px-2 font-semibold bg-stone-100 whitespace-nowrap">전용면적</th>
                    <td className="border border-stone-400 py-1.5 px-2 text-left">
                      {formatArea(input.exclusiveAreaSqm)}
                    </td>
                  </tr>
                  <tr>
                    <th className="border border-stone-400 py-1.5 px-2 font-semibold bg-stone-100 whitespace-nowrap">실제 거래가액</th>
                    <td className="border border-stone-400 py-1.5 px-2 text-left font-mono font-bold">
                      {formatWon(input.purchasePrice)}
                    </td>
                    <th className="border border-stone-400 py-1.5 px-2 font-semibold bg-stone-100 whitespace-nowrap">시가표준액</th>
                    <td className="border border-stone-400 py-1.5 px-2 text-left font-mono">
                      {formatWon(input.officialStandardPrice)}
                    </td>
                  </tr>
                  <tr>
                    <th className="border border-stone-400 py-1.5 px-2 font-semibold bg-stone-100 whitespace-nowrap">취득 원인</th>
                    <td className="border border-stone-400 py-1.5 px-2 text-left">
                      {input.acquisitionCause === 'SALE' ? '유상 매매' : input.acquisitionCause === 'INHERITANCE' ? '상속' : '기타 취득'}
                    </td>
                    <th className="border border-stone-400 py-1.5 px-2 font-semibold bg-stone-100 whitespace-nowrap">추천 시나리오</th>
                    <td className="border border-stone-400 py-1.5 px-2 text-left font-bold text-amber-800">
                      {currentScenario.scenarioName}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 4. Tax & Cost Breakdown Table */}
            <div className="my-4 overflow-x-auto">
              <h3 className="font-bold text-xs text-stone-900 mb-1.5 flex items-center gap-1 border-l-2 border-stone-800 pl-1.5">
                2. 세목별 세액 및 공적 부대비용 산출 명세
              </h3>
              <table className="w-full border-collapse border border-stone-400 text-[10.5px]">
                <thead>
                  <tr className="bg-stone-100 text-center font-semibold">
                    <th className="border border-stone-400 py-1.5 px-2 w-12 whitespace-nowrap">구분</th>
                    <th className="border border-stone-400 py-1.5 px-2">세목 및 비용 항목</th>
                    <th className="border border-stone-400 py-1.5 px-2 w-28 whitespace-nowrap">산출 기준 및 요율</th>
                    <th className="border border-stone-400 py-1.5 px-2 w-28 whitespace-nowrap">납부 예상 금액</th>
                  </tr>
                </thead>
                <tbody>
                  {/* 지방세 섹션 */}
                  <tr>
                    <td className="border border-stone-400 py-1.5 px-2 text-center font-semibold bg-stone-50" rowSpan={3}>
                      지방세<br />(도세)
                    </td>
                    <td className="border border-stone-400 py-1.5 px-2">
                      <div className="font-semibold">취득세 (본세)</div>
                      <div className="text-[9.5px] text-stone-500">
                        {currentScenario.taxBreakdown.exemptTaxAmount > 0 
                          ? `산출세액 ${formatNumberWithComma(currentScenario.taxBreakdown.calculatedTaxAmount)} - 감면공제 ${formatNumberWithComma(currentScenario.taxBreakdown.exemptTaxAmount)}`
                          : '기본 산출세액 적용'}
                      </div>
                    </td>
                    <td className="border border-stone-400 py-1.5 px-2 text-center">
                      세율 {currentScenario.taxBreakdown.standardTaxRate}%
                    </td>
                    <td className="border border-stone-400 py-1.5 px-2 text-right font-mono font-bold">
                      {formatNumberWithComma(currentScenario.taxBreakdown.finalBaseTax)}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-stone-400 py-1.5 px-2">
                      <div className="font-semibold">지방교육세</div>
                      <div className="text-[9.5px] text-stone-500">본세 감면 연동 계산</div>
                    </td>
                    <td className="border border-stone-400 py-1.5 px-2 text-center">
                      본세액의 10%
                    </td>
                    <td className="border border-stone-400 py-1.5 px-2 text-right font-mono">
                      {formatNumberWithComma(currentScenario.taxBreakdown.localEducationTax)}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-stone-400 py-1.5 px-2">
                      <div className="font-semibold">농어촌특별세</div>
                      <div className="text-[9.5px] text-stone-500">
                        {currentScenario.taxBreakdown.ruralSpecialTax === 0 ? '국민주택규모 이하(의성군 특례) 비과세' : '과세'}
                      </div>
                    </td>
                    <td className="border border-stone-400 py-1.5 px-2 text-center">
                      {currentScenario.taxBreakdown.ruralSpecialTax === 0 ? '0% (비과세)' : '0.2%'}
                    </td>
                    <td className="border border-stone-400 py-1.5 px-2 text-right font-mono">
                      {formatNumberWithComma(currentScenario.taxBreakdown.ruralSpecialTax)}
                    </td>
                  </tr>
                  <tr className="bg-stone-50 font-semibold">
                    <td className="border border-stone-400 py-1.5 px-2 text-center" colSpan={2}>
                      지방세 납부 소계
                    </td>
                    <td className="border border-stone-400 py-1.5 px-2 text-center text-stone-500">-</td>
                    <td className="border border-stone-400 py-1.5 px-2 text-right font-mono text-stone-900">
                      {formatNumberWithComma(currentScenario.taxBreakdown.totalLocalTax)}
                    </td>
                  </tr>

                  {/* 공적비용 섹션 */}
                  <tr>
                    <td className="border border-stone-400 py-1.5 px-2 text-center font-semibold bg-stone-50" rowSpan={3}>
                      등기<br />공적비용
                    </td>
                    <td className="border border-stone-400 py-1.5 px-2">
                      <div className="font-semibold">국민주택채권 즉시할인 본인부담금</div>
                      <div className="text-[9.5px] text-stone-500">
                        채권액 {formatWon(currentScenario.registrationExpenses.bondRequiredAmount)} (할인율 {input.bondDiscountRate}%)
                      </div>
                    </td>
                    <td className="border border-stone-400 py-1.5 px-2 text-center">
                      매입율 {currentScenario.registrationExpenses.bondRate}%
                    </td>
                    <td className="border border-stone-400 py-1.5 px-2 text-right font-mono">
                      {formatNumberWithComma(currentScenario.registrationExpenses.bondPaymentAmount)}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-stone-400 py-1.5 px-2">
                      <div className="font-semibold">대한민국 정부수입인지</div>
                      <div className="text-[9.5px] text-stone-500">인지세법 제3조 매매계약서</div>
                    </td>
                    <td className="border border-stone-400 py-1.5 px-2 text-center">
                      구간별 정액
                    </td>
                    <td className="border border-stone-400 py-1.5 px-2 text-right font-mono">
                      {formatNumberWithComma(currentScenario.registrationExpenses.stampTax)}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-stone-400 py-1.5 px-2">
                      <div className="font-semibold">대법원 등기신청수수료</div>
                      <div className="text-[9.5px] text-stone-500">인터넷등기소 e-Form 신청</div>
                    </td>
                    <td className="border border-stone-400 py-1.5 px-2 text-center">
                      법정 정액
                    </td>
                    <td className="border border-stone-400 py-1.5 px-2 text-right font-mono">
                      {formatNumberWithComma(currentScenario.registrationExpenses.registrationFee)}
                    </td>
                  </tr>
                  <tr className="bg-stone-50 font-semibold">
                    <td className="border border-stone-400 py-1.5 px-2 text-center" colSpan={2}>
                      등기 공적 부대비용 소계
                    </td>
                    <td className="border border-stone-400 py-1.5 px-2 text-center text-stone-500">-</td>
                    <td className="border border-stone-400 py-1.5 px-2 text-right font-mono text-stone-900">
                      {formatNumberWithComma(currentScenario.registrationExpenses.totalExpenses)}
                    </td>
                  </tr>

                  {/* Grand Total Row */}
                  <tr className="bg-stone-200 font-bold text-xs">
                    <td className="border border-stone-400 py-2.5 px-2 text-center" colSpan={2}>
                      총 등기 소요 예상 비용 (지방세 + 공적비용)
                    </td>
                    <td className="border border-stone-400 py-2.5 px-2 text-center text-amber-900">
                      {currentScenario.taxSavingsAmount > 0 && `(절세액: ${formatWon(currentScenario.taxSavingsAmount)})`}
                    </td>
                    <td className="border border-stone-400 py-2.5 px-2 text-right font-mono text-sm text-stone-900">
                      {formatWon(currentScenario.grandTotal)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 5. Post Management & Notice */}
            <div className="my-3 p-3 bg-stone-50 border border-stone-300 rounded text-[10px] space-y-1">
              <div className="font-bold text-stone-800">
                ■ 사후관리 준수 의무 및 가산세 추징 주의사항
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-stone-600 pl-1">
                {currentScenario.postManagementNotice.map((notice, idx) => (
                  <li key={idx}>{notice}</li>
                ))}
                <li>본 견적서는 법무사·세무사 보수를 제외한 순수 법정 공적 비용 산출 내역입니다.</li>
              </ul>
            </div>

            {/* 6. Official Stamp & Signature Block */}
            <div className="mt-8 pt-4 border-t border-stone-400 flex justify-between items-end text-[10.5px]">
              <div>
                <p className="text-stone-500 text-[9.5px]">
                  * 본 견적서는 지방세법 및 지방세특례제한법에 근거하여 작성되었습니다.
                </p>
              </div>
              <div className="text-right space-y-1">
                <div>상담 기관: <strong>경북 의성군 관할 세무·법무 상담센터</strong></div>
                <div className="flex items-center justify-end gap-3 pt-2">
                  <span>담당 상담자: ____________________</span>
                  <span className="border border-stone-400 px-3 py-1 text-stone-400 text-[10px] rounded">
                    (인)
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
