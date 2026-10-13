import { PropertyCalculationInput, ScenarioCalculationResult, ScenarioId } from '../types/calculator';
import { calculateTaxBreakdown } from './TaxCalculatorEngine';
import { calculatePublicExpenses } from './PublicExpenseEngine';
import { createChecklistForScenario } from './ChecklistFactory';

interface ScenarioMeta {
  name: string;
  badge: string;
  description: string;
  legalBasis: string;
  postNotices: string[];
}

const SCENARIO_META_MAP: Record<ScenarioId, ScenarioMeta> = {
  STANDARD: {
    name: '일반 표준 과세',
    badge: '기준 시나리오',
    description: '감면 혜택 없이 지방세법 기본 요율이 적용되는 일반 납부 기준입니다.',
    legalBasis: '지방세법 제11조(부동산 취득의 세율)',
    postNotices: ['일반 취득으로 별도의 거주 의무나 전입 사후관리 규정은 없습니다.'],
  },
  FIRST_HOME: {
    name: '생애최초 주택 구입 감면',
    badge: '최대 300만원 면제',
    description: '경북 의성군 인구감소지역 특례로 취득가액 12억원 이하 주택에 대해 최대 300만원까지 100% 전액 면제됩니다.',
    legalBasis: '지방세특례제한법 제36조의3 제1항 제1호 라목 (최소납부세제 배제)',
    postNotices: [
      '취득일로부터 3개월 이내에 상시 거주(전입)를 시작해야 합니다.',
      '취득일로부터 3년 동안 매각, 증여, 임대(전월세) 없이 실거주를 유지해야 합니다.',
      '위반 시 감면받은 세액 전액과 1일 0.022%의 납부지연가산세가 추징됩니다.',
    ],
  },
  NEWBORN_BABY: {
    name: '신생아 출산가구 주택 감면',
    badge: '최대 500만원 면제',
    description: '출산일 전 1년 또는 출산 후 5년 이내 1주택 취득 시 취득세가 최대 500만원까지 100% 면제됩니다.',
    legalBasis: '지방세특례제한법 제36조의5 제1항',
    postNotices: [
      '취득일로부터 3개월 이내에 신생아와 함께 전입하여 실거주를 시작해야 합니다.',
      '취득일로부터 3년 이내에 매각, 증여, 임대할 경우 감면세액이 추징됩니다.',
    ],
  },
  MULTI_CHILD_2: {
    name: '다자녀 가구 주택 감면 (2자녀)',
    badge: '50% 감면 (최대 150만원)',
    description: '경상북도 도세감면 조례에 따라 만 18세 미만 2자녀 양육 가구의 주택 취득세 50%가 경감됩니다.',
    legalBasis: '경상북도 도세 감면 조례 제12조 제1항',
    postNotices: ['취득일로부터 3년 이내 매각 또는 타용도 전용 시 감면세액이 추징됩니다.'],
  },
  MULTI_CHILD_3: {
    name: '다자녀 가구 주택 감면 (3자녀 이상)',
    badge: '100% 면제 (최대 300만원)',
    description: '만 18세 미만 3자녀 이상 양육 가구의 주택 취득세가 최대 300만원 한도로 전액 면제됩니다.',
    legalBasis: '경상북도 도세 감면 조례 제12조 제2항',
    postNotices: ['취득일로부터 3년 이내 매각 또는 타용도 전용 시 감면세액이 추징됩니다.'],
  },
  FARMER_ACQUISITION: {
    name: '자경농민 농지 취득 감면',
    badge: '취득세 50% 감면',
    description: '2년 이상 계속 영농에 종사한 농민이 농지 소재지 30km 이내 농지를 취득할 때 취득세 50% 경감 및 농특세 비과세됩니다.',
    legalBasis: '지방세특례제한법 제6조 제1항',
    postNotices: [
      '취득일로부터 2년 이내에 직접 경작을 시작해야 합니다.',
      '취득일로부터 2년 이내 정당한 사유 없이 매각, 임대하거나 타용도로 사용할 경우 감면세액이 추징됩니다.',
    ],
  },
  RETURN_TO_FARM: {
    name: '귀농인 농지 취득 감면',
    badge: '취득세 50% 감면',
    description: '도시지역에서 1년 이상 거주 후 의성군으로 전입한 귀농인이 2년 내 농지를 취득 시 취득세 50%가 경감됩니다.',
    legalBasis: '지방세특례제한법 제6조 제2항',
    postNotices: ['취득일로부터 3년 이내 정당한 사유 없이 농업 외 타용도 전용 및 처분 시 추징됩니다.'],
  },
  RURAL_HOUSE_RENOVATION: {
    name: '농어촌주택개량사업 감면',
    badge: '최대 280만원 면제',
    description: '의성군 농어촌주택개량 대상자로 선정된 전용 150㎡ 이하 단독주택 신축/개량 시 최대 280만원 면제됩니다.',
    legalBasis: '지방세특례제한법 제67조 제1항',
    postNotices: ['개량 사업 완료 후 실거주 목적 단독주택으로 유지 관리해야 합니다.'],
  },
  INHERITANCE_1HOUSE_SPECIAL: {
    name: '무주택 1가구1주택 상속 특례',
    badge: '세율 0.8% 적용 (2.0%p 절감)',
    description: '상속 개시일 기준 무주택 세대가 1주택을 상속받는 경우 표준세율 2.8%에서 중과기준세율 2%를 차감한 0.8%가 적용됩니다.',
    legalBasis: '지방세법 제15조 제1항 제2호 가목',
    postNotices: ['상속인 세대원 전원의 무주택 자격이 유지되어야 특례가 인정됩니다.'],
  },
};

