# Conventions & Code Rules

## 코드 규칙

- 모든 코드는 TypeScript. `any` 사용 금지
- 컴포넌트는 함수형, `export default` 사용
- Firestore 로직은 `hooks/` 로 분리
- 비즈니스 로직은 커스텀 훅으로 분리, 컴포넌트에 직접 작성 금지
- 스타일은 Tailwind CSS 클래스 기반, 인라인 스타일 최소화

## 폴더 구조

```
src/
  pages/              # 라우트별 페이지 컴포넌트 (React Router v6)
  components/         # 공통 컴포넌트
  hooks/              # 커스텀 훅 (Firestore 연동, 비즈니스 로직)
  store/              # Zustand 스토어
  lib/                # Firebase 초기화, 유틸 함수
  types/              # TypeScript 타입 정의
_docs/                # 기획 문서
_devlog/              # 개발 로그
```

## 커밋 컨벤션

```
feat:     새 기능
fix:      버그 수정
chore:    설정, 패키지 관련
docs:     문서 수정
refactor: 리팩토링
test:     테스트 코드
style:    스타일 수정 (기능 변경 없음)
```

## 네이밍 규칙

- 컴포넌트: PascalCase (`BrewTimer.tsx`)
- 훅: camelCase, `use` 접두사 (`useBrewTimer.ts`)
- 스토어: camelCase, `use` + `Store` (`useBeanStore.ts`)
- 타입/인터페이스: PascalCase (`RecipeType`, `BeanType`)
- Firestore 컬렉션 함수: `get`, `create`, `update`, `delete` 접두사

## 테스트 규칙

- 순수 함수 / 비즈니스 로직 우선 테스트
- 테스트 파일: `*.test.ts` or `*.test.tsx`
- 우선순위: 원두 차감 계산, 타이머 로직, Firestore 훅
