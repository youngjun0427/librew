# Architecture & Data Structure (v2)

## UI 방향

하단 탭바 없음. 단일 메인 홈 화면 + 섹션별 관리 화면으로 구성.

## 화면 구조

| 화면 | 주요 구성 | 연결 |
|------|-----------|------|
| 메인 홈 | 장비 세팅 섹션, 레시피 섹션, 브루잉 시작 버튼 | 장비 관리, 레시피 관리, 브루잉 플로우 |
| 장비 관리 | 장비 목록 (종류별 카드) | 장비 등록/수정 |
| 장비 등록/수정 | 종류 선택 + 스펙 입력 폼 | 장비 관리 |
| 레시피 관리 | 카드 리스트, 생성 버튼 | 레시피 상세, 생성/수정 |
| 레시피 상세 | 파라미터, 단계 목록 | 레시피 수정, 브루잉 |
| 레시피 생성/수정 | 파라미터 + 단계 입력 폼 | 레시피 상세 |
| 원두 관리 | 목록, 잔여 용량, 구매 이력 | 원두 등록/수정 |
| 원두 등록/수정 | 원두 정보 입력 폼 | 원두 관리 |
| 추출 기록 | 추출 일지 목록 | 기록 상세 |
| 기록 상세 | 레시피·원두·관능 평가·메모 | - |
| 브루잉 - 장비 확인 | 현재 세팅 확인/변경 | 레시피 선택 |
| 브루잉 - 레시피 선택 | 저장 레시피 카드 목록 | 원두 선택 |
| 브루잉 - 원두 선택 | 원두 목록 + 자동 용량 보정 | 카운트다운 |
| 브루잉 - 카운트다운 | 3초 카운트다운 | 추출 진행 |
| 브루잉 - 추출 진행 | 차수별 물양/타이머/팁/푸어링 추천 | 완료 |
| 브루잉 - 완료 | 총 시간, 요약 | 평가 |
| 브루잉 - 평가 | 관능 평가 + 메모 + 개선 지표 | 홈 |
| 공유 링크 (Post-MVP) | 레시피 미리보기, 가져오기 | 레시피 목록 |

## 파일 구조 (Vite + React Router)

```
src/
  main.tsx                 # 앱 진입점 (ReactDOM.createRoot)
  App.tsx                  # HashRouter + 라우트 정의 + AuthGuard
  index.css                # Tailwind directives

  pages/
    login/
      LoginPage.tsx        # 로그인
    home/
      HomePage.tsx         # 메인 홈 (장비 세팅 + 레시피 + 브루잉 버튼)
    brew/
      EquipmentCheckPage.tsx   # Step 1: 장비 확인/선택
      RecipeSelectPage.tsx     # Step 2: 레시피 선택
      BeanSelectPage.tsx       # Step 3: 원두 선택
      CountdownPage.tsx        # 카운트다운 (3초)
      SessionPage.tsx          # 추출 진행 (단계별 가이드)
      CompletePage.tsx         # 추출 완료
      EvaluatePage.tsx         # 관능 평가 + 메모
    recipe/
      RecipeListPage.tsx   # 레시피 목록
      RecipeDetailPage.tsx # 레시피 상세
      RecipeNewPage.tsx    # 레시피 생성
      RecipeEditPage.tsx   # 레시피 수정
    bean/
      BeanListPage.tsx     # 원두 목록
      BeanDetailPage.tsx   # 원두 상세/수정
      BeanNewPage.tsx      # 원두 등록
    equipment/
      EquipmentListPage.tsx  # 장비 목록
      EquipmentDetailPage.tsx # 장비 상세/수정
      EquipmentNewPage.tsx   # 장비 등록
    log/
      LogListPage.tsx      # 추출 기록 목록
      LogDetailPage.tsx    # 기록 상세
    share/
      ShareViewer.tsx      # 공유 레시피 뷰어 (Post-MVP)

  components/
    RecipeForm.tsx         # 레시피 생성/수정 공유 폼
    BeanForm.tsx           # 원두 생성/수정 공유 폼
    EquipmentForm.tsx      # 장비 생성/수정 공유 폼
    Toggle.tsx             # 커스텀 토글 (웹 Switch 대체)
    LoadingView.tsx        # 전역 로딩 UI
    ErrorView.tsx          # 전역 에러 UI

  hooks/                   # 커스텀 훅 (Firestore 연동, 비즈니스 로직)
  store/                   # Zustand 스토어
  lib/                     # Firebase 초기화, 유틸 함수
  types/                   # TypeScript 타입 정의

index.html                 # Vite 진입 HTML
vite.config.ts
capacitor.config.ts
tailwind.config.js
postcss.config.js
```

## 라우트 구조 (React Router v6, HashRouter)

| 경로 | 컴포넌트 | 인증 필요 |
|------|----------|-----------|
| `/login` | LoginPage | - |
| `/` | HomePage | ✅ |
| `/brew/equipment` | EquipmentCheckPage | ✅ |
| `/brew/recipe` | RecipeSelectPage | ✅ |
| `/brew/bean` | BeanSelectPage | ✅ |
| `/brew/countdown` | CountdownPage | ✅ |
| `/brew/session` | SessionPage | ✅ |
| `/brew/complete` | CompletePage | ✅ |
| `/brew/evaluate` | EvaluatePage | ✅ |
| `/recipe` | RecipeListPage | ✅ |
| `/recipe/new` | RecipeNewPage | ✅ |
| `/recipe/edit/:id` | RecipeEditPage | ✅ |
| `/recipe/:id` | RecipeDetailPage | ✅ |
| `/bean` | BeanListPage | ✅ |
| `/bean/new` | BeanNewPage | ✅ |
| `/bean/:id` | BeanDetailPage | ✅ |
| `/equipment` | EquipmentListPage | ✅ |
| `/equipment/new` | EquipmentNewPage | ✅ |
| `/equipment/:id` | EquipmentDetailPage | ✅ |
| `/log` | LogListPage | ✅ |
| `/log/:id` | LogDetailPage | ✅ |
| `/share/:shareId` | ShareViewer | - |

