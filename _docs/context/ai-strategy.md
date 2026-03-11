# AI Strategy (Gemini) — Post-MVP

> ⚠️ MVP 범위에서 제외. 원두 관리 · 장비 관리 · 레시피 관리 · 추출 기능이 완성된 이후 구현.

---

## 사용 지점

관능 평가 후 레시피 개선 제안 딱 하나. 이 이상 확장하지 않는다.

## 아키텍처

```
클라이언트 (Vite + React)
  → Firebase Functions (프록시)
    → Gemini 1.5 Flash API
  ← 개선 제안 텍스트 반환
  ← 클라이언트 UI 렌더링
```

API 키는 Firebase Functions에서만 보관. 클라이언트에 절대 노출하지 않는다.

## 입력 데이터 구조

```json
{
  "recipe": {
    "grindSize": 4,
    "waterTemp": 93,
    "coffeeWeight": 15,
    "waterWeight": 250,
    "brewMethod": "V60"
  },
  "sensory": {
    "acidity": 3,
    "bitterness": 4,
    "body": 2,
    "aroma": 3,
    "overall": 3
  },
  "memo": "약간 쓴 맛이 강했음",
  "previousLogs": [
    { "grindSize": 3, "sensory": { "overall": 2 } }
  ]
}
```

## 시스템 프롬프트 원칙

- 역할: 홈 바리스타를 위한 핸드드립 전문가
- 출력 제한: 3가지 이내 개선 제안, 각 1~2문장
- 언어: 한국어 고정
- 중복 호출 방지: 동일 입력 조합은 클라이언트 캐시 처리

## brewLogs 연동

Post-MVP에서 brewLogs에 `aiSuggestion: string | null` 필드 추가.
MVP 기간 동안 해당 필드는 사용하지 않으며, 데이터 구조에도 포함하지 않는다.

## 프롬프트 튜닝 요청 방법

```
ai-strategy.md 읽고 이 입력 데이터로 Gemini 시스템 프롬프트 짜줘.
입력: [JSON]
기대 출력: [예시]
```