/**
 * 단일 시나리오의 전체 세액 및 공적비용 계산 함수
 */
export function calculateSingleScenario(
  input: PropertyCalculationInput,
  scenarioId: ScenarioId,
  standardGrandTotal?: number,
  existingChecklist?: ScenarioCalculationResult['checklist']
): ScenarioCalculationResult {
  const meta = SCENARIO_META_MAP[scenarioId];
  const taxBreakdown = calculateTaxBreakdown(input, scenarioId);
  const registrationExpenses = calculatePublicExpenses(input);
  const grandTotal = taxBreakdown.totalLocalTax + registrationExpenses.totalExpenses;

  // 기준 일반 과세 대비 절세액
  const taxSavingsAmount = standardGrandTotal !== undefined
    ? Math.max(0, standardGrandTotal - grandTotal)
    : 0;

  const checklist = existingChecklist || createChecklistForScenario(scenarioId);

  // 적격 여부 판정
  let eligibilityStatus: ScenarioCalculationResult['eligibilityStatus'] = 'PENDING';
  if (scenarioId === 'STANDARD') {
    eligibilityStatus = 'ELIGIBLE';
  } else if (checklist.length > 0) {
    const requiredList = checklist.filter(q => q.isRequired);
    const checkedCount = requiredList.filter(q => q.checked).length;
    if (checkedCount === requiredList.length) {
      eligibilityStatus = 'ELIGIBLE';
    } else if (checkedCount > 0) {
      eligibilityStatus = 'PENDING';
    } else {
      eligibilityStatus = 'PENDING';
    }
  }

  return {
    scenarioId,
    scenarioName: meta.name,
    scenarioBadge: meta.badge,
    scenarioDescription: meta.description,
    legalBasis: meta.legalBasis,
    eligibilityStatus,
    checklist,
    taxBreakdown,
    registrationExpenses,
    grandTotal,
    taxSavingsAmount,
    postManagementNotice: meta.postNotices,
  };
}

/**
 * 부동산 기본 입력값을 받아 적용 가능한 모든 감면 시나리오를 동시 산출하는 핵심 엔진
 */
export function generateAllScenarios(
  input: PropertyCalculationInput,
  existingChecklistMap?: Record<string, ScenarioCalculationResult['checklist']>
): ScenarioCalculationResult[] {
  const results: ScenarioCalculationResult[] = [];

  // 1. 기준 시나리오: 일반 표준 과세 (항상 최우선 산출)
  const standardResult = calculateSingleScenario(
    input,
    'STANDARD',
    undefined,
    existingChecklistMap?.['STANDARD']
  );
  results.push(standardResult);
  const baseGrandTotal = standardResult.grandTotal;

  // 2. 주택 유상매매인 경우
  if (input.propertyType === 'HOUSING' && input.acquisitionCause === 'SALE' && !input.isCorporate) {
    // 생애최초 주택 (의성군 인구감소지역 300만원 한도)
    results.push(calculateSingleScenario(input, 'FIRST_HOME', baseGrandTotal, existingChecklistMap?.['FIRST_HOME']));

    // 신생아 출산가구 1주택 (500만원 한도)
    results.push(calculateSingleScenario(input, 'NEWBORN_BABY', baseGrandTotal, existingChecklistMap?.['NEWBORN_BABY']));

    // 다자녀 가구 (2자녀 150만 / 3자녀 300만)
    results.push(calculateSingleScenario(input, 'MULTI_CHILD_2', baseGrandTotal, existingChecklistMap?.['MULTI_CHILD_2']));
    results.push(calculateSingleScenario(input, 'MULTI_CHILD_3', baseGrandTotal, existingChecklistMap?.['MULTI_CHILD_3']));
  }

  // 3. 농지 매매인 경우
  if (input.propertyType === 'AGRICULTURAL_LAND' && input.acquisitionCause === 'SALE' && !input.isCorporate) {
    // 자경농민 50% 감면
    results.push(calculateSingleScenario(input, 'FARMER_ACQUISITION', baseGrandTotal, existingChecklistMap?.['FARMER_ACQUISITION']));

    // 귀농인 50% 감면
    results.push(calculateSingleScenario(input, 'RETURN_TO_FARM', baseGrandTotal, existingChecklistMap?.['RETURN_TO_FARM']));
  }

  // 4. 주택 신축인 경우
  if (input.propertyType === 'HOUSING' && input.acquisitionCause === 'NEW_CONSTRUCTION') {
    results.push(calculateSingleScenario(input, 'RURAL_HOUSE_RENOVATION', baseGrandTotal, existingChecklistMap?.['RURAL_HOUSE_RENOVATION']));
  }

  // 5. 상속 주택인 경우
  if (input.propertyType === 'HOUSING' && input.acquisitionCause === 'INHERITANCE') {
    results.push(calculateSingleScenario(input, 'INHERITANCE_1HOUSE_SPECIAL', baseGrandTotal, existingChecklistMap?.['INHERITANCE_1HOUSE_SPECIAL']));
  }

  return results;
}
