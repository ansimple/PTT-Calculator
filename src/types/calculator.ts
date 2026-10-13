/**
 * 1. 행정구역 및 읍·면 구분
 */
export type UiseongEupMyeon = 
  | 'UISEONG_EUP'    // 의성읍
  | 'DANCHON_MYEON'  // 단촌면
  | 'JEOMGOK_MYEON'  // 점곡면
  | 'OKSAN_MYEON'    // 옥산면
  | 'SAGOK_MYEON'    // 사곡면
  | 'CHUNSAN_MYEON'  // 춘산면
  | 'GAEUM_MYEON'    // 가음면
  | 'GEUMSEONG_MYEON'// 금성면
  | 'BONGYANG_MYEON' // 봉양면
  | 'BIAN_MYEON'     // 비안면
  | 'GUCHEON_MYEON'  // 구천면
  | 'DANMIL_MYEON'   // 단밀면
  | 'DANBUK_MYEON'   // 단북면
  | 'ANGYE_MYEON'    // 안계면
  | 'DAIN_MYEON'     // 다인면
  | 'SINPYEONG_MYEON'// 신평면
  | 'ANPYEONG_MYEON' // 안평면
  | 'ANSA_MYEON';    // 안사면

export interface EupMyeonInfo {
  code: UiseongEupMyeon;
  name: string;
  isTown: boolean; // 의성읍 여부
}

export const UISEONG_EUP_MYEON_LIST: EupMyeonInfo[] = [
  { code: 'UISEONG_EUP', name: '의성읍', isTown: true },
  { code: 'DANCHON_MYEON', name: '단촌면', isTown: false },
  { code: 'JEOMGOK_MYEON', name: '점곡면', isTown: false },
  { code: 'OKSAN_MYEON', name: '옥산면', isTown: false },
  { code: 'SAGOK_MYEON', name: '사곡면', isTown: false },
  { code: 'CHUNSAN_MYEON', name: '춘산면', isTown: false },
  { code: 'GAEUM_MYEON', name: '가음면', isTown: false },
  { code: 'GEUMSEONG_MYEON', name: '금성면', isTown: false },
  { code: 'BONGYANG_MYEON', name: '봉양면', isTown: false },
  { code: 'BIAN_MYEON', name: '비안면', isTown: false },
  { code: 'GUCHEON_MYEON', name: '구천면', isTown: false },
  { code: 'DANMIL_MYEON', name: '단밀면', isTown: false },
  { code: 'DANBUK_MYEON', name: '단북면', isTown: false },
  { code: 'ANGYE_MYEON', name: '안계면', isTown: false },
  { code: 'DAIN_MYEON', name: '다인면', isTown: false },
  { code: 'SINPYEONG_MYEON', name: '신평면', isTown: false },
  { code: 'ANPYEONG_MYEON', name: '안평면', isTown: false },
  { code: 'ANSA_MYEON', name: '안사면', isTown: false },
].filter(Boolean) as EupMyeonInfo[];

/**
 * 2. 물건 유형 및 취득 원인
 */
export type PropertyType = 
  | 'HOUSING'           // 주택 (아파트, 단독, 다세대)
  | 'AGRICULTURAL_LAND' // 농지 (전, 답, 과수원, 목장)
  | 'GENERAL_LAND'      // 일반 토지 (임야, 대지, 잡종지)
  | 'COMMERCIAL';       // 상가, 업무시설, 공장

export type AcquisitionCause = 
  | 'SALE'              // 매매 (유상거래)
  | 'INHERITANCE'       // 상속
  | 'GIFT'              // 증여
  | 'NEW_CONSTRUCTION'  // 신축/원시취득
  | 'DIVISION'          // 단순 공유물 분할
  | 'DIVISION_SPECIAL'  // 본인 지분 분할 특례 (0.3%)
  | 'DIVORCE_DIVISION'; // 이혼 재산분할 특례 (0.8%)

export type RegistrationMethod = 'WRITTEN' | 'E_FORM' | 'ELECTRONIC';

/**
 * 3. 감면 시나리오 열거형
 */
