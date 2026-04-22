# ☕ Librew

커피 핸드드립 취미 유저를 위한 레시피 관리 · 추출 도우미 · 관능 평가 앱.
1인 프론트엔드 개발 / 이직 포트폴리오 겸 실력  향상 목적.

## 스택
Vite · React 18 · TypeScript · React Router v6 · Zustand · Tailwind CSS · Firebase · Capacitor · Gemini 1.5 Flash

## 플랫폼
iOS / Android 앱스토어 + 웹 동시 배포 (Capacitor 하이브리드 앱 껍데기, 웹 먼저 개발 → 앱 UI 다듬기)

## 상세 문서
- 아키텍처 / 데이터 구조: `_docs/context/architecture.md`
- 코드 규칙 / 컨벤션: `_docs/context/conventions.md`
- AI 전략 / Gemini: `_docs/context/ai-strategy.md`
- devlog 규칙 / 템플릿: `_docs/context/devlog-rules.md`
- **품질 기준 (상세)**: `_docs/context/quality-standards.md`
- **중간점검 가이드**: `_docs/context/review-guide.md`

## 워크트리 워크플로우 (모든 작업에 필수 적용)

**새 작업을 시작할 때 반드시 워크트리 브랜치를 먼저 만들고, main에서 직접 작업하지 않는다.**

### ⚠️ 커밋 및 병합(Merge) 필수 규칙 ⚠️
1. **커밋 단위 분할:** 기능 작업 시 한 번에 몰아서 커밋하지 않고, 항상 **논리적인 작업 단위(예: UI 변경, 로직 추가 등)로 잘게 나누어 자주 커밋**한다.
2. **병합(Merge) 대기:** 작업이 완료되어 커밋을 마쳤더라도, 사용자가 명시적으로 **"푸시하고 정리해(또는 main에 병합해)" 라고 지시하기 전까지는 절대 `main` 브랜치에 병합하지 않는다.** 워크트리 내에서 커밋만 완료한 상태로 사용자의 확인을 대기해야 한다.

### 브랜치 네이밍
`[prefix]/[short-desc]` — prefix는 커밋 컨벤션 과 동일 (feat/fix/refactor/style/chore/docs)
예: `feat/brew-timer-ui`, `fix/bean-weight-calc`

### 작업 시작
```bash
git worktree add ../librew-wt/[branch-name] -b [branch-name]
```

### 작업 완료 후 main 머지 & 정리 (사용자 지시가 있을 때만)
```bash
git -C /Users/owen/Documents/others/brew_project merge [branch-name]
git worktree remove ../librew-wt/[branch-name]
git branch -d [branch-name]
```

상세 워크플로우 → `_docs/context/conventions.md` 참조

## 세션 시작 루틴
```
전체 파악:       CLAUDE.md + _docs/context/ 전 부 읽어줘
기능 개발:       CLAUDE.md + architecture.md 읽고 [기능명] 작업할게
버그 디버깅:     CLAUDE.md + conventions.md 읽 고 이 에러 봐줘: [에러]
AI 기능:         CLAUDE.md + ai-strategy.md 읽 고 프롬프트 튜닝해줘
devlog 작성:     devlog-rules.md 읽고 오늘 작업 devlog로 저장해줘
중간점검:        review-guide.md 읽고 최근 커밋 기준으로 회고 진행해줘
```

## 코드 품질 기준 (항상 적용)

기능 구현 시 아래 기준을 반드시 지킨다. 상세 내용은 `quality-standards.md` 참조.

### 비동기 처리
- Firestore 훅은 반드시 `isLoading` + `error`  반환
- 스크린은 `if (isLoading) return <LoadingView />` / `if (error) return <ErrorView />` 패턴 적용
- 여러 훅 병렬 로딩: `const isLoading = aLoading || bLoading`

### 폼 UX
- 제출 버튼은 `formState.isSubmitting` 으로 disabled 처리
- 버튼 텍스트: 제출 중에는 "저장 중..." 등으로 변경

### 타입 안전성
- Firestore 데이터를 `as Type` 단순 캐스팅 금지
- 외부 데이터 경계(Firestore, API 응답)에서는  필드 존재 여부 방어 처리

### 컴포넌트 설계
- 2개 이상 화면에서 쓰이는 UI → `components/`  로 추출
- 단일 화면 전용 서브 컴포넌트 → 같은 파일 하단에 정의
- 500줄 초과 파일 → 분리 검토
