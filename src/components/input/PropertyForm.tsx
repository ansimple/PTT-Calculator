import React from 'react';
import { 
  Building2, 
  MapPin, 
  Home, 
  FileText, 
  Maximize2, 
  Users2, 
  Coins, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { useCalculatorStore } from '../../stores/useCalculatorStore';
import { UISEONG_EUP_MYEON_LIST, PropertyType, AcquisitionCause, RegistrationMethod } from '../../types/calculator';
import { NumberWonInput } from '../common/NumberWonInput';
import { formatArea } from '../../utils/formatters';

export const PropertyForm: React.FC = () => {
  const { input, setInput, resetInput } = useCalculatorStore();

  const isHousing = input.propertyType === 'HOUSING';
  const isSale = input.acquisitionCause === 'SALE';
  const isUiseongEup = input.eupMyeon === 'UISEONG_EUP';

  return (
    <div className="bg-brown-900/90 border border-brown-800 rounded-2xl p-4 sm:p-5 space-y-5 shadow-xl">
      {/* Form Title & Reset */}
      <div className="flex items-center justify-between border-b border-brown-800/80 pb-3 gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Building2 className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <h2 className="text-sm font-bold text-white whitespace-nowrap">
                부동산 기본 정보 입력
              </h2>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-brown-800 text-stone-300 font-normal whitespace-nowrap">
                1회 입력 다중 산출
              </span>
            </div>
            <p className="text-[11px] text-stone-400 truncate">
              경북 의성군 관할 18개 읍·면 및 물건 특성 설정
            </p>
          </div>
        </div>

        <button
          onClick={resetInput}
          title="기본값으로 초기화"
          className="flex items-center gap-1 text-[11px] text-stone-400 hover:text-stone-200 px-2.5 py-1.5 rounded-lg hover:bg-brown-800 whitespace-nowrap shrink-0 transition"
        >
          <RotateCcw className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden xs:inline">초기화</span>
        </button>
      </div>

      {/* 1. 소재지 읍·면 선택 */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-stone-300 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>관할 읍·면 (경북 의성군 18개 읍·면)</span>
        </label>
        
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
          {UISEONG_EUP_MYEON_LIST.map((item) => {
            const isSelected = input.eupMyeon === item.code;
            return (
              <button
                key={item.code}
                type="button"
                onClick={() => setInput({ eupMyeon: item.code })}
                className={`py-1.5 px-1 rounded-xl text-xs font-medium transition-all text-center whitespace-nowrap truncate ${
                  isSelected
                    ? 'bg-amber-600 text-white font-bold shadow-md shadow-amber-600/30 ring-1 ring-amber-400'
                    : 'bg-brown-950 text-stone-300 hover:bg-brown-800/80 border border-brown-800'
                }`}
              >
                {item.name}
              </button>
            );
          })}
        </div>

        {/* 의성읍 도시지역 토글 옵션 */}
        {isUiseongEup ? (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-200 space-y-1.5 mt-2 animate-fadeIn">
            <label className="flex items-start sm:items-center gap-2 cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={input.isUiseongUrbanArea}
                onChange={(e) => setInput({ isUiseongUrbanArea: e.target.checked })}
                className="w-4 h-4 mt-0.5 sm:mt-0 rounded text-amber-600 bg-brown-900 border-brown-700 focus:ring-amber-500 shrink-0"
              />
              <span className="leading-snug">국토계획법상 도시지역(주거·상업·공업·녹지지역) 주택</span>
            </label>
            <p className="text-[11px] text-amber-300/80 leading-relaxed pl-6">
              {input.isUiseongUrbanArea
                ? '도시지역 판정: 국민주택규모 전용 85㎡ 초과 시 농특세 과세'
                : '비도시지역 판정: 읍·면 특례로 전용 100㎡ 이하까지 농특세 전액 비과세(0원)'}
            </p>
          </div>
        ) : (
          <div className="text-[11px] text-emerald-400/90 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span className="leading-snug">면 지역 농특세 특례: 전용 <span className="whitespace-nowrap font-medium">100㎡</span> 이하 전액 비과세(0원)</span>
          </div>
        )}
      </div>

      {/* 2. 물건 유형 선택 */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-stone-300 flex items-center gap-1.5">
          <Home className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>물건 유형</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
          {[
            { type: 'HOUSING', label: '주택 (아파트/단독)' },
            { type: 'AGRICULTURAL_LAND', label: '농지 (전·답·과)' },
            { type: 'GENERAL_LAND', label: '일반토지 (임야/대)' },
            { type: 'COMMERCIAL', label: '상가 / 건물' },
          ].map((item) => {
            const isSelected = input.propertyType === item.type;
            return (
              <button
                key={item.type}
                type="button"
                onClick={() => setInput({ propertyType: item.type as PropertyType })}
                className={`py-2 px-1.5 xs:px-2 rounded-xl text-[11px] xs:text-xs font-medium transition text-center whitespace-nowrap truncate ${
                  isSelected
                    ? 'bg-amber-600 text-white font-bold shadow-md shadow-amber-600/30'
                    : 'bg-brown-950 text-stone-300 hover:bg-brown-850 border border-brown-800'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. 취득 원인 선택 */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-stone-300 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>취득 원인</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5">
          {[
            { cause: 'SALE', label: '매매 (유상)' },
            { cause: 'INHERITANCE', label: '상속' },
            { cause: 'GIFT', label: '증여' },
            { cause: 'NEW_CONSTRUCTION', label: '신축' },
            { cause: 'DIVISION_SPECIAL', label: '공유물분할(0.3%)' },
            { cause: 'DIVORCE_DIVISION', label: '이혼재산(0.8%)' },
          ].map((item) => {
            const isSelected = input.acquisitionCause === item.cause;
            return (
              <button
                key={item.cause}
                type="button"
                onClick={() => setInput({ acquisitionCause: item.cause as AcquisitionCause })}
                className={`py-2 px-1.5 rounded-xl text-xs font-medium transition text-center whitespace-nowrap truncate ${
                  isSelected
                    ? 'bg-amber-600 text-white font-bold shadow-md shadow-amber-600/30'
                    : 'bg-brown-950 text-stone-300 hover:bg-brown-850 border border-brown-800'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. 가액 입력 (실거래가 & 시가표준액) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        <NumberWonInput
          label={isSale ? '실제 거래금액 (매매대금)' : '취득가액 (과세표준)'}
          value={input.purchasePrice}
          onChange={(val) => setInput({ purchasePrice: val })}
          helperText="취득세 본세 및 인지세 산정 기준"
          placeholder="250,000,000"
        />

        <NumberWonInput
          label="시가표준액 (공시가격)"
          value={input.officialStandardPrice}
          onChange={(val) => setInput({ officialStandardPrice: val })}
          helperText="국민주택채권 매입액 및 상속세 과표 기준"
          placeholder="180,000,000"
        />
      </div>

      {/* 5. 주택 전용 옵션: 전용면적 & 세대 주택수 */}
      {isHousing && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 p-3.5 rounded-xl bg-brown-950/70 border border-brown-800">
          {/* 전용면적 */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-stone-300 flex items-center gap-1">
                <Maximize2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>주거전용면적</span>
              </label>
              <span className="text-[11px] text-amber-300 font-mono whitespace-nowrap">
                {formatArea(input.exclusiveAreaSqm)}
              </span>
            </div>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="1"
                value={input.exclusiveAreaSqm}
                onChange={(e) => setInput({ exclusiveAreaSqm: parseFloat(e.target.value) || 0 })}
                className="w-full bg-brown-900 border border-brown-700/80 rounded-xl px-3.5 py-2.5 text-sm text-stone-100 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-stone-400 pointer-events-none">
                ㎡
              </span>
            </div>
            <p className="text-[10px] text-stone-400 leading-tight">
              * 국민주택규모: 면 지역 100㎡ 이하, 의성읍 도시 85㎡ 이하 비과세
            </p>
          </div>

          {/* 세대 주택 수 */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-300 flex items-center gap-1">
              <Users2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>세대 주택 수 (취득 후 기준)</span>
            </label>
            <select
              value={input.ownedHousingCount}
              onChange={(e) => setInput({ ownedHousingCount: parseInt(e.target.value, 10) })}
              className="w-full bg-brown-900 border border-brown-700/80 rounded-xl px-3.5 py-2.5 text-sm text-stone-100 font-sans focus:outline-none focus:ring-2 focus:ring-amber-500/50 cursor-pointer"
            >
              <option value={1}>1주택 (무주택자 매수 - 1~3% 일반세율)</option>
              <option value={2}>2주택 (비조정 1~3% 일반세율 적용)</option>
              <option value={3}>3주택 (중과세율 8% 적용)</option>
              <option value={4}>4주택 이상 (중과세율 12% 적용)</option>
            </select>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1">
              <label className="flex items-center gap-1.5 text-xs text-stone-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={input.isTemporaryTwoHomes}
                  onChange={(e) => setInput({ isTemporaryTwoHomes: e.target.checked })}
                  className="w-3.5 h-3.5 rounded text-amber-600 bg-brown-900 border-brown-700 shrink-0"
                />
                <span className="whitespace-nowrap">일시적 2주택 (3년 내 처분)</span>
              </label>

              <label className="flex items-center gap-1.5 text-xs text-stone-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={input.isCorporate}
                  onChange={(e) => setInput({ isCorporate: e.target.checked })}
                  className="w-3.5 h-3.5 rounded text-amber-600 bg-brown-900 border-brown-700 shrink-0"
                />
                <span className="whitespace-nowrap">매수자 법인(12%)</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* 6. 부대비용 옵션: 등기신청 방식 & 채권 할인율 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 pt-2 border-t border-brown-800/80 text-xs text-stone-300">
        <div className="space-y-1.5">
          <label className="font-semibold text-stone-300 flex items-center gap-1">
            <Coins className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>등기신청 방식 (수수료)</span>
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { method: 'E_FORM', label: 'e-Form (1.5만)' },
              { method: 'ELECTRONIC', label: '전자신청 (1만)' },
              { method: 'WRITTEN', label: '서면방문 (1.8만)' },
            ].map((m) => (
              <button
                key={m.method}
                type="button"
                onClick={() => setInput({ registrationMethod: m.method as RegistrationMethod })}
                className={`py-2 px-1 rounded-lg text-[11px] font-medium transition text-center whitespace-nowrap truncate ${
                  input.registrationMethod === m.method
                    ? 'bg-amber-600 text-white font-bold'
                    : 'bg-brown-950 text-stone-300 border border-brown-800'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="font-semibold text-stone-300">국민주택채권 할인율</label>
            <span className="font-mono text-amber-300 font-bold">{input.bondDiscountRate}%</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="25"
              step="0.1"
              value={input.bondDiscountRate}
              onChange={(e) => setInput({ bondDiscountRate: parseFloat(e.target.value) || 0 })}
              className="flex-1 accent-amber-500 cursor-pointer"
            />
            <input
              type="number"
              step="0.1"
              value={input.bondDiscountRate}
              onChange={(e) => setInput({ bondDiscountRate: parseFloat(e.target.value) || 0 })}
              className="w-16 bg-brown-900 border border-brown-700 rounded-lg px-2 py-1 text-center font-mono text-xs text-white"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
