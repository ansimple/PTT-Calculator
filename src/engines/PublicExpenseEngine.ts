import { PropertyCalculationInput, PropertyType, RegistrationMethod } from '../types/calculator';

export interface PublicExpenseResult {
  bondStandardPrice: number;
  bondRate: number;              // % 단위
  bondRequiredAmount: number;    // 채권 법정 매입금액 (5천원 미만 절사, 5천원 이상 1만원 올림)
  bondPaymentAmount: number;     // 채권 즉시할인매도 본인부담금
  stampTax: number;              // 정부수입인지세
  registrationFee: number;       // 등기신청수수료
  totalExpenses: number;         // 공적비용 합계
}

/**
 * 1. 국민주택채권 매입액 및 할인부담금 산출
 * - 주택도시기금법 시행령 [별표] 기준: 경북 의성군은 "기타지역" 군에 해당
 */
export function calculateHousingBond(
  officialStandardPrice: number,
  propertyType: PropertyType,
  discountRate: number
): { bondStandardPrice: number; bondRate: number; bondRequiredAmount: number; bondPaymentAmount: number } {
  let rate = 0; // % 단위

  if (propertyType === 'HOUSING') {
    if (officialStandardPrice < 20_000_000) rate = 0;
    else if (officialStandardPrice < 50_000_000) rate = 1.3;
    else if (officialStandardPrice < 100_000_000) rate = 1.4;
    else if (officialStandardPrice < 160_000_000) rate = 1.6;
    else if (officialStandardPrice < 260_000_000) rate = 1.8;
    else if (officialStandardPrice < 600_000_000) rate = 2.1;
    else rate = 2.6;
  } else if (propertyType === 'AGRICULTURAL_LAND') {
    // 농지 매입율 (기타지역: 5천만 미만 면제, 5천만 이상 1.0%)
    if (officialStandardPrice < 50_000_000) rate = 0;
    else rate = 1.0;
  } else {
    // 일반 토지 및 상가 (기타지역)
    if (officialStandardPrice < 50_000_000) rate = 0;
    else if (officialStandardPrice < 100_000_000) rate = 2.0;
    else rate = 2.5;
  }

  const rawAmount = officialStandardPrice * (rate / 100);

  // 법정 단수처리: 5,000원 미만 절사, 5,000원 이상 10,000원으로 올림
  const remainder = rawAmount % 10000;
  let bondRequiredAmount = 0;
  if (remainder >= 5000) {
    bondRequiredAmount = rawAmount - remainder + 10000;
  } else {
    bondRequiredAmount = rawAmount - remainder;
  }

  // 즉시 할인매도 본인부담금
  const bondPaymentAmount = Math.round(bondRequiredAmount * (discountRate / 100));

  return {
    bondStandardPrice: officialStandardPrice,
    bondRate: rate,
    bondRequiredAmount,
    bondPaymentAmount,
  };
}

/**
 * 2. 대한민국 정부수입인지세 산출 (인지세법 제3조)
 */
export function calculateStampTax(
  purchasePrice: number,
  propertyType: PropertyType
): number {
  if (purchasePrice <= 0) return 0;

  if (propertyType === 'HOUSING') {
    // 주택 매매계약서 인지세 (인지세법 제3조 제1항 제1호 단서)
    if (purchasePrice <= 100_000_000) {
      return 0; // 1억원 이하 주택 매매는 인지세 전액 비과세
    }
    if (purchasePrice <= 1_000_000_000) {
      return 150_000; // 1억원 초과 ~ 10억원 이하: 15만원
    }
    return 350_000; // 10억원 초과: 35만원
  }

  // 토지, 상가 등 일반 부동산 매매계약서
  if (purchasePrice <= 10_000_000) return 0;
  if (purchasePrice <= 30_000_000) return 20_000;
  if (purchasePrice <= 50_000_000) return 40_000;
  if (purchasePrice <= 100_000_000) return 70_000;
  if (purchasePrice <= 1_000_000_000) return 150_000;
  return 350_000;
}

/**
 * 3. 대법원 등기신청수수료 산출 (등기사항증명서 등 수수료규칙 제5조의3)
 */
export function calculateRegistrationFee(method: RegistrationMethod): number {
  switch (method) {
    case 'WRITTEN':
      return 18_000; // 서면방문 신청
    case 'E_FORM':
      return 15_000; // 인터넷등기소 e-Form 사전작성
    case 'ELECTRONIC':
      return 10_000; // 전자신청 (전자서명 인증)
    default:
      return 15_000;
  }
}

/**
 * 4. 공적 부대비용 전체 통합 산출
 */
export function calculatePublicExpenses(
  input: PropertyCalculationInput
): PublicExpenseResult {
  const bond = calculateHousingBond(
    input.officialStandardPrice,
    input.propertyType,
    input.bondDiscountRate
  );

  const stampTax = calculateStampTax(input.purchasePrice, input.propertyType);
  const registrationFee = calculateRegistrationFee(input.registrationMethod);

  const totalExpenses = bond.bondPaymentAmount + stampTax + registrationFee;

  return {
    bondStandardPrice: bond.bondStandardPrice,
    bondRate: bond.bondRate,
    bondRequiredAmount: bond.bondRequiredAmount,
    bondPaymentAmount: bond.bondPaymentAmount,
    stampTax,
    registrationFee,
    totalExpenses,
  };
}