export type ScenarioId = 
  | 'STANDARD'                    // 일반 표준 과세 (비감면)
  | 'FIRST_HOME'                  // 생애최초 주택 구입 (의성군 인구감소지역 300만원 한도, 최소납부세제 배제 100% 면제)
  | 'NEWBORN_BABY'                // 신생아 출산가구 1주택 (최대 500만원 한도, 100% 면제)
  | 'MULTI_CHILD_2'               // 경북 도세감면: 2자녀 가구 주택 (최대 150만원 한도)
  | 'MULTI_CHILD_3'               // 경북 도세감면: 3자녀 이상 가구 주택 (최대 300만원 한도)
  | 'FARMER_ACQUISITION'          // 2년 이상 자경농민 농지 취득 (취득세 50% 경감, 농특세 비과세)
  | 'RETURN_TO_FARM'              // 귀농인 농지 취득 (취득세 50% 경감, 농특세 비과세)
  | 'RURAL_HOUSE_RENOVATION'      // 농어촌주택개량사업 (최대 280만원 한도 면제)
  | 'INHERITANCE_1HOUSE_SPECIAL'; // 무주택 세대 1가구 1주택 상속 특례 (0.8%)

/**
 * 4. 계산기 입력 폼 데이터 모델
 */
export interface PropertyCalculationInput {
  eupMyeon: UiseongEupMyeon;
  isUiseongUrbanArea: boolean;      // 의성읍 도시지역 여부 (체크 시 85㎡ 초과 농특세 과세, 미체크 시 100㎡ 초과 과세)
  propertyType: PropertyType;
  acquisitionCause: AcquisitionCause;
  purchasePrice: number;            // 실제 취득금액 (원)
  officialStandardPrice: number;    // 시가표준액 / 공시가격 (원)
  exclusiveAreaSqm: number;         // 주거전용면적 (㎡)
  ownedHousingCount: number;        // 취득 후 세대 소유 주택수 (1, 2, 3, 4)
  isTemporaryTwoHomes: boolean;     // 일시적 2주택 여부 (3년 내 종전주택 처분 조건)
  isCorporate: boolean;             // 매수자 법인 여부
  registrationMethod: RegistrationMethod; // 등기 신청 방식
  bondDiscountRate: number;         // 국민주택채권 일자별 할인율 (%) (기본값 10.5%)
}

/**
 * 5. 체크리스트 문항 모델
 */
export interface ChecklistQuestion {
  id: string;
  category: 'ELIGIBILITY' | 'PROPERTY' | 'POST_MANAGEMENT';
  question: string;
  helperText?: string;
  legalReference?: string;
  isRequired: boolean;
  checked: boolean;
}

export type ScenarioEligibilityStatus = 
  | 'PENDING'      // 요건 미확인 (기본)
  | 'ELIGIBLE'     // 요건 모두 충족 (적격)
  | 'INELIGIBLE';  // 필수 요건 불충족 (부적격)

/**
 * 6. 단일 시나리오 세액 및 비용 명세 결과 모델
 */
export interface ScenarioCalculationResult {
  scenarioId: ScenarioId;
  scenarioName: string;
  scenarioBadge: string;
  scenarioDescription: string;
  legalBasis: string;
  eligibilityStatus: ScenarioEligibilityStatus;
  checklist: ChecklistQuestion[];
  taxBreakdown: {
    taxBase: number;                // 과세표준 (원)
    standardTaxRate: number;        // 본세율 (%)
    calculatedTaxAmount: number;    // 산출세액 (원)
    exemptTaxAmount: number;        // 감면세액 (원)
    finalBaseTax: number;           // 결정 취득세 본세 (원)
    localEducationTax: number;      // 지방교육세 (원)
    ruralSpecialTax: number;        // 농어촌특별세 (원)
    totalLocalTax: number;          // 지방세 납부 합계 (원)
  };
  registrationExpenses: {
    bondStandardPrice: number;      // 채권 산정 기준 시가표준액
    bondRate: number;               // 채권 매입률 (%)
    bondRequiredAmount: number;     // 국민주택채권 법정 매입금액 (원)
    bondPaymentAmount: number;      // 채권 즉시할인매도 본인부담금 (원)
    stampTax: number;               // 정부수입인지세 (원)
    registrationFee: number;        // 대법원 등기신청수수료 (원)
    totalExpenses: number;          // 공적 부대비용 합계 (원)
  };
  grandTotal: number;               // 총 납부 소요 비용 (원)
  taxSavingsAmount: number;         // 기준 일반과세 대비 총 절세액 (원)
  postManagementNotice: string[];   // 사후관리 및 추징 주의사항
}
