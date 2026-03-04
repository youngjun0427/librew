# Architecture & Data Structure

## 화면 구조

| 화면 | 주요 구성 | 연결 |
|------|-----------|------|
| 대시보드 | 오늘 추출 횟수, 이번주 섭취량, 지출 합계 | 레시피 목록, 추출 도우미 |
| 레시피 목록 | 카드 리스트, 필터, 생성 버튼 | 레시피 상세, 생성 |
| 레시피 상세 | 파라미터, 하위 레시피, 공유 버튼 | 추출 도우미, 수정 |
| 레시피 생성/수정 | 파라미터 입력 폼 | 레시피 상세 |
| 추출 도우미 | 원두 선택, 3초 카운트다운, 단계별 가이드 | 관능 평가 |
| 관능 평가 | 맛 항목 입력, Gemini 개선 제안 | 대시보드 |
| 원두 관리 | 목록, 잔여 용량, 구매 이력 | 원두 등록/수정 |
| 공유 링크 페이지 | OG 미리보기, 가져오기 버튼 (웹) | 레시피 목록 (딥링크) |

## Firestore 구조

```
users/{uid}/
  recipes/{recipeId}
  beans/{beanId}
  brewLogs/{logId}

publicRecipes/{shareId}   ← 공유 레시피 (비로그인 접근)
```

### recipes 필드
| 필드 | 타입 | 설명 |
|------|------|------|
| id | string | 자동 생성 |
| title | string | 레시피 이름 |
| baseRecipeId | string \| null | 파생 레시피인 경우 부모 ID |
| grindSize | number | 분쇄도 |
| waterTemp | number | 물 온도 (°C) |
| coffeeWeight | number | 원두량 (g) |
| waterWeight | number | 물량 (g) |
| filterType | string | 필터 종류 |
| brewMethod | string | 추출 방식 |
| equipmentId | string \| null | 연결된 장비 ID |
| steps | array | [{order, waterAmount, tip}] |
| isPublic | boolean | 공유 여부 |
| shareId | string \| null | 공유 링크 ID |
| createdAt | timestamp | 생성일 |

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
| sensoryNote | object | {acidity, bitterness, body, aroma, overall} |
| aiSuggestion | string \| null | Gemini 개선 제안 텍스트 |
| brewedAt | timestamp | 추출일시 |

### publicRecipes 필드
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
| 레이아웃 컴포넌트 | 부분 분기 | 웹: 사이드바, 앱: 탭바 |
| 네이티브 제스처 UI | 앱 전용 | 스와이프, 햅틱 등 |
| 타이머 / 카운트다운 | 공유 가능 | Web Audio API fallback 처리 필요 |
