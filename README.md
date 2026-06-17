# DYMS Client (Frontend App)

덕영고등학교 교내 메신저 서비스(DYMS)의 모바일/웹 클라이언트 애플리케이션입니다. React Native와 Expo Router를 기반으로 개발되었습니다.

## 기술 스택
- **Framework**: React Native, Expo (SDK 56)
- **Routing**: Expo Router
- **Styling**: React Native StyleSheet, Expo Glass Effect
- **HTTP Client**: Axios

## 사전 준비 (Prerequisites)
- [Node.js](https://nodejs.org/) (v18 이상 권장)
- [pnpm](https://pnpm.io/) 패키지 매니저
- 모바일 테스트용 장치: iOS Simulator, Android Emulator 또는 [Expo Go](https://expo.dev/client) 앱 (실기기 테스트용)
- DYMS Backend 서버 (localhost:3000 등)가 실행 중이어야 합니다.

## 환경 설정 및 설치

### 1. 백엔드 주소 설정
현재 백엔드 API 주소는 기본적으로 `http://localhost:3000`으로 설정되어 있습니다. 
실기기(휴대폰)에서 테스트하거나 백엔드 서버가 다른 주소에 있는 경우, `src/lib/api.ts` 파일에서 `baseURL`을 백엔드 서버의 실제 IP 주소나 도메인으로 변경해야 합니다.

```typescript
// src/lib/api.ts
export const api = axios.create({
  baseURL: "http://당신의_서버_IP:3000", // 예: http://192.168.0.10:3000
  timeout: 5000,
});
```

### 2. 패키지 설치
```bash
$ pnpm install
```

## 앱 실행 방법

```bash
# 로컬 개발 서버(Metro Bundler) 실행
$ pnpm run start

# 웹 브라우저에서 실행
$ pnpm run web

# iOS 시뮬레이터에서 실행 (Mac 전용)
$ pnpm run ios

# Android 에뮬레이터에서 실행
$ pnpm run android
```

명령어를 실행하면 터미널에 QR 코드가 나타납니다. 휴대폰의 **Expo Go** 앱으로 이 QR 코드를 스캔하면 실제 기기에서 앱을 바로 테스트해 볼 수 있습니다.

## 주요 기능
- **멀티 플랫폼 지원**: iOS, Android, 그리고 Web(PC 브라우저) 화면 비율(반응형)을 모두 지원합니다.
- **Glassmorphism 디자인**: 투명한 유리 질감의 모던한 애플 스타일 UI 테마(라이트/다크 모드)가 적용되어 있습니다.
- **실시간 소통**: 백엔드와 연동되어 실시간 1:1 채팅, 그룹 채팅, 학교 공지 확인 기능을 제공합니다.
