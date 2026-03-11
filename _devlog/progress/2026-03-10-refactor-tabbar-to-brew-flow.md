---
date: 2026-03-10
category: progress
tags: [리팩토링, ExpoRouter, Zustand, TypeScript, 다크테마, 장비관리]
blog_ready: true
---

## 주제

탭바 기반 MVP를 홈 허브 + 브루잉 플로우 구조로 전면 리팩토링한 작업 기록

---

## 상황 / 배경

기획을 전면 수정한 뒤 기존 코드를 새 구조에 맞게 다시 짰다. 삭제한 파일이 6개, 새로 만든 파일이 20개가 넘는 꽤 큰 리팩토링이었다. TypeScript 오류 없이 마무리하는 게 목표였고, 구조는 단순하게 유지하는 게 원칙이었다.

---

## 작업 범위

### 삭제
- `app/(tabs)/` 디렉토리 전체 (대시보드, 레시피목록, 원두목록, 추출도우미 4개 화면)
- `app/sensory.tsx` (브루잉 플로우의 evaluate.tsx로 통합)

### 신규 생성

**장비 관리 (3화면 + 1컴포넌트)**
- `app/equipment/index.tsx` — 장비 목록
- `app/equipment/new.tsx` — 장비 등록
- `app/equipment/[id].tsx` — 장비 상세 / 수정 / 현재 세팅 토글
- `components/EquipmentForm.tsx` — 장비 폼 (종류별 동적 필드)

**브루잉 플로우 (7화면)**
- `app/brew/_layout.tsx` — 브루잉 전용 Stack 레이아웃
- `app/brew/equipment.tsx` — 현재 장비 확인
- `app/brew/recipe.tsx` — 레시피 선택
- `app/brew/bean.tsx` — 원두 선택 + 원두량 자동 보정
- `app/brew/countdown.tsx` — 3초 카운트다운
- `app/brew/session.tsx` — 단계별 추출 진행
- `app/brew/complete.tsx` — 추출 완료 요약
- `app/brew/evaluate.tsx` — 관능 평가 + 메모

**관리 화면**
- `app/index.tsx` — 메인 홈 (전면 재작성)
- `app/recipe/index.tsx` — 레시피 목록 (탭에서 이동)
- `app/bean/index.tsx` — 원두 목록 (탭에서 이동)
- `app/log/index.tsx` — 추출 기록 목록 (신규)
- `app/log/[id].tsx` — 기록 상세 (신규)

**데이터 레이어**
- `store/useEquipmentStore.ts`
- `store/useBrewSessionStore.ts`
- `hooks/useEquipment.ts`

### 수정
- `types/index.ts` — Equipment 타입, RecipeStep 필드 추가, BrewLog 재정의
- `components/RecipeForm.tsx` — step 필드 3개 추가
- `components/BeanForm.tsx`, `LoadingView.tsx`, `ErrorView.tsx` — 다크 테마
- `app/recipe/new.tsx`, `edit/[id].tsx`, `[id].tsx` — 새 step 구조, 브루잉 링크 변경
- `hooks/useBrewLogs.ts` — 새 BrewLog 타입 반영
- `app/_layout.tsx` — `(tabs)` 제거, 단순 Stack

---

## 구현하면서 고민했던 것들

### Expo Router 중첩 Stack 구조

브루잉 플로우를 `app/brew/` 디렉토리로 묶고, `_layout.tsx`에 `<Stack>`을 두면 루트 Stack과 중첩된 Stack이 생긴다. 걱정했던 건 중첩 네비게이션이 예상대로 동작하는지였다.

결론적으로 Expo Router는 이 구조를 자연스럽게 처리한다. `app/brew/_layout.tsx`의 Stack이 brew 디렉토리 내 화면들을 담당하고, 루트 `_layout.tsx`의 Stack에는 `brew` 디렉토리 자체가 하나의 화면처럼 들어간다. 사용자 입장에선 매끄럽게 이어진다.

한 가지 주의할 점은 `router.replace()`와 `router.push()`의 선택이다. 카운트다운 → 세션 → 완료로 이어질 때는 `replace()`를 써서 뒤로가기 스택이 쌓이지 않게 했다. 추출 중에 실수로 뒤로가기 눌렀을 때 카운트다운으로 돌아가면 안 되니까.

```typescript
// countdown.tsx — 3초 후 세션으로 replace
router.replace("/brew/session");

// session.tsx — 마지막 단계 완료 시
router.replace("/brew/complete");

// evaluate.tsx — 저장 후 홈으로
router.replace("/");
```

### useBrewSessionStore — 브루잉 세션 상태 관리

화면이 7개로 분리되면서 단계 간 상태 공유가 필요해졌다. URL params로 전달하는 방법도 있지만, 레시피 객체 전체를 URL에 담는 건 현실적이지 않다.

Zustand로 `useBrewSessionStore`를 만들어 선택된 레시피, 원두, 원두량, 총 추출 시간을 저장했다. 플로우가 완료되거나 취소될 때 `reset()`으로 초기화한다.

```typescript
// 레시피 상세에서 바로 추출 시작하는 케이스
const handleStartBrew = () => {
  setSelectedRecipe(recipe);   // 스토어에 미리 세팅
  router.push("/brew/equipment"); // equipment 확인부터 시작
};
```

