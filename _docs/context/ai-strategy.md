# AI Strategy (Gemini)

## 사용 지점

관능 평가 후 레시피 개선 제안 딱 하나. MVP에서 확장하지 않는다.

## 아키텍처

```
클라이언트 (Expo)
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
    "brewMethod": "핸드드립"
  },
  "sensory": {
    "acidity": 3,
    "bitterness": 4,
    "body": 2,
    "aroma": 3,
    "overall": 3
  },
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

## 프롬프트 튜닝 요청 방법

```
ai-strategy.md 읽고 이 입력 데이터로 Gemini 시스템 프롬프트 짜줘.
입력: [JSON]
기대 출력: [예시]
```
