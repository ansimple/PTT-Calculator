import { ChecklistQuestion, ScenarioId } from '../types/calculator';

/**
 * 공식 서류(07번 의성군 실무 점검표 및 08번 지특법 시행령 별표 서식)에 기반한 시나리오별 문항 생성
 */
export function createChecklistForScenario(scenarioId: ScenarioId): ChecklistQuestion[] {
  switch (scenarioId) {
    case 'FIRST_HOME':
      return [
        {
          id: 'fh-1',
          category: 'ELIGIBILITY',
          question: '취득자가 성년(만 19세 이상) 대한민국 국민인가요?',
          helperText: '미성년자 단독 취득 불가 (단, 소년소녀가장 또는 혼인한 미성년자 제외)',
          legalReference: '지특법 제36조의3 제1항',
          isRequired: true,
          checked: false,
        },
        {
          id: 'fh-2',
          category: 'ELIGIBILITY',
          question: '본인 및 배우자 모두 과거 주택 소유 사실이 없나요?',
          helperText: '미혼인 경우 본인 기준, 기혼은 배우자 합산. 단, 상속지분 처분자, 20년 노후농가 처분 후 타지역 이주자 등 5대 법정 예외는 무소유 인정',
          legalReference: '지특법 시행령 제29조의2 별표 1',
          isRequired: true,
          checked: false,
        },
        {
          id: 'fh-3',
          category: 'PROPERTY',
          question: '취득 주택의 실제 거래가액이 12억원 이하인가요?',
          helperText: '의성군은 인구감소지역 특례가 적용되어 300만원 한도 내에서 100% 전액 면제됩니다.',
          legalReference: '지특법 제36조의3 제1항 제1호 라목',
          isRequired: true,
          checked: false,
        },
        {
          id: 'fh-4',
          category: 'POST_MANAGEMENT',
          question: '취득일로부터 3개월 이내에 상시 전입하여 실거주를 시작할 수 있나요?',
          helperText: '기존 임차인 임대차기간이 남아있는 경우 최대 1년까지 유예 가능',
          legalReference: '지특법 제36조의3 제4항 제1호',
          isRequired: true,
          checked: false,
        },
        {
          id: 'fh-5',
          category: 'POST_MANAGEMENT',
          question: '취득일로부터 3년 동안 매각·증여·임대(전월세) 없이 실거주를 유지할 수 있나요?',
          helperText: '위반 시 면제받은 세액 전액 및 1일 0.022% 납부지연가산세가 소급 추징됩니다.',
          legalReference: '지특법 제36조의3 제4항 제3호',
          isRequired: true,
          checked: false,
        },
      ];

    case 'NEWBORN_BABY':
      return [
        {
          id: 'nb-1',
          category: 'ELIGIBILITY',
          question: '자녀 출산일 전 1년 또는 출산일로부터 5년 이내 주택을 취득하나요?',
          helperText: '2024년 1월 1일 이후 출생한 자녀가 있는 세대주 또는 배우자 대상',
          legalReference: '지특법 제36조의5 제1항',
          isRequired: true,
          checked: false,
        },
        {
          id: 'nb-2',
          category: 'ELIGIBILITY',
          question: '취득 후 해당 주택에 신생아와 함께 주민등록 전입 및 동거하나요?',
          helperText: '출산 자녀와 실제로 동거하지 않는 경우 감면 대상에서 제외됩니다.',
          legalReference: '지특법 제36조의5 제1항',
          isRequired: true,
          checked: false,
        },
        {
          id: 'nb-3',
          category: 'PROPERTY',
          question: '실제 취득가액이 12억원 이하이고, 1가구 1주택인가요?',
          helperText: '기존 주택이 있는 경우 취득일로부터 1년 이내 처분 조건부 감면',
          legalReference: '지특법 제36조의5 제2항',
          isRequired: true,
          checked: false,
        },
        {
          id: 'nb-4',
          category: 'POST_MANAGEMENT',
          question: '취득 후 3개월 내 전입 및 3년 이상 상시 거주 의무를 준수할 수 있나요?',
          helperText: '3년 이내 매각·증여·임대 시 감면세액(최대 500만원) 추징',
          legalReference: '지특법 제36조의5 제4항',
          isRequired: true,
          checked: false,
        },
      ];

    case 'MULTI_CHILD_2':
    case 'MULTI_CHILD_3':
      return [
        {
          id: 'mc-1',
          category: 'ELIGIBILITY',
          question: '만 18세 미만의 미성년 자녀를 두고 있나요?',
          helperText: '가족관계등록부 기준 2자녀(최대 150만원 감면) 또는 3자녀 이상(최대 300만원 감면)',
          legalReference: '경상북도 도세 감면 조례 제12조',
          isRequired: true,
          checked: false,
        },
        {
          id: 'mc-2',
          category: 'PROPERTY',
          question: '해당 주택 취득으로 1가구 1주택이 되나요?',
          helperText: '기존 주택 소유자는 일시적 2주택 처분 요건 충족 필요',
          legalReference: '경상북도 도세 감면 조례 제12조',
          isRequired: true,
          checked: false,
        },
        {
          id: 'mc-3',
          category: 'POST_MANAGEMENT',
          question: '취득일로부터 3년 이내에 매각하거나 다른 용도로 사용하지 않나요?',
          helperText: '위반 시 감면받은 세액 소급 추징',
          legalReference: '경상북도 도세 감면 조례 제12조 제3항',
          isRequired: true,
          checked: false,
        },
      ];

    case 'FARMER_ACQUISITION':
      return [
        {
          id: 'fa-1',
          category: 'ELIGIBILITY',
          question: '농지 소재지(의성군) 또는 연접 시·군·구에 거주하고 있나요?',
          helperText: '또는 주소지로부터 농지 소재지까지 직선거리 30km 이내 거주자',
          legalReference: '지특법 제6조 제1항 제1호',
          isRequired: true,
          checked: false,
        },
        {
          id: 'fa-2',
          category: 'ELIGIBILITY',
          question: '취득일 현재 2년 이상 계속하여 직접 농업에 종사(자경)하였나요?',
          helperText: '농업경영체 등록 확인서 또는 농지대장으로 영농경력 입증 필요',
          legalReference: '지특법 제6조 제1항',
          isRequired: true,
          checked: false,
        },
        {
          id: 'fa-3',
          category: 'ELIGIBILITY',
          question: '직전 연도 농업 외 종합소득금액이 3,700만원 미만인가요?',
          helperText: '근로/사업소득 합산 3,700만원 이상인 경우 자경농민 감면 배제',
          legalReference: '지특법 제6조 제1항 단서',
          isRequired: true,
          checked: false,
        },
        {
          id: 'fa-4',
          category: 'POST_MANAGEMENT',
          question: '취득일로부터 2년 이내에 정당한 사유 없이 직접 경작을 시작하지 않거나, 매각·임대하지 않나요?',
          helperText: '취득 후 2년 내 처분 또는 타용도 사용 시 감면세액(50%) 및 가산세 추징',
          legalReference: '지특법 제6조 제3항',
          isRequired: true,
          checked: false,
        },
      ];

    case 'RETURN_TO_FARM':
      return [
        {
          id: 'rf-1',
          category: 'ELIGIBILITY',
          question: '농어촌 외의 지역(도시)에서 1년 이상 계속 거주하였나요?',
          helperText: '주민등록초본 상 의성군 전입 직전 도시지역 거주 이력 확인',
          legalReference: '지특법 제6조 제2항',
          isRequired: true,
          checked: false,
        },
        {
          id: 'rf-2',
          category: 'ELIGIBILITY',
          question: '의성군으로 전입한 날부터 2년 이내에 농지를 취득하나요?',
          helperText: '의성군 전입일 기준 2년 이내 취득분에 한하여 50% 감면',
          legalReference: '지특법 제6조 제2항',
          isRequired: true,
          checked: false,
        },
        {
          id: 'rf-3',
          category: 'POST_MANAGEMENT',
          question: '취득일로부터 3년 이내에 정당한 사유 없이 농업 외 타용도 전용 및 처분을 하지 않나요?',
          helperText: '사후관리 위반 시 감면액 추징',
          legalReference: '지특법 제6조 제3항',
          isRequired: true,
          checked: false,
        },
      ];

    case 'RURAL_HOUSE_RENOVATION':
      return [
        {
          id: 'rh-1',
          category: 'ELIGIBILITY',
          question: '의성군 농어촌주택개량사업 대상자로 공식 선정되었나요?',
          helperText: '의성군청 건축부서 대상자 선정 통지서 확인 필요',
          legalReference: '지특법 제67조 제1항',
          isRequired: true,
          checked: false,
        },
        {
          id: 'rh-2',
          category: 'PROPERTY',
          question: '신축·개량 주택의 전용면적이 150㎡ 이하인가요?',
          helperText: '단독주택 연면적 150㎡ 이하 기준 충족 시 취득세 최대 280만원 면제',
          legalReference: '지특법 제67조 제1항',
          isRequired: true,
          checked: false,
        },
      ];

    case 'INHERITANCE_1HOUSE_SPECIAL':
      return [
        {
          id: 'inh-1',
          category: 'ELIGIBILITY',
          question: '상속 개시일 현재 상속인 세대원 전원이 무주택자였나요?',
          helperText: '상속으로 1가구 1주택이 되는 경우 취득세율 0.8% 특례 적용 (표준 2.8% 대비 2.0%p 절감)',
          legalReference: '지방세법 제15조 제1항 제2호 가목',
          isRequired: true,
          checked: false,
        },
      ];

    case 'STANDARD':
    default:
      return [];
  }
}
