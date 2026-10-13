import { PropertyCalculationInput, ScenarioId } from '../types/calculator';

export interface TaxCalculationResult {
  taxBase: number;
  standardTaxRate: number; // % 단위 (예: 1.0, 3.0, 8.0)
  calculatedTaxAmount: number;
  exemptTaxAmount: number;
  finalBaseTax: number;
  localEducationTax: number;
  ruralSpecialTax: number;
  totalLocalTax: number;
}

/**
 * 1. 국민주택규모 초과 여부 판정 (농특세 비과세 분기)
 * - 의성읍 도시지역: 전용 85㎡ 이하 비과세, 초과 시 과세
 * - 의성군 17개 면 전역 및 의성읍 비도시지역: 전용 100㎡ 이하 비과세, 초과 시 과세
 */
export function isNationalHousingSize(input: PropertyCalculationInput): boolean {
  if (input.propertyType !== 'HOUSING') return false;
  const threshold = (input.eupMyeon === 'UISEONG_EUP' && input.isUiseongUrbanArea) ? 85 : 100;
  return input.exclusiveAreaSqm <= threshold;
}

/**
 * 2. 주택 실거래가에 따른 비조정 1주택 일반세율 (1.0% ~ 3.0%) 계산
 * - 6억원 이하: 1.0%
 * - 6억원 초과 ~ 9억원 이하: ((가액 * 2/3 - 3억) / 1억) * 1%
 * - 9억원 초과: 3.0%
 */
export function getHousing1Rate(purchasePrice: number): number {
  if (purchasePrice <= 600_000_000) {
    return 1.0;
  }
  if (purchasePrice > 900_000_000) {
    return 3.0;
  }
  // 6억 초과 9억 이하
  const rawRate = ((purchasePrice * (2 / 3) - 300_000_000) / 100_000_000);
  return Math.round(rawRate * 100) / 100; // 소수점 둘째자리 반올림
}

/**
 * 3. 취득세 기본세율 판정 (경북 의성군 비조정지역 기준)
 */
export function determineTaxRate(input: PropertyCalculationInput): number {
  const { propertyType, acquisitionCause, purchasePrice, ownedHousingCount, isTemporaryTwoHomes, isCorporate, officialStandardPrice } = input;

  // 법인 주택 취득 중과: 12%
  if (isCorporate && propertyType === 'HOUSING') {
    return 12.0;
  }

  // 매매 (유상거래)
  if (acquisitionCause === 'SALE') {
    if (propertyType === 'HOUSING') {
      // 의성군(비수도권) 시가표준액 2억원 이하 주택 매수 시: 다주택자도 중과 배제 및 1주택 일반세율 적용 (지방세법 시행령 제28조의2)
      if (officialStandardPrice <= 200_000_000) {
        return getHousing1Rate(purchasePrice);
      }

      // 주택수에 따른 세율 (비조정지역)
      if (ownedHousingCount <= 1 || isTemporaryTwoHomes) {
        return getHousing1Rate(purchasePrice);
      }
      if (ownedHousingCount === 2) {
        // 비조정 2주택은 1주택과 동일한 1~3% 일반세율 적용
        return getHousing1Rate(purchasePrice);
      }
      if (ownedHousingCount === 3) {
        return 8.0; // 3주택 중과 8%
      }
      return 12.0; // 4주택 이상 중과 12%
    }

    if (propertyType === 'AGRICULTURAL_LAND') {
      return 3.0; // 농지 매매 표준세율 3%
    }

    // 일반 토지, 상가, 오피스텔 등
    return 4.0; // 4.0%
  }

  // 상속
  if (acquisitionCause === 'INHERITANCE') {
    if (propertyType === 'AGRICULTURAL_LAND') {
      return 2.3;
    }
    return 2.8;
  }

  // 증여
  if (acquisitionCause === 'GIFT') {
    return 3.5;
  }

  // 신축/원시취득
  if (acquisitionCause === 'NEW_CONSTRUCTION') {
    return 2.8;
  }

  // 공유물 분할
  if (acquisitionCause === 'DIVISION_SPECIAL') {
    return 0.3; // 지특법/지방세법 제15조 특례세율 (2.3% - 2.0% = 0.3%)
  }
  if (acquisitionCause === 'DIVORCE_DIVISION') {
    return 0.8; // 이혼 재산분할 특례 (2.8% - 2.0% = 0.8%)
  }
  if (acquisitionCause === 'DIVISION') {
    return 2.3;
  }

  return 4.0;
}

/**
 * 4. 시나리오별 감면세액 및 부가세(교육세, 농특세) 계산
 */
