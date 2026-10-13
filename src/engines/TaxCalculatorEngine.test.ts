import { describe, it, expect } from 'vitest';
import { calculateTaxBreakdown, isNationalHousingSize, determineTaxRate } from './TaxCalculatorEngine';
import { calculateHousingBond, calculateStampTax, calculateRegistrationFee } from './PublicExpenseEngine';
import { generateAllScenarios } from './ExemptionMatrixEngine';
import { PropertyCalculationInput } from '../types/calculator';

describe('PTT Calculator Engine Full Legal Tests', () => {
  const defaultInput: PropertyCalculationInput = {
    eupMyeon: 'ANGYE_MYEON', // 안계면
    isUiseongUrbanArea: false,
    propertyType: 'HOUSING',
    acquisitionCause: 'SALE',
    purchasePrice: 250_000_000,       // 2.5억원
    officialStandardPrice: 180_000_000,// 1.8억원
    exclusiveAreaSqm: 84.95,          // 84.95㎡
    ownedHousingCount: 1,
    isTemporaryTwoHomes: false,
    isCorporate: false,
    registrationMethod: 'E_FORM',
    bondDiscountRate: 10.5,
  };

  it('1. 국민주택규모 읍·면 판정 분기 테스트', () => {
    // 안계면(면 지역): 99㎡는 100㎡ 이하이므로 국민주택규모 해당
    expect(isNationalHousingSize({ ...defaultInput, exclusiveAreaSqm: 99.0 })).toBe(true);
    expect(isNationalHousingSize({ ...defaultInput, exclusiveAreaSqm: 100.0 })).toBe(true);
    expect(isNationalHousingSize({ ...defaultInput, exclusiveAreaSqm: 100.1 })).toBe(false);

    // 의성읍 도시지역: 85㎡ 이하만 해당
    const urbanInput: PropertyCalculationInput = {
      ...defaultInput,
      eupMyeon: 'UISEONG_EUP',
      isUiseongUrbanArea: true,
      exclusiveAreaSqm: 85.0,
    };
    expect(isNationalHousingSize(urbanInput)).toBe(true);
    expect(isNationalHousingSize({ ...urbanInput, exclusiveAreaSqm: 85.1 })).toBe(false);
  });

  it('2. 생애최초 300만원 한도 및 최소납부세제 배제 (100% 면제) 테스트', () => {
    // 2.5억원 매매: 취득세율 1.0% -> 산출세액 2,500,000원
    // 300만원 이하이므로 전액 2,500,000원 감면되어 결정세액 0원!
    const result = calculateTaxBreakdown(defaultInput, 'FIRST_HOME');
    expect(result.calculatedTaxAmount).toBe(2_500_000);
    expect(result.exemptTaxAmount).toBe(2_500_000);
    expect(result.finalBaseTax).toBe(0);
    expect(result.localEducationTax).toBe(0);
    expect(result.ruralSpecialTax).toBe(0); // 84.95㎡ 비과세
    expect(result.totalLocalTax).toBe(0);
  });

  it('3. 다주택 중과세 배제: 의성군 시가표준액 2억원 이하 주택 매수 특례', () => {
    // 3주택자가 의성군 시가표준액 1.8억원 주택을 2.5억원에 매수할 때
    // 지방세법 시행령 제28조의2에 의해 8% 중과가 배제되고 1주택 일반세율(1.0%) 적용
    const multiHouseInput: PropertyCalculationInput = {
      ...defaultInput,
      ownedHousingCount: 3,
      officialStandardPrice: 180_000_000,
    };
    expect(determineTaxRate(multiHouseInput)).toBe(1.0);
  });

  it('4. 국민주택채권 5천원 단수처리 및 즉시할인 계산', () => {
    // 시가표준액 1.8억원 주택 (기타지역 1.6억~2.6억 구간: 1.8%)
    // 180,000,000 * 0.018 = 3,240,000원
    const bond = calculateHousingBond(180_000_000, 'HOUSING', 10.5);
    expect(bond.bondRequiredAmount).toBe(3_240_000);
    // 할인부담금 3,240,000 * 0.105 = 340,200원
    expect(bond.bondPaymentAmount).toBe(340_200);
  });

  it('5. 인지세 및 e-Form 등기신청수수료 계산', () => {
    // 2.5억원 주택: 1억 초과 10억 이하 150,000원
    expect(calculateStampTax(250_000_000, 'HOUSING')).toBe(150_000);
    // e-Form 등기신청수수료: 15,000원
    expect(calculateRegistrationFee('E_FORM')).toBe(15_000);
  });

  it('6. 자경농민 농지 매매 (50% 감면 및 농특세 비과세)', () => {
    const farmInput: PropertyCalculationInput = {
      ...defaultInput,
      propertyType: 'AGRICULTURAL_LAND',
      acquisitionCause: 'SALE',
      purchasePrice: 100_000_000,
      officialStandardPrice: 70_000_000,
    };
    const standard = calculateTaxBreakdown(farmInput, 'STANDARD');
    // 표준세율 3.0% -> 본세 3,000,000원
    expect(standard.standardTaxRate).toBe(3.0);
    expect(standard.calculatedTaxAmount).toBe(3_000_000);

    const farmer = calculateTaxBreakdown(farmInput, 'FARMER_ACQUISITION');
    // 50% 감면 -> 본세 1,500,000원
    expect(farmer.exemptTaxAmount).toBe(1_500_000);
    expect(farmer.finalBaseTax).toBe(1_500_000);
  });

  it('7. 전 시나리오 일괄 생성 파이프라인 (One-Input Multi-Output)', () => {
    const scenarios = generateAllScenarios(defaultInput);
    // 주택 유상매매: STANDARD, FIRST_HOME, NEWBORN_BABY, MULTI_CHILD_2, MULTI_CHILD_3 총 5개 시나리오 생성
    expect(scenarios.length).toBe(5);
    const firstHome = scenarios.find(s => s.scenarioId === 'FIRST_HOME')!;
    expect(firstHome.taxSavingsAmount).toBe(2_750_000); // 본세 250만 + 교육세 25만 절세
  });
});
