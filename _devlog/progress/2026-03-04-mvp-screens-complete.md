---
date: 2026-03-04
category: progress
tags: [expo-router, firebase, zustand, react-hook-form, nativewind]
blog_ready: false
---

## Coffee Brew Log MVP 전체 화면 구현 완료

## 상황 / 배경

이직 포트폴리오용 핸드드립 커피 앱. 웹 먼저 개발 전략으로 진행 중.
오늘 하루에 프로젝트 셋업부터 8개 화면 전체 구현까지 완료.

## 완료한 것

### 프로젝트 기반
- Expo SDK 55 + Expo Router (파일 기반 라우팅)
- NativeWind v4 (TailwindCSS in React Native)
- Firebase v12 (Auth + Firestore)
- Zustand v5 (상태관리)
- React Hook Form v7 (폼)
- ESLint v9 flat config + Prettier v3
- GitHub Actions CI (lint + tsc on push/PR)

### 인증
- Firebase Auth + Google 로그인 (웹: signInWithPopup, 네이티브: expo-auth-session)
- `onAuthStateChanged` 기반 전역 인증 상태
- 미인증 사용자 `/login` 자동 리다이렉트

### 데이터 레이어
- Zustand 스토어 3개: recipes, beans, brewLogs
- Firestore 실시간 훅 3개: `useRecipes`, `useBeans`, `useBrewLogs`
- 각 훅: `onSnapshot` 기반 실시간 동기화 + CRUD 함수 제공

### 구현된 화면 (8개)

| 화면 | 주요 기능 |
|------|-----------|
| 대시보드 | 오늘 추출 횟수, 이번주 섭취량, 이번주 지출 (원두 단가 × 사용량) |
| 레시피 목록 | 카드 리스트, 빈 상태 UI, FAB |
| 레시피 생성/수정 | React Hook Form + useFieldArray로 동적 추출 단계 관리 |
| 레시피 상세 | 파라미터 표시, 수정/삭제/공유, 추출 시작 |
| 원두 관리 | 카드 + 잔여량 프로그레스바, FAB |
| 원두 상세 | 상세 정보, 인라인 편집 모드 |
| 추출 도우미 | 레시피 선택 → 원두 선택 → 3초 카운트다운 → 단계별 가이드 + 누적 타이머 |
| 관능 평가 | 산미/쓴맛/바디/향/만족도 1-5점 → Firestore 저장 |
| 공유 링크 | publicRecipes 컬렉션, 비로그인 접근 가능, 내 레시피로 가져오기 |

## 아키텍처 결정

### RecipeForm / BeanForm 컴포넌트 분리
생성 화면과 수정 화면이 동일한 폼을 공유하므로 `components/RecipeForm.tsx`, `components/BeanForm.tsx`로 추출.
`defaultValues` prop으로 수정 시 초깃값 주입.

### 추출 도우미 타이머 구현
`useRef` + `setInterval` 조합, 두 개의 `useEffect`로 카운트다운/추출 타이머 분리:
```typescript
// 카운트다운 effect
useEffect(() => {
  if (phase !== "countdown") return;
  // ...
  return () => clearInterval(interval); // phase 바뀌면 자동 정리
}, [phase]);

// 추출 타이머 effect
useEffect(() => {
  if (phase !== "brewing") return;
  // ...
  return () => clearInterval(interval);
}, [phase]);
```
`phase` state를 의존성으로 두면 cleanup이 자동으로 처리됨.

### Firestore 보안 규칙 (예정)
- `users/{uid}/**`: 본인만 read/write
- `publicRecipes/{shareId}`: 누구나 read, 인증된 사용자만 write

## 다음 작업
- [ ] Firestore 보안 규칙 설정
- [ ] Gemini AI 개선 제안 (Firebase Functions 프록시)
- [ ] 웹 사이드바 레이아웃 (현재 탭바만)
- [ ] iOS/Android UI 다듬기 (safe area, 햅틱)
- [ ] 공개 배포 (Expo EAS + Firebase Hosting)