export function calculateTaxBreakdown(
  input: PropertyCalculationInput,
  scenarioId: ScenarioId
): TaxCalculationResult {
  // 과세표준 결정
  let taxBase = input.purchasePrice;
  if (input.acquisitionCause === 'INHERITANCE') {
    taxBase = input.officialStandardPrice; // 상속은 시가표준액 원칙
  } else if (input.acquisitionCause === 'GIFT') {
    taxBase = input.purchasePrice > 0 ? input.purchasePrice : input.officialStandardPrice; // 증여 시가인정액 또는 공시가
  } else if (input.purchasePrice <= 0) {
    taxBase = input.officialStandardPrice;
  }

  // 1가구 1주택 상속 특례 시나리오인 경우 세율 0.8% 적용
  let standardTaxRate = determineTaxRate(input);
  if (scenarioId === 'INHERITANCE_1HOUSE_SPECIAL') {
    standardTaxRate = 0.8;
  }

  const calculatedTaxAmount = Math.round(taxBase * (standardTaxRate / 100));

  // 감면세액 산출
  let exemptTaxAmount = 0;
  switch (scenarioId) {
    case 'FIRST_HOME': {
      // 지특법 제36조의3 제1항 제1호 라목 (인구감소지역인 의성군은 최대 300만원 한도)
      // 지특법 제177조의2 제1항 단서 제2호에 따라 최소납부세제(85%) 배제 -> 300만원 이하는 100% 전액 면제 (결정세액 0원)
      exemptTaxAmount = Math.min(calculatedTaxAmount, 3_000_000);
      break;
    }
    case 'NEWBORN_BABY': {
      // 지특법 제36조의5 출산·양육 지원 (최대 500만원 한도 100% 면제)
      exemptTaxAmount = Math.min(calculatedTaxAmount, 5_000_000);
      break;
    }
    case 'MULTI_CHILD_2': {
      // 경상북도 도세 감면 조례 (2자녀 가구 주택: 50% 감면, 최대 150만원 한도)
      const fiftyPercent = Math.round(calculatedTaxAmount * 0.5);
      exemptTaxAmount = Math.min(fiftyPercent, 1_500_000);
      break;
    }
    case 'MULTI_CHILD_3': {
      // 경상북도 도세 감면 조례 (3자녀 이상 가구 주택: 100% 면제, 최대 300만원 한도)
      exemptTaxAmount = Math.min(calculatedTaxAmount, 3_000_000);
      break;
    }
    case 'FARMER_ACQUISITION':
    case 'RETURN_TO_FARM': {
      // 지특법 제6조 자경농민 및 귀농인 농지 취득 (취득세 50% 경감)
      exemptTaxAmount = Math.round(calculatedTaxAmount * 0.5);
      break;
    }
    case 'RURAL_HOUSE_RENOVATION': {
      // 농어촌주택개량사업 (최대 280만원 한도 전액 면제)
      exemptTaxAmount = Math.min(calculatedTaxAmount, 2_800_000);
      break;
    }
    case 'INHERITANCE_1HOUSE_SPECIAL': {
      // 이미 세율을 0.8%로 특례 적용했으므로 추가 감면은 0
      exemptTaxAmount = 0;
      break;
    }
    case 'STANDARD':
    default: {
      exemptTaxAmount = 0;
      break;
    }
  }

  // 최종 결정 취득세 본세
  const finalBaseTax = Math.max(0, calculatedTaxAmount - exemptTaxAmount);

  // 지방교육세 계산
  // - 주택: 감면 후 최종 본세의 10% (단, 다주택 중과세는 지세법 제151조에 따라 0.4%)
  // - 토지/상가: (표준세율 - 2%) * 20%
  let localEducationTax = 0;
  if (input.propertyType === 'HOUSING') {
    if (standardTaxRate >= 8.0) {
      // 중과세 주택 (3주택 이상)
      localEducationTax = Math.round(taxBase * 0.004);
    } else {
      localEducationTax = Math.round(finalBaseTax * 0.1);
    }
  } else {
    // 토지, 상가 등: (rate - 2.0%) * 20%
    const eduRate = Math.max(0, (standardTaxRate - 2.0) * 0.2);
    const rawEduTax = Math.round(taxBase * (eduRate / 100));
    // 감면 시나리오 비율 적용 (농지 50% 감면 등)
    if (scenarioId === 'FARMER_ACQUISITION' || scenarioId === 'RETURN_TO_FARM') {
      localEducationTax = Math.round(rawEduTax * 0.5);
    } else {
      localEducationTax = rawEduTax;
    }
  }

  // 농어촌특별세 계산
  // 1. 과세표준에 부과되는 농특세:
  // - 주택: 국민주택규모(의성읍도시 85㎡, 그외 100㎡) 이하이면 0원 (비과세)
  // - 국민주택규모 초과 주택 또는 토지/상가: taxBase * 0.2% (단, 중과 주택은 3주택 0.6%, 4주택 1.0%)
  // 2. 감면세액에 부과되는 농특세(20%):
  // - 자경농민, 다자녀, 국민주택규모 서민주택 감면액은 농특세 비과세!
  let ruralSpecialTax = 0;
  const isNational = isNationalHousingSize(input);

  if (input.propertyType === 'HOUSING') {
    if (!isNational) {
      if (standardTaxRate === 8.0) {
        ruralSpecialTax = Math.round(taxBase * 0.006); // 0.6%
      } else if (standardTaxRate >= 12.0) {
        ruralSpecialTax = Math.round(taxBase * 0.01);  // 1.0%
      } else {
        ruralSpecialTax = Math.round(taxBase * 0.002); // 0.2%
      }
    } else {
      ruralSpecialTax = 0; // 국민주택규모 이하는 전액 비과세
    }
  } else {
    // 토지 및 상가: 본세분 0.2%
    ruralSpecialTax = Math.round(taxBase * 0.002);
    // 자경농민, 귀농인 감면은 농특세법 제4조에 의해 농특세도 전액 비과세
  }

  const totalLocalTax = finalBaseTax + localEducationTax + ruralSpecialTax;

  return {
    taxBase,
    standardTaxRate,
    calculatedTaxAmount,
    exemptTaxAmount,
    finalBaseTax,
    localEducationTax,
    ruralSpecialTax,
    totalLocalTax,
  };
}
