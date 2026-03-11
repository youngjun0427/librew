# 코드 품질 기준

3년차 프론트엔드 개발자 포트폴리오 수준을 유지하기 위한 상세 기준.
CLAUDE.md에 요약본이 있으며, 이 문서는 구현 판단이 필요할 때 참조한다.

---

## 1. 비동기 / 데이터 패턴

### Firestore 훅 구조
```typescript
// ✅ 올바른 패턴
export function useRecipes() {
  const { recipes, isLoading, error, setRecipes, setLoading, setError } = useRecipeStore();

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    return onSnapshot(q,
      (snap) => { setRecipes(...); setLoading(false); },
      (err)  => { setError(err.message); setLoading(false); }
    );
  }, [user]);
}

// ❌ 잘못된 패턴 — 에러/로딩 없음
export function useRecipes() {
  useEffect(() => {
    return onSnapshot(q, (snap) => setRecipes(...));
  }, [user]);
}
```

### 스크린 로딩/에러 처리
```tsx
// ✅ 올바른 패턴
const { recipes, isLoading, error } = useRecipes();
if (isLoading) return <LoadingView />;
if (error) return <ErrorView message={error} />;

// 병렬 로딩 (여러 훅)
const isLoading = recipesLoading || beansLoading;
const error = recipesError || beansError;
```

---

## 2. 폼 UX

### 제출 상태 처리
```tsx
// ✅ React Hook Form isSubmitting 활용
const { formState: { isSubmitting } } = useForm();

<button
  disabled={isSubmitting}
  className={isSubmitting ? "bg-amber-300" : "bg-amber-400"}
  onClick={handleSubmit(onSubmit)}
>
  {isSubmitting ? "저장 중..." : "저장"}
</button>

// ❌ 잘못된 패턴 — 중복 제출 가능
<button onClick={handleSubmit(onSubmit)}>저장</button>
```

### 필수 필드 검증
- `rules: { required: "필드명을 입력해주세요" }` 로 RHF 검증 추가
- 에러 메시지는 필드 하단에 붉은색 텍스트로 표시

---

## 3. 타입 안전성

### Firestore 데이터 처리
```typescript
// ⚠️ 현재 방식 — 단순 캐스팅, 런타임 위험
snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Recipe)

// ✅ 개선 방향 — 필드 존재 검증 추가 (Zod 또는 타입가드)
// 당장 Zod 추가가 부담스러우면, 최소한 필수 필드 체크:
function toRecipe(doc: DocumentSnapshot): Recipe | null {
  const data = doc.data();
  if (!data?.title || !data?.brewMethod) return null;
  return { id: doc.id, ...data } as Recipe;
}
```

### any 금지
- `any` 타입 사용 금지. 불확실하면 `unknown` + 타입가드로.

---

## 4. 컴포넌트 설계

### 추출 기준
| 상황 | 결정 |
|------|------|
| 2개 이상 화면에서 동일 UI 사용 | `components/`로 추출 |
| 단일 화면 전용 서브 컴포넌트 | 같은 파일 하단 정의 |
| 500줄 초과 파일 | 분리 검토 |
| 비즈니스 로직 포함 컴포넌트 | 훅으로 분리 |

### 현재 컴포넌트 구조
```
src/components/
  RecipeForm.tsx      — 레시피 생성/수정 공유 폼
  BeanForm.tsx        — 원두 생성/수정 공유 폼
  EquipmentForm.tsx   — 장비 생성/수정 공유 폼
  Toggle.tsx          — 커스텀 토글 (웹 Switch 대체)
  LoadingView.tsx     — 전역 로딩 UI
  ErrorView.tsx       — 전역 에러 UI
```

---

## 5. 성능 의식

### Firestore 리스너 중복 문제 (현재 미해결, 추후 개선)
- 현재: `useRecipes()`를 여러 스크린에서 호출 시 리스너 중복 생성
- 이상적 해결: 루트 레이아웃에서 단 1회 구독, 스토어에 저장, 스크린은 스토어만 읽기
- 현재 규모에서는 기능 영향 없으나, 배포 전 개선 권장

### 리스트 렌더링
- `key` prop 필수 (`.map()` 사용 시 고유 ID 사용)
- 긴 리스트는 가상화 고려 (현재 규모에서는 불필요)

---

## 6. 보안

### Firestore 보안 규칙 (`firestore.rules`)
```
users/{uid}/**     → request.auth.uid == uid 인 경우만 read/write
publicRecipes/**   → read: 누구나, write: 인증된 사용자만
```
배포 시 반드시 `firebase deploy --only firestore:rules` 실행.

---

## 7. 포트폴리오 체크리스트

배포 전 최종 확인:
- [ ] 모든 비동기 스크린에 로딩/에러 처리
- [ ] 모든 폼 제출 버튼 isSubmitting disabled
- [ ] Firestore 보안 규칙 배포
- [ ] README.md 작성 (스크린샷, 기술 스택, 실행 방법)
- [ ] 환경변수 `.env.example` 최신화
- [ ] TypeScript 에러 0개 (`tsc --noEmit`)
- [ ] 콘솔 에러/경고 없음
- [ ] 웹 배포 URL 정상 동작 확인