> HashRouter 사용 이유: Capacitor가 `file://` 프로토콜로 서빙하므로 BrowserRouter 불가.

## Firestore 구조

```
users/{uid}/
  equipment/{equipmentId}
  recipes/{recipeId}
  beans/{beanId}
  brewLogs/{logId}

publicRecipes/{shareId}   ← Post-MVP, 비로그인 접근
```

### equipment 필드

| 필드 | 타입 | 설명 |
|------|------|------|
| id | string | 자동 생성 |
| name | string | 표시 이름 (e.g., "Comandante C40") |
| brand | string | 브랜드 |
| model | string | 모델명 |
| type | string | 'grinder' \| 'kettle' \| 'dripper' \| 'scale' \| 'other' |
| specs | object | 종류별 스펙 (아래 참고) |
| isInCurrentSetup | boolean | 현재 홈 화면 장비 세팅에 포함 여부 |
| notes | string \| null | 메모 |
| createdAt | timestamp | 등록일 |

**specs 종류별 구조:**
```typescript
// grinder
{ clickUnit?: string }               // e.g., "#18 클릭 · Medium Fine"

// kettle
{ capacity?: number, temperature?: number }   // e.g., 0.9L, 93°C

// dripper
{ filterType?: string, capacity?: string }    // e.g., "종이 필터", "1~4인용"

// scale
{ precision?: string, hasTimer?: boolean }    // e.g., "0.1g", true
```

### recipes 필드

| 필드 | 타입 | 설명 |
|------|------|------|
| id | string | 자동 생성 |
| title | string | 레시피 이름 |
| brewMethod | string | 추출 방식 (e.g., "V60", "Chemex") |
| grindSize | number | 분쇄도 |
| waterTemp | number | 물 온도 (°C) |
| coffeeWeight | number | 원두량 (g) |
| waterWeight | number | 물량 (g) |
| filterType | string | 필터 종류 |
| steps | array | 추출 단계 (아래 참고) |
| isPublic | boolean | 공유 여부 (Post-MVP) |
| shareId | string \| null | 공유 링크 ID (Post-MVP) |
| createdAt | timestamp | 생성일 |

**steps 구조:**
```typescript
{
  order: number,         // 차수 (1, 2, 3...)
  waterAmount: number,   // 이번 차수 물양 (ml)
  duration: number,      // 붓는 시간 (초)
  waitTime: number,      // 다음 차수까지 대기 시간 (초)
  pourMethod: string,    // 푸어링 방식 추천 (e.g., "원을 그리며 중앙부터")
  tip: string | null,    // 대기 중 표시할 팁
}
```

### beans 필드

| 필드 | 타입 | 설명 |
|------|------|------|
| id | string | 자동 생성 |
| name | string | 원두명 |
| roastery | string | 로스터리 |
| origin | string | 원산지 |
| variety | string | 품종 |
| roastedAt | timestamp | 로스팅 날짜 |
| purchasedAt | timestamp | 구매일 |
| price | number | 구매 가격 (원) |
| totalWeight | number | 구매 용량 (g) |
| remainingWeight | number | 잔여 용량 (g) |

### brewLogs 필드

| 필드 | 타입 | 설명 |
|------|------|------|
| id | string | 자동 생성 |
| recipeId | string | 사용한 레시피 ID |
| beanId | string \| null | 사용한 원두 ID |
| usedCoffeeWeight | number | 실제 사용 원두량 (g) |
| actualWaterWeight | number | 실제 총 물량 (g) |
| totalBrewTime | number | 실제 추출 소요 시간 (초) |
| sensoryNote | object \| null | {acidity, bitterness, body, aroma, overall} 각 1~5 |
| memo | string \| null | 자유 메모 |
| brewedAt | timestamp | 추출 일시 |

### publicRecipes 필드 (Post-MVP)

| 필드 | 타입 | 설명 |
|------|------|------|
| shareId | string | 문서 ID |
| recipeData | object | 레시피 전체 스냅샷 |
| authorUid | string | 공유한 유저 UID |
| createdAt | timestamp | 공유 생성일 |

## 웹 vs 앱 코드 분리

| 영역 | 공유 여부 | 비고 |
|------|-----------|------|
| Zustand 스토어 | 100% 공유 | 플랫폼 무관 |
| Firebase 연동 코드 | 100% 공유 | SDK 동일 |
| 비즈니스 로직 훅 | 100% 공유 | useBrewTimer, useBeanStock 등 |
| 레이아웃 컴포넌트 | 부분 분기 | 웹: 사이드바 예정, 앱: 단일 스크롤 |
| 네이티브 제스처 UI | 앱 전용 | 스와이프, 햅틱 등 |
| 타이머 / 카운트다운 | 공유 가능 | Web Audio API fallback 처리 필요 |

## 브루잉 플로우 상태 관리

브루잉 진행 중 상태는 `useBrewSessionStore`(Zustand)에서 관리.
화면 이동 시에도 상태 유지. 완료/취소 시 초기화.

```typescript
// useBrewSessionStore 구조
{
  equipmentSnapshot: Equipment[],   // 추출 당시 장비 세팅
  selectedRecipe: Recipe | null,
  selectedBean: Bean | null,
  usedCoffeeWeight: number,
  currentStep: number,
  stepTimings: number[],            // 각 차수 실제 소요 시간
  totalElapsed: number,
  reset: () => void,
}
```
