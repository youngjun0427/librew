---
date: 2026-03-04
category: troubleshooting
tags: [firebase, google-auth, expo-auth-session, web]
blog_ready: true
---

## Google 로그인 웹 오류 2개 동시 발생

expo-auth-session으로 Google 로그인 구현 후 웹에서 두 가지 에러가 연달아 발생.

## 문제

**1차:** `400: redirect_uri_mismatch`
> 이 앱의 요청이 잘못되었습니다. 잘못된 요청을 전송했으므로 로그인할 수 없습니다.

**2차:** `Firebase: Error (auth/argument-error)`
```
at OAuthCredential._fromParams
at GoogleAuthProvider.credential
at useEffect$argument_0 (hooks/useGoogleSignIn.ts:17:45)
```

## 원인 분석

`expo-auth-session`은 플랫폼별로 다른 OAuth flow를 사용한다.

| 플랫폼 | Flow | 응답 |
|--------|------|------|
| Native (iOS/Android) | Implicit Flow | `id_token` 직접 반환 |
| **Web** | Authorization Code Flow | `code` 반환 (`id_token` 없음) |

기존 코드는 웹에서도 `response.params.id_token`을 꺼내 `GoogleAuthProvider.credential(id_token)`을 호출했는데, 웹에서는 `id_token`이 `undefined`라서 Firebase credential 생성 실패 → `argument-error`.

`redirect_uri_mismatch`는 expo-auth-session이 웹에서 사용하는 redirect URI(`http://localhost:8081`)가 Google Cloud Console의 OAuth 앱에 등록되지 않아서 발생.

## 해결

웹에서는 Firebase 자체 `signInWithPopup`을 사용하도록 플랫폼 분기 처리.

```typescript
// hooks/useGoogleSignIn.ts
const signIn = async () => {
  if (Platform.OS === "web") {
    // Firebase popup: redirect URI 등록 불필요, id_token 문제 없음
    await signInWithPopup(auth, new GoogleAuthProvider());
  } else {
    // 네이티브: expo-auth-session의 implicit flow 유지
    promptAsync();
  }
};
```

## 배운 점

> `expo-auth-session`은 웹에서 Authorization Code Flow를 쓰기 때문에 `id_token`이 없다. 웹 Google 로그인은 Firebase `signInWithPopup`이 정답.

## 블로그 포스트 아이디어

"expo-auth-session + Firebase Google 로그인이 웹에서 안 되는 이유 (redirect_uri_mismatch, argument-error 완전 해결)"
