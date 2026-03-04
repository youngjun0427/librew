# Devlog Rules

## 저장 위치

```
_devlog/
├── troubleshooting/   # 에러 해결, 트러블슈팅
├── learnings/         # 새로 배운 것, 패턴, 개념
├── progress/          # 주간 진행 상황
└── decisions/         # 기술 선택, 설계 결정
```

파일명: `YYYY-MM-DD-{짧은-제목}.md`

## 기록 트리거

아래 중 하나라도 해당되면 devlog 작성:

- 에러 해결 / 트러블슈팅 과정이 있었을 때
- 새 라이브러리나 패턴을 처음 적용했을 때
- 기술 선택 또는 설계 결정이 논의됐을 때
- 성능 개선 / 리팩토링을 진행했을 때
- 다른 개발자에게 도움이 될 만한 내용이 나왔을 때

## 템플릿

```md
---
date: YYYY-MM-DD
category: troubleshooting | learnings | progress | decisions
tags: []
blog_ready: false
---

## 주제
(한 줄 요약)

## 상황 / 배경
(뭘 하려고 했는지)

## 문제 또는 목표
(에러 메시지 or 달성하려는 것)

## 시도한 것들
-

## 해결 / 결론
(어떻게 해결했는지)

## 배운 점
(핵심 한 줄)

## 블로그 포스트 아이디어
(글 제목 또는 방향)
```

## 사용 방법

- 항목 다 안 채워도 됨. 짧아도 있는 게 낫다
- `blog_ready: true` 로 바꾸면 블로그 포스트 초안 작성 준비 완료
- "이 devlog 블로그 글로 만들어줘" 하면 초안 바로 작성 가능