레시피 상세 → 추출 시작 케이스에서 레시피를 미리 스토어에 넣어두면, `/brew/recipe` 화면에서 이미 선택된 상태로 보여준다. 사용자는 바로 확인하고 다음 단계로 넘어갈 수 있다.

### Equipment 타입 설계

장비 종류마다 스펙이 다르다. 그라인더는 클릭 수, 케틀은 온도·용량, 드리퍼는 필터 종류·인원, 저울은 정밀도·타이머 내장 여부.

처음엔 discriminated union을 고려했다:
```typescript
type EquipmentSpecs =
  | { type: "grinder"; clickUnit?: string }
  | { type: "kettle"; capacity?: number; temperature?: number }
  // ...
```

하지만 Firestore에서 읽어올 때 `type` 필드를 포함한 스펙 객체를 역직렬화하는 과정이 복잡해진다. 그리고 장비 폼에서 타입별로 다른 Controller를 렌더링하는 건 어차피 `watch("type")`으로 분기하는 거라, 타입 레벨에서의 정교함이 실용적인 이득을 주지 않았다.

결국 flat object로 정리했다:
```typescript
interface EquipmentSpecs {
  clickUnit?: string;
  capacity?: number;
  temperature?: number;
  filterType?: string;
  servings?: string;
  precision?: string;
  hasTimer?: boolean;
}
```

모든 필드가 optional이고, 장비 타입에 맞는 필드만 채워진다. 타입 안전성보다 실용성이 우선인 경우였다.

### RecipeStep 필드 추가와 하위 호환성

기존 `RecipeStep`은 `{ order, waterAmount, tip }` 세 필드였다. 새로 추가한 `duration`, `waitTime`, `pourMethod`는 기존 Firestore 데이터에 없다.

브루잉 세션 화면에서 이 필드들을 `?? 0` / `?? ""`로 방어 처리했다:
```typescript
// session.tsx
{(currentStep.duration > 0 || currentStep.waitTime > 0) && (
  // 둘 다 0이면 블록 자체가 안 보임
)}
```

새 필드가 없는 옛날 레시피를 써도 기존 기능(물량 표시, 팁 표시)은 그대로 동작하고, 새 필드가 있는 레시피는 추가 정보가 보인다. 마이그레이션 없이 자연스럽게 업그레이드되는 구조.

### 원두 자동 보정 로직

브루잉 3단계(원두 선택)에서 원두를 선택하면 사용량이 자동으로 조정된다:

```typescript
useEffect(() => {
  if (!selectedBean) return;
  const target = selectedRecipe?.coffeeWeight ?? 0;
  const adjusted = Math.min(target, selectedBean.remainingWeight);
  const val = adjusted > 0 ? adjusted : target;
  setCoffeeInput(String(val));
  setUsedCoffeeWeight(val);
}, [selectedBean?.id]);
```

레시피에 15g이 필요한데 원두 잔여량이 12g이면 12g으로 자동 설정된다. 사용자가 직접 수정할 수도 있다. `selectedBean?.id`를 의존성으로 쓴 게 포인트 — bean 객체 전체를 넣으면 리렌더마다 트리거될 수 있다.

### 다크 테마 일관성

기존 코드는 라이트 테마(`bg-gray-50`, `text-gray-900`, `bg-blue-500`)였다. 새 UI 방향이 다크였기 때문에 모든 신규 파일을 다크 테마로 작성하고, 기존 컴포넌트들도 함께 전환했다.

일관성 규칙을 정해놓고 썼다:
- 배경: `bg-zinc-900`
- 카드: `bg-zinc-800`
- 아이콘 배경: `bg-zinc-700`
- 텍스트: `text-white` / `text-zinc-400` / `text-zinc-500`
- 액센트: `bg-amber-400` / `text-amber-400`
- CTA 버튼 텍스트: `text-zinc-900` (amber 위에 어두운 텍스트)

Amber 400을 액센트로 쓴 건 커피 색깔과 연결되는 시각적 연상 때문이기도 하다.

---

## 결과

```
TypeScript 에러: 0개
신규 파일: 20개
삭제 파일: 6개
수정 파일: 10개
```

구조가 명확해졌다. 브루잉 플로우는 완전히 독립적인 스택이고, 홈은 현재 세팅의 snapshot이며, 관리 화면들은 각자의 경로에 있다. 어느 화면에서 무엇을 해야 하는지 코드만 봐도 바로 파악된다.

---

## 다음 작업

- [ ] Firestore 보안 규칙에 `equipment` 컬렉션 추가
- [ ] `share/[shareId].tsx` 다크 테마 전환
- [ ] `app/login.tsx` 다크 테마 전환
- [ ] `lib/share.ts` — Post-MVP 범위로 정리
- [ ] 배포 준비 (EAS build, Firebase Hosting)

---

## 배운 점

파일을 많이 만드는 것보다 각 파일의 책임을 명확히 하는 게 먼저다. 이번 리팩토링에서 파일은 늘었지만 오히려 코드가 단순해졌다. 탭 화면 하나가 여러 역할을 담당하던 걸 각자의 화면으로 분리했더니, 각 파일이 짧아지고 읽기 쉬워졌다.

---

## 블로그 포스트 아이디어

- "Expo Router 중첩 Stack — 멀티스텝 플로우 구현하기"
- "Zustand로 멀티스텝 플로우 상태 관리하기"
- "리팩토링 로그: 탭바 제거부터 브루잉 플로우까지"
