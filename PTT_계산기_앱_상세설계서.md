# PTT-Calculator (의성군 맞춤형 취등록세 & 등기비용 계산기) 앱 상세설계서

> **문서 버전:** v1.0.0  
> **기준 레퍼런스:** [ansimple/Inheritance-calculator](https://github.com/ansimple/Inheritance-calculator) PWA 아키텍처 및 UI/UX 패턴  
> **세무·법률 도메인 기준:** `취등록세 치트시트 사양서.md` (v1.3.0, 경북 의성군 관할 실정법 및 조례 전수 검증 기준)  
> **목적:** 등기 대상 부동산의 기본 정보를 입력하면 적용 가능한 모든 감면 혜택별 세액 및 공적 비용이 한눈에 도출되고, 상담 시 실시간 체크리스트(Checklist)를 통해 의뢰인 요건 충족 여부를 대조·시뮬레이션하여 최적의 절세 시나리오를 안내할 수 있는 전문 상담용 PWA 웹 애플리케이션 설계

---

## 1. 기획 배경 및 핵심 설계 목표

### 1.1 해결하고자 하는 문제 (Pain Points)
1. **복잡한 감면 요건과 실시간 상담의 한계:**
   - 취등록세는 물건 기본 정보(가액, 면적, 지목 등) 외에도 **생애최초, 신생아 출산, 다자녀(2자녀/3자녀), 자경농민, 귀농인, 농어촌주택개량** 등 감면 조항마다 인적 요건, 보유 이력, 의무 거주/자경 요건이 천차만별입니다.
   - 의뢰인과의 대면/유선 상담 시 "혹시 자녀가 2명 이상이신가요?", "농업 외 소득이 3,700만원 이하이신가요?" 등을 하나하나 묻고 그때마다 세액을 다시 계산하면 상담 흐름이 끊기고 비교 안내가 어렵습니다.
2. **등기 동반 공적 비용의 누락 및 혼선:**
   - 의뢰인은 취득세 본세뿐만 아니라 **농어촌특별세, 지방교육세, 국민주택채권(할인부담금), 대한민국 정부수입인지, 대법원 등기신청수수료**를 포함한 **"등기 시 실제 필요한 총비용"**을 알고 싶어 합니다.
3. **비교 견적 및 사후관리(추징 리스크) 사전 안내 부족:**
   - 감면을 받았을 때 얼마나 절세되는지(예: 일반 460만원 vs 자경농민 230만원, 절세액 230만원)를 즉시 시각적으로 비교하고, 감면 수혜 후 3년 내 매각·증여·임대 금지 등 추징 사후관리 요건을 동시에 인지시켜야 법적 분쟁을 방지할 수 있습니다.

### 1.2 핵심 설계 철학 (Core Design Strategy)
* **One-Input Multi-Output (1회 입력 - 전 감면 시나리오 다중 산출):**
  - 부동산 기본 정보(소재지, 물건유형, 취득원인, 거래가액, 시가표준액, 전용면적, 주택수 등)를 1차 입력하면, 시스템이 **'일반(비감면)' 및 '적용 가능한 모든 감면 시나리오'의 세액과 부대비용을 백그라운드에서 동시 연산**합니다.
* **Interactive Eligibility Audit Card (대화형 감면 자격 진단 매트릭스):**
  - 도출된 시나리오 카드마다 실시간 인터랙티브 체크리스트가 내장되어, 상담자가 고객에게 질문을 던지며 `[v]` 체크할 때마다 **[적용 가능(Eligible)] / [부적격(Ineligible)] / [추가 서류 필요(Pending)]** 상태가 즉시 판정됩니다.
* **Side-by-Side 절세액 비교 및 영수증형 상세 명세 (Receipt Breakdown):**
  - 일반 과세 대비 절세 금액(Δ 절감액)을 직관적인 뱃지로 표시하고, 카드를 클릭하면 취득세·지방교육세·농특세·국민주택채권·인지세·등기수수료로 이어지는 법정 영수증 형태의 상세 내역을 펼쳐 보여줍니다.
* **Consultation Mode & Print/Share Export (상담 리포트 출력 및 공유):**
  - 의뢰인과의 상담 내용을 PDF/인쇄용 견적서나 모바일 메신저 공유 텍스트(또는 클립보드 복사)로 1초 만에 변환하여 발송할 수 있도록 지원합니다.

---

## 2. 시스템 아키텍처 및 PWA 기술 스택

본 설계는 `Inheritance-calculator`의 경량·독립 실행형 웹 애플리케이션 구조를 계승하여 서버리스(Serverless) 및 100% 클라이언트 사이드 오프라인 구동을 보장합니다.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      Client Browser / PWA Shell                         │
├─────────────────────────────────────────────────────────────────────────┤
│  [UI Layer - Tailwind CSS v3.4 + Lucide React + Headless UI]            │
│   ├── App Header & PWA Install Banner                                   │
│   ├── Property Info Input Form (Tabs / Stepper)                         │
│   ├── Multi-Scenario Comparison Dashboard (Cards Grid)                  │
│   ├── Interactive Eligibility Checklist Modal / Drawer                  │
│   ├── Detailed Cost Breakdown Modal (Receipt Modal)                     │
│   └── Consultation Export Panel (Print View / Copy Clipboard)           │
├─────────────────────────────────────────────────────────────────────────┤
│  [State Management & Reactive Store - Zustand / React Hooks]            │
│   ├── propertyInputStore (물건 및 거래 기본 정보 상태 관리)             │
│   ├── eligibilityStore (시나리오별 체크리스트 응답 상태 관리)           │
│   ├── consultationStore (상담 메모, 의뢰인 정보, 선택된 시나리오)        │
│   └── settingsStore (채권 할인율, 인지세/수수료 단가 설정)               │
├─────────────────────────────────────────────────────────────────────────┤
│  [Pure Core Domain Engines (TypeScript 100% Pure Functions)]            │
│   ├── TaxCalculatorEngine (취득세·교육세·농특세 산출 엔진)               │
│   ├── PublicExpenseEngine (국민주택채권·수입인지·등기수수료 엔진)       │
│   ├── ExemptionMatrixEngine (감면 유형별 다중 시뮬레이션 엔진)          │
│   └── VerificationEngine (의성군 관할 읍·면 및 주택수 특례 판정)       │
├─────────────────────────────────────────────────────────────────────────┤
│  [PWA & Offline Infrastructure - vite-plugin-pwa (Workbox)]             │
│   ├── Service Worker (sw.js - CacheFirst for Assets & Google Fonts)     │
│   ├── Web App Manifest (manifest.webmanifest - Standalone Display)      │
│   └── LocalStorage Adapter (임시저장, 최근 상담 이력 보관)              │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.1 기술 스택 정의표
| 영역 | 선정 기술 및 라이브러리 | 선정 사유 |
|---|---|---|
| **Core Framework** | **React 18 / 19 + TypeScript 5.x** | 타입 세이프티 기반 세무 공식의 무오류 보장 및 컴포넌트 재사용 |
| **Build & Dev Tool** | **Vite 6.x** | 초고속 HMR 및 최적화된 번들링 (`Inheritance-calculator` 구조 일치) |
| **PWA Engine** | **vite-plugin-pwa (Workbox v7)** | 네트워크 없는 의성군 관내 출장·현장 상담 시 100% 완전 오프라인 구동 지원 |
| **Styling & Theme** | **Tailwind CSS + Tailwind Animate** | 모바일/태블릿 반응형 UI 구축, 금융·법률 전문성을 주는 Slate/Navy 테마 |
| **State Management** | **Zustand (또는 React Context)** | 가볍고 직관적인 상태 관리, LocalStorage와 연동된 자동 저장(`persist`) |
| **Icons** | **Lucide React** | 세무/부동산/체크리스트 관련 시각적 메타포 제공 |
| **Print / Export** | **Print CSS (@media print) + Canvas/HTML2Canvas** | 상담 결과서 A4 1장 출력 및 모바일 공유 기능 구현 |

---

## 3. 핵심 사용자 흐름 (User Flow & UX Journey)

```
[1단계: 기본 정보 입력]
  - 소재지 선택: 의성군 [읍·면 선택 드롭다운 (18개 읍면)]
  - 물건 유형: 주택 / 농지(전·답·과) / 일반토지(임야·대지) / 상가·건물
  - 취득 원인: 매매(유상) / 상속 / 증여 / 신축 / 분할
  - 거래 금액: 실거래가(매매대금) 및 시가표준액(공시가격)
  - 면적 및 주택수: 전용면적(㎡), 세대 합산 주택수 (1주택/일시적2주택/다주택)
       │
       ▼ (입력과 동시에 실시간 자동 계산 파이프라인 가동)
[2단계: 다중 감면 시나리오 매트릭스 도출 (Multi-Scenario Generation)]
  - 시스템이 물건 유형과 취득 원인에 매핑되는 감면 시나리오를 일괄 연산하여 카드로 나열:
    * Card A: [기본/비감면] 일반 표준 과세
    * Card B: [생애최초] 의성군 인구감소지역 주택 (최대 300만원 공제/전액면제)
    * Card C: [신생아 출산가구] 주택 취득 (최대 500만원 공제/전액면제)
    * Card D: [다자녀 가구] 경북 도세감면 (2자녀 150만원 / 3자녀 300만원)
    * Card E: [자경농민] 농지 취득 (취득세 50% 감면, 농특세 비과세)
    * Card F: [귀농인] 농지 취득 (취득세 50% 감면, 농특세 비과세)
    * Card G: [농어촌주택개량] (최대 280만원 면제)
       │
       ▼ (전문가 상담 및 요건 확인 단계)
[3단계: 실시간 요건 인터랙티브 체크리스트 (Interactive Audit)]
  - 상담자가 의뢰인과 문답하며 해당 감면 카드의 [요건 체크하기] 클릭
  - 팝업/드로어 형태로 법정 요건 3~5개가 나타남:
    * [v] 본인 및 배우자 무주택 여부 (과거 20년 이상 노후농가 처분 이력 등 확인)
    * [v] 실거래가 12억원 이하 충족
    * [v] 취득 후 3개월 내 실거주 개시 및 3년 보유·거주 가능 여부
  - 체크 결과에 따라 카드의 상태가 **'적격 확정(Green)'**, **'조건부 가능(Amber)'**, **'부적격(Red)'**으로 즉각 전환
       │
       ▼
[4단계: 비용 상세 비교 및 영수증 명세 확인 (Comparison & Breakdown)]
  - '일반' 대비 '선택 감면'의 세액 차이(절세 효과) 확인
  - 취득세 + 교육세 + 농특세 + 채권부담금 + 인지세 + 등기수수료 총비용 합계 검토
       │
       ▼
[5단계: 상담 리포트 발송 및 출력 (Export & Report)]
  - 의뢰인 맞춤형 상담 견적서(A4 1장 최적화 레이아웃) 인쇄
  - 카카오톡/문자 전송용 요약 텍스트 클립보드 복사
```

---

## 4. UI/UX 화면 상세 설계 (Screens & Wireframes)

### 4.1 전체 화면 레이아웃 (Layout Composition)
앱은 모바일 단말기(스마트폰), 태블릿(iPad/Galaxy Tab 대면 상담용), PC 데스크톱 화면에 모두 최적화된 반응형 2단 레이아웃(Desktop) 및 탭 스텝(Mobile) 구조를 채택합니다.

* **데스크톱/태블릿 가로 모드:**
  * **좌측 패널 (40%):** 부동산 기본 정보 입력 폼 (고정 스크롤)
  * **우측 패널 (60%):** 감면 시나리오 비교 카드 덱 & 실시간 견적 대시보드
* **모바일 세로 모드:**
  * 상단 고정 탭: `[1. 물건 정보]` | `[2. 감면 비교]` | `[3. 세부 견적]`

---

### 4.2 입력 패널 (Property Info Input Form) 상세 명세

```
┌────────────────────────────────────────────────────────┐
│ 🏛️ 경북 의성군 취등록세 & 등기비용 상담 계산기        │
├────────────────────────────────────────────────────────┤
│ [1. 기본 정보 입력]                                    │
│                                                        │
│ 📍 관할 읍·면 구분                                      │
│ [ 의성읍 ▼ ] (1개 읍, 17개 면 선택)                   │
│  └ [ ] 의성읍 도시지역(주거·상업·공업·녹지) 주택인 경우 체크│
│    *(체크 시 국민주택규모 85㎡, 미체크 시 읍면특례 100㎡ 적용)* │
│                                                        │
│ 🏠 물건 유형                                            │
│ (●) 주택  ( ) 농지(전·답·과)  ( ) 일반토지  ( ) 상가·건물│
│                                                        │
│ 📑 취득 원인                                            │
│ (●) 매매(유상)  ( ) 상속  ( ) 증여  ( ) 신축  ( ) 공유물분할│
│                                                        │
│ 💰 취득 가액 및 시가표준액                              │
│ 실제 거래금액(원): [ 250,000,000                   ]   │
│ 시가표준액(공시가격): [ 180,000,000                 ]   │
│   *(한글 환산 표기: 이억 오천만원 / 일억 팔천만원)*     │
│                                                        │
│ 📐 주거전용면적                                        │
│ 전용면적(㎡): [ 84.95 ] ㎡ (약 25.7평)                 │
│                                                        │
│ 👨‍👩‍👧 세대 주택 수 (취득 후 기준)                        │
│ [ 1주택 (무주택자) ▼ ]                                 │
│  ├ 1주택 (무주택자 매수)                               │
│  ├ 일시적 2주택 (3년 내 종전주택 처분조건)             │
│  ├ 일반 2주택 (비조정 1~3% 일반세율)                  │
│  ├ 3주택 (중과세율 8%)                                 │
│  └ 4주택 이상 / 법인 (중과세율 12%)                    │
│                                                        │
│ ⚙️ 등기 신청 방식                                      │
│ ( ) 서면방문(1.8만)  (●) e-Form(1.5만)  ( ) 전자신청(1만)│
│ 채권 할인율: [ 10.5 ] %                                │
└────────────────────────────────────────────────────────┘
```

#### 필드별 실시간 유효성 검증 및 기본값 처리
1. **읍·면 구분:** 기본값은 의성군 면 지역(17개 면) 특례 적용. 의성읍 선택 시 도시지역 여부 토글 체크박스가 노출됨.
2. **금액 입력:** 숫자 입력 시 실시간으로 천 단위 콤마(`,`) 포맷팅 및 한글 단위(억, 만 원) 자동 렌더링.
3. **취득원인 연동:** '상속' 선택 시 상속인 1가구 1주택 특례 체크박스 활성화, '농지' 선택 시 농지 전용 감면 항목 자동 필터링.

---

### 4.3 감면 시나리오 비교 대시보드 (Multi-Scenario Cards)

물건 정보가 입력되면 우측 화면에 즉시 **적용 가능한 감면 혜택 카드들이 그리드 형태로 나열**됩니다. 각 카드는 기본 세액과 절세 금액, 핵심 자격 요건을 요약해 보여줍니다.

```
┌────────────────────────────────────────────────────────────────────────┐
│ 📊 감면 시나리오 비교 분석 (총 4개 시나리오 도출)                     │
├────────────────────────────────────────────────────────────────────────┤
│ ┌──────────────────────────┐  ┌──────────────────────────┐            │
│ │ [기준] 일반 과세 (비감면)│  │ ⭐ [감면 1] 생애최초 주택│            │
│ ├──────────────────────────┤  ├──────────────────────────┤            │
│ │ 총 등기비용: 3,420,000원 │  │ 총 등기비용:   670,000원 │            │
│ │ 본세(취득세): 2,500,000원│  │ 본세(취득세):         0원│            │
│ │ 교육세:        250,000원 │  │ 교육세:               0원│            │
│ │ 농특세:              0원 │  │ 농특세:               0원│            │
│ │ 등기부대비용:  670,000원 │  │ 등기부대비용:  670,000원 │            │
│ ├──────────────────────────┤  ├──────────────────────────┤            │
│ │ 기준 시나리오            │  │ 💰 절세 효과: 2,750,000원│ (최대 300만)│
│ │ (어떠한 감면도 미적용)   │  │ 상태: [🔍 요건 점검 필요]│            │
│ └──────────────────────────┘  └──────────────────────────┘            │
│ ┌──────────────────────────┐  ┌──────────────────────────┐            │
│ │ 👶 [감면 2] 신생아 출산가구│ │ 👨‍👩‍👧‍👦 [감면 3] 다자녀(2자녀)│          │
│ ├──────────────────────────┤  ├──────────────────────────┤            │
│ │ 총 등기비용:   670,000원 │  │ 총 등기비용: 2,045,000원 │            │
│ │ 본세:                0원 │  │ 본세:        1,250,000원 │            │
│ │ 교육세:              0원 │  │ 교육세:        125,000원 │            │
│ │ 등기부대비용:  670,000원 │  │ 등기부대비용:  670,000원 │            │
│ ├──────────────────────────┤  ├──────────────────────────┤            │
│ │ 💰 절세 효과: 2,750,000원│  │ 💰 절세 효과: 1,375,000원│ (150만 한도)│
│ │ 상태: [🔍 요건 점검 필요]│  │ 상태: [🔍 요건 점검 필요]│            │
│ └──────────────────────────┘  └──────────────────────────┘            │
└────────────────────────────────────────────────────────────────────────┘
```

---

### 4.4 대화형 자격 진단 체크리스트 (Interactive Eligibility Modal/Drawer)

상담자가 카드의 `[🔍 요건 점검 필요]` 버튼을 누르면, **공식 사양서 5장 및 의성군 실무 점검표(07번/08번 서식)에 완벽히 부합하는 팝업 체크리스트**가 열립니다.

#### [화면 예시: 생애최초 주택구입 감면 요건 점검]
```
┌────────────────────────────────────────────────────────┐
│ 📋 생애최초 주택 감면 적격 심사 (의성군 관할)          │
│ 대상 물건: 의성읍 단독주택 (취득가: 2억 5,000만원)     │
├────────────────────────────────────────────────────────┤
│ [1. 인적 요건]                                         │
│ [v] 취득자가 성년(만 19세 이상) 대한민국 국민인가요?   │
│ [v] 본인 및 배우자 모두 과거 주택 소유 사실이 없나요?  │
│     *단, 아래 [무소유 인정 예외]에 해당하면 체크 가능: │
│     ├ [ ] 상속 주택 공유지분 전부 처분 완료            │
│     ├ [ ] 의성군 등 면지역 20년 노후/85㎡이하 단독주택 │
│     │     보유 후 타지역 이주 (3개월 내 처분조건)      │
│     ├ [ ] 20㎡ 이하 소형주택 1호 소유(처분)            │
│     └ [ ] 시가표준액 100만원 이하 주거용 건축물 소유   │
│                                                        │
│ [2. 물적 요건]                                         │
│ [v] 실거래가액 12억원 이하 주택인가요? (현재 2.5억원)  │
│ [v] 유상 매매 취득인가요? (증여, 부담부증여 제외)      │
│                                                        │
│ [3. 사후관리 준수 동의 (추징 방지 확인)]              │
│ [v] 취득일로부터 3개월 이내에 상시 전입 거주하나요?    │
│ [v] 취득일로부터 3년 동안 매각·증여·임대(전월세) 없이│
│     상시 거주를 유지할 수 있나요?                      │
├────────────────────────────────────────────────────────┤
│ 🟢 판정 결과: [적격 확정 - 취득세 전액 면제 (300만원 한도)]│
│  * 근거: 지방세특례제한법 제36조의3 제1항 제1호 라목    │
│  * 인구감소지역 특례로 최소납부세제 배제 (100% 면제)   │
│                                                        │
│ [ 취소 ]                            [ 이 감면으로 확정 ]│
└────────────────────────────────────────────────────────┘
```

---

### 4.5 영수증형 상세 비용 명세서 (Receipt Breakdown Modal)

선택된 시나리오에 대해 세무사·법무사 사무소 견적서 수준의 세부 항목이 1원 단위까지 분해되어 표시됩니다.

```
┌────────────────────────────────────────────────────────┐
│ 🧾 등기 비용 상세 산출 명세서                         │
│ 물건지: 경북 의성군 의성읍 / 매매 250,000,000원        │
│ 적용 감면: 생애최초 주택 취득세 감면 (인구감소지역 300만원)│
├────────────────────────────────────────────────────────┤
│ [A. 지방세 세액 내역]                                  │
│ 1. 취득세 (본세)                                       │
│    - 산출세액 (2.5억 × 1.0%):          2,500,000원     │
│    - 감면세액 (생애최초 100% 면제):   -2,500,000원     │
│    - 결정세액:                                  0원     │
│ 2. 지방교육세                                          │
│    - 산출세액 (취득세 본세의 10%):        250,000원     │
│    - 본세 감면에 따른 면제:              -250,000원     │
│    - 납부세액:                                  0원     │
│ 3. 농어촌특별세                                        │
│    - 전용 84.95㎡ (국민주택규모 이하):       비과세     │
│    - 납부세액:                                  0원     │
│ ────────────────────────────────────────────────────── │
│ 🔹 지방세 납부 합계:                            0원     │
├────────────────────────────────────────────────────────┤
│ [B. 등기 동반 공적 비용 내역]                          │
│ 4. 제1종 국민주택채권 매입                             │
│    - 시가표준액: 180,000,000원                          │
│    - 기타지역 매입률 (1.6억~2.6억): 18/1,000 (1.8%)    │
│    - 법정 채권 매입금액: 3,240,000원                   │
│    - 은행 즉시할인 매도 본인부담금(10.5%): 340,200원   │
│ 5. 대한민국 정부수입인지                               │
│    - 매매대금 1억 초과 ~ 10억 이하:       150,000원     │
│ 6. 대법원 등기신청수수료                               │
│    - e-Form 전자표준양식 신청:             15,000원     │
│ ────────────────────────────────────────────────────── │
│ 🔹 등기 공적비용 합계:                    505,200원     │
├────────────────────────────────────────────────────────┤
│ 🏆 총 등기 소요 예상 비용:                505,200원     │
│ 💡 비감면 일반 과세 대비 총 절세액:      2,750,000원     │
├────────────────────────────────────────────────────────┤
│ [ 🖨️ 견적서 인쇄 ]  [ 📋 카카오톡 공유 텍스트 복사 ]  │
└────────────────────────────────────────────────────────┘
```

---

## 5. 핵심 계산 엔진 및 데이터 모델 상세 설계 (TypeScript)

### 5.1 데이터 모델 인터페이스 (`types/calculator.ts`)

```typescript
/**
 * 1. 행정구역 및 물건 기본 타입
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
 * 2. 감면 시나리오 열거형
 */
export type ScenarioId = 
  | 'STANDARD'               // 일반 표준 과세 (비감면)
  | 'FIRST_HOME'             // 생애최초 주택 구입 (의성군 인구감소지역 300만원 한도)
  | 'NEWBORN_BABY'           // 신생아 출산가구 1주택 (최대 500만원 한도)
  | 'MULTI_CHILD_2'          // 경북 도세감면: 2자녀 가구 주택 (최대 150만원)
  | 'MULTI_CHILD_3'          // 경북 도세감면: 3자녀 가구 주택 (최대 300만원)
  | 'FARMER_ACQUISITION'     // 2년 이상 자경농민 농지 취득 (취득세 50% 경감)
  | 'RETURN_TO_FARM'         // 귀농인 농지 취득 (취득세 50% 경감)
  | 'RURAL_HOUSE_RENOVATION' // 농어촌주택개량사업 (최대 280만원 한도)
  | 'INHERITANCE_1HOUSE_SPECIAL'; // 무주택 세대 1가구1주택 상속 특례 (0.8%)

/**
 * 3. 계산기 입력 폼 데이터 모델
 */
export interface PropertyCalculationInput {
  eupMyeon: UiseongEupMyeon;
  isUiseongUrbanArea: boolean;      // 의성읍 도시지역 여부 (체크 시 85㎡ 기준, 미체크 시 100㎡ 기준)
  propertyType: PropertyType;
  acquisitionCause: AcquisitionCause;
  purchasePrice: number;            // 실제 취득금액 (원)
  officialStandardPrice: number;    // 시가표준액 / 공시가격 (원)
  exclusiveAreaSqm: number;         // 주거전용면적 (㎡)
  ownedHousingCount: number;        // 취득 후 세대 소유 주택수 (1, 2, 3, 4)
  isTemporaryTwoHomes: boolean;     // 일시적 2주택 여부 (3년 내 처분)
  isCorporate: boolean;             // 매수자 법인 여부
  registrationMethod: RegistrationMethod; // 등기 신청 방식
  bondDiscountRate: number;         // 국민주택채권 일자별 할인율 (%) (기본값 10.0%)
}

/**
 * 4. 시나리오별 체크리스트 문항 및 판정 인터페이스
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
  | 'PENDING'      // 미확인 (기본 상태)
  | 'ELIGIBLE'     // 요건 모두 충족 (적격)
  | 'INELIGIBLE';  // 필수 요건 불충족 (부적격)

/**
 * 5. 단일 시나리오 계산 결과 모델
 */
export interface ScenarioCalculationResult {
  scenarioId: ScenarioId;
  scenarioName: string;
  scenarioDescription: string;
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
    totalLocalTax: number;          // 지방세 합계 (원)
  };
  registrationExpenses: {
    bondRequiredAmount: number;     // 국민주택채권 액면 발행액 (1만원 단위 단수처리)
    bondPaymentAmount: number;      // 채권 즉시매도 본인부담금 (원)
    stampTax: number;               // 정부수입인지세 (원)
    registrationFee: number;        // 대법원 등기신청수수료 (원)
    totalExpenses: number;          // 공적 부대비용 합계 (원)
  };
  grandTotal: number;               // 총 납부 소요 비용 (지방세 + 공적비용)
  taxSavingsAmount: number;         // 기준 일반과세 대비 총 절세액 (원)
}
```

---

### 5.2 다중 감면 시나리오 생성 및 계산 파이프라인

```typescript
/**
 * src/engines/ExemptionMatrixEngine.ts
 * 부동산 기본 입력값을 받아 적용 가능한 모든 시나리오를 동시 계산하는 엔진
 */
export function generateAllScenarios(
  input: PropertyCalculationInput
): ScenarioCalculationResult[] {
  const results: ScenarioCalculationResult[] = [];

  // 1. 기준 시나리오: 일반 과세 (비감면)
  const standardResult = calculateSingleScenario(input, 'STANDARD');
  results.push(standardResult);

  // 2. 주택 유상매매인 경우 가능한 감면 후보군 동시 생성
  if (input.propertyType === 'HOUSING' && input.acquisitionCause === 'SALE' && !input.isCorporate) {
    // 생애최초 (의성군 인구감소지역 300만원 한도)
    results.push(calculateSingleScenario(input, 'FIRST_HOME', standardResult.grandTotal));
    // 신생아 출산가구 1주택 (500만원 한도)
    results.push(calculateSingleScenario(input, 'NEWBORN_BABY', standardResult.grandTotal));
    // 다자녀 2자녀 (150만원 한도)
    results.push(calculateSingleScenario(input, 'MULTI_CHILD_2', standardResult.grandTotal));
    // 다자녀 3자녀 (300만원 한도)
    results.push(calculateSingleScenario(input, 'MULTI_CHILD_3', standardResult.grandTotal));
  }

  // 3. 농지 매매인 경우 감면 후보군 생성
  if (input.propertyType === 'AGRICULTURAL_LAND' && input.acquisitionCause === 'SALE' && !input.isCorporate) {
    // 2년 이상 자경농민 50% 감면
    results.push(calculateSingleScenario(input, 'FARMER_ACQUISITION', standardResult.grandTotal));
    // 귀농인 50% 감면
    results.push(calculateSingleScenario(input, 'RETURN_TO_FARM', standardResult.grandTotal));
  }

  // 4. 농어촌주택 개량(신축/개축)
  if (input.propertyType === 'HOUSING' && input.acquisitionCause === 'NEW_CONSTRUCTION') {
    results.push(calculateSingleScenario(input, 'RURAL_HOUSE_RENOVATION', standardResult.grandTotal));
  }

  // 5. 상속 주택인 경우 무주택 1가구 1주택 상속 특례
  if (input.propertyType === 'HOUSING' && input.acquisitionCause === 'INHERITANCE') {
    results.push(calculateSingleScenario(input, 'INHERITANCE_1HOUSE_SPECIAL', standardResult.grandTotal));
  }

  return results;
}
```

---

### 5.3 세목별 정밀 산출 규칙 (`TaxCalculatorEngine.ts`)

1. **국민주택규모 판정 (농특세 비과세 분기):**
   ```typescript
   export function isNationalHousingSize(input: PropertyCalculationInput): boolean {
     // 의성읍 도시지역인 경우 85㎡, 그 외 의성군 17개 면 전역 및 의성읍 비도시지역은 100㎡ 기준
     const threshold = (input.eupMyeon === 'UISEONG_EUP' && input.isUiseongUrbanArea) ? 85 : 100;
     return input.exclusiveAreaSqm <= threshold;
   }
   ```
2. **생애최초 300만원 최소납부세제 배제 계산:**
   ```typescript
   case 'FIRST_HOME': {
     // 지특법 제36조의3 제1항 제1호 라목 (인구감소지역)
     // 지특법 제177조의2 제1항 단서 제2호에 따라 최소납부세제(85%) 배제 -> 100% 면제
     if (calculatedBaseTax <= 3_000_000) {
       exemptBaseTax = calculatedBaseTax;
     } else {
       exemptBaseTax = 3_000_000;
     }
     break;
   }
   ```
3. **국민주택채권 액면가 및 단수처리 (`PublicExpenseEngine.ts`):**
   ```typescript
   export function calculateHousingBond(
     officialStandardPrice: number,
     propertyType: PropertyType,
     discountRate: number
   ): { bondRequiredAmount: number; bondPaymentAmount: number } {
     let rate = 0;
     if (propertyType === 'HOUSING') {
       if (officialStandardPrice < 20_000_000) rate = 0;
       else if (officialStandardPrice < 50_000_000) rate = 0.013;
       else if (officialStandardPrice < 100_000_000) rate = 0.014;
       else if (officialStandardPrice < 160_000_000) rate = 0.016;
       else if (officialStandardPrice < 260_000_000) rate = 0.018;
       else if (officialStandardPrice < 600_000_000) rate = 0.021;
       else rate = 0.026;
     }
     const rawAmount = officialStandardPrice * rate;
     // 5천원 미만 절사, 5천원 이상 1만원 올림
     const remainder = rawAmount % 10000;
     const bondRequiredAmount = remainder >= 5000 
       ? rawAmount - remainder + 10000 
       : rawAmount - remainder;
     const bondPaymentAmount = Math.round(bondRequiredAmount * (discountRate / 100));
     return { bondRequiredAmount, bondPaymentAmount };
   }
   ```

---

## 6. PWA(Progressive Web App) 오프라인 및 설치 사양

`Inheritance-calculator`의 PWA 설정을 그대로 계승하여, 현장 출장이나 인터넷이 불안정한 의성군 관내 면 지역 읍내·현장에서도 완전한 독립 구동을 보장합니다.

### 6.1 `manifest.webmanifest` 설정 사양
```json
{
  "name": "의성군 취등록세 & 등기비용 상담 계산기",
  "short_name": "취등록세계산기",
  "description": "경북 의성군 관할 부동산·농지 취등록세 및 등기비용 다중 감면 시뮬레이션 PWA",
  "theme_color": "#1e293b",
  "background_color": "#0f172a",
  "display": "standalone",
  "orientation": "portrait",
  "scope": "/PTT-Calculator/",
  "start_url": "/PTT-Calculator/",
  "icons": [
    {
      "src": "pwa-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "pwa-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    },
    {
      "src": "pwa-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

### 6.2 오프라인 캐싱 및 Service Worker 정책 (`vite.config.ts`)
* **Workbox 캐시 전략:**
  * HTML / JS / CSS: `StaleWhileRevalidate` (최신 업데이트 자동 반영)
  * 정적 자산(폰트, 아이콘, 법정 서식 PDF/HWP): `CacheFirst` (오프라인 즉시 로딩)
* **PWA 자동 갱신 배너 (Update Prompt):**
  * 세법 개정이나 요율 조례 개정 시 클라이언트 캐시를 즉시 갱신할 수 있도록 신규 서비스 워커 감지 시 `"새로운 세법 개정판이 배포되었습니다. [새로고침]"` 토스트 알림 노출.

---

## 7. 대고객 상담 및 리포팅 기능 사양

### 7.1 인쇄용 A4 견적 리포트 (`@media print` CSS Layout)
* 화면의 입력 폼 및 네비게이션 버튼은 인쇄 시 숨김(`print:hidden`) 처리.
* 상단에 **[부동산 등기비용 및 취등록세 상담 견적서]** 공식 타이틀, 상담일자, 담당 상담자 서명란 출력.
* 물건 정보 요약표, 선택된 감면 시나리오의 항목별 세액 명세, 사후관리 주의사항(3년 내 추징 요건)을 A4 1장에 깔끔하게 정돈하여 출력.

### 7.2 카카오톡/문자 상담용 원클릭 요약 텍스트 생성 포맷
상담자가 `[📋 카톡 상담내용 복사]` 버튼을 누르면 클립보드에 아래 포맷의 텍스트가 자동 복사됩니다:

```text
[경북 의성군 부동산 등기비용 상담 안내]
■ 의뢰인 물건 정보
 - 소재지: 경북 의성군 의성읍
 - 물건 구분: 주택 (전용 84.95㎡)
 - 매매대금: 2억 5,000만원 (시가표준액 1억 8,000만원)

■ 세무 검토 및 감면 적용 결과
▶ 추천 시나리오: 생애최초 주택 취득 감면 (인구감소지역 특례)
 - 일반 취득세: 2,750,000원 (본세 250만 + 교육세 25만)
 - 감면 혜택액: -2,750,000원 (전액 면제, 300만원 한도)
 - 결정 취득세: 0원

■ 등기 시 최종 준비 비용: 총 505,200원
 1. 취등록세 합계: 0원
 2. 국민주택채권 매입할인액: 340,200원 (할인율 10.5% 기준)
 3. 정부수입인지: 150,000원
 4. 등기신청수수료: 15,000원 (e-Form 기준)
 * 일반 대비 총 절세액: 2,750,000원

■ 사후관리 필수 유의사항 (추징 방지)
 - 취득일로부터 3개월 이내 전입 및 상시 거주 시작 필수
 - 취득일로부터 3년 이내 매각·증여·임대(전월세) 금지
```

---

## 8. 디렉터리 구조 및 모듈 분할 설계

```
PTT-Calculator/
├── public/
│   ├── icon.svg
│   ├── pwa-192x192.png
│   ├── pwa-512x512.png
│   └── apple-touch-icon.png
├── official_documents/             # 법정 서식 및 점검표 원본
│   ├── 01_취득세_신고서...hwp
│   ├── 07_의성군_생애최초_점검표.pdf
│   └── ...
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Header.tsx          # 앱 헤더 및 오프라인 인디케이터
│   │   │   ├── InstallPwaModal.tsx # PWA 앱 설치 유도 모달
│   │   │   └── NumberInput.tsx     # 천단위 콤마 및 한글 단위 변환 인풋
│   │   ├── input/
│   │   │   ├── PropertyForm.tsx    # 부동산 기본 정보 입력 폼
│   │   │   └── EupMyeonSelector.tsx# 의성군 18개 읍면 선택기
│   │   ├── dashboard/
│   │   │   ├── ScenarioCard.tsx    # 시나리오별 세액/절세 뱃지 카드
│   │   │   ├── ScenarioGrid.tsx    # 다중 카드 나열 대시보드
│   │   │   └── ComparisonChart.tsx # 일반 vs 감면 비용 비교 바차트
│   │   ├── checklist/
│   │   │   ├── ChecklistDrawer.tsx # 대화형 요건 체크리스트 드로어
│   │   │   └── ChecklistItem.tsx   # 단일 질문 체크 항목 및 도움말
│   │   ├── report/
│   │   │   ├── ReceiptModal.tsx    # 1원 단위 영수증형 세부 명세 모달
│   │   │   ├── PrintReportView.tsx # A4 인쇄용 스타일 컴포넌트
│   │   │   └── ShareButton.tsx     # 카톡/문자 클립보드 복사 버튼
│   ├── engines/
│   │   ├── TaxCalculatorEngine.ts  # 취득세·교육세·농특세 연산 코어
│   │   ├── PublicExpenseEngine.ts  # 채권·인지세·등기수수료 연산 코어
│   │   ├── ExemptionMatrixEngine.ts# 다중 감면 시나리오 생성 파이프라인
│   │   └── ChecklistFactory.ts     # 시나리오별 법정 질문지 생성 팩토리
│   ├── stores/
│   │   ├── useCalculatorStore.ts   # 입력값 및 선택된 시나리오 상태
│   │   └── useChecklistStore.ts    # 사용자 체크리스트 응답 상태
│   ├── types/
│   │   └── calculator.ts           # 전체 TypeScript 데이터 인터페이스
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── manifest.webmanifest
├── vite.config.ts
├── tailwind.config.js
└── package.json
```

---

## 9. 단계별 개발 및 검증 로드맵

1. **1단계: 코어 도메인 엔진 개발 및 단위 테스트 (Unit Tests)**
   - `TaxCalculatorEngine.ts` 및 `PublicExpenseEngine.ts` 구현
   - 사양서의 실증 검증 데이터(일반 매매, 자경농민 농지, 생애최초 300만원 한도 주택, 3주택 중과 주택) 10여 개 케이스 Vitest 테스트 구축
2. **2단계: Zustand 상태 관리 및 체크리스트 팩토리 구현**
   - 시나리오별(생애최초, 신생아, 다자녀, 자경농민, 귀농인 등) 법정 질문지 트리 구성
   - 체크 여부에 따른 실시간 `ELIGIBLE` / `INELIGIBLE` 판정 상태 머신 작성
3. **3단계: 반응형 UI 컴포넌트 개발**
   - Tailwind CSS 기반 모바일 친화적 입력 폼 및 시나리오 비교 카드 덱 구현
   - 영수증 모달 및 카카오톡 텍스트 클립보드 내보내기 구현
4. **4단계: PWA 패키징 및 오프라인 배포**
   - `vite-plugin-pwa` 설정 및 Service Worker 캐싱 검증
   - GitHub Pages 자동 배포 CI/CD 파이프라인 구성
