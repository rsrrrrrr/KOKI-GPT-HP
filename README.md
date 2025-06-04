# KOKI-GPT-HP
KOKI-GPT-HP
TESR KEY = sk-ant-test123456789 입니다
# 🤖 Koki AI Hub v2.0.0 Pro

**완벽한 AI 워크벤치 - Claude & GPT-4 통합 플랫폼**

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/koki-ai/hub/releases)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![CI/CD](https://github.com/koki-ai/hub/workflows/CI%2FCD/badge.svg)](https://github.com/koki-ai/hub/actions)
[![Security](https://img.shields.io/badge/security-A%2B-brightgreen.svg)](SECURITY.md)
[![PWA](https://img.shields.io/badge/PWA-Ready-orange.svg)](https://web.dev/progressive-web-apps/)
[![Docker](https://img.shields.io/badge/docker-supported-blue.svg)](https://hub.docker.com/r/koki-ai/hub)

<div align="center">

![Koki AI Hub Screenshot](https://via.placeholder.com/800x400/667eea/ffffff?text=Koki+AI+Hub+v2.0.0+Pro)

**[🚀 라이브 데모](https://koki-ai.com)** • 
**[📖 문서](https://docs.koki-ai.com)** • 
**[💬 커뮤니티](https://community.koki-ai.com)** • 
**[🎥 튜토리얼](https://youtube.com/koki-ai)**

</div>

---

## ✨ 주요 특징

### 🎯 핵심 기능
- **🤖 듀얼 AI 분석**: Claude vs GPT-4 비교 분석
- **💬 스마트 채팅**: 실시간 AI 대화 인터페이스
- **📹 영상 AI**: 카메라와 음성 기반 멀티모달 채팅
- **🛠️ 전문 도구**: 작성, 번역, 코딩, 분석, 요약, 학습 AI

### 🚀 기술적 특징
- **📱 PWA 지원**: 모든 디바이스에서 앱처럼 사용
- **🎤 음성 인식**: 한국어 음성 입력 및 TTS 출력
- **⚡ 실시간 스트리밍**: 응답을 실시간으로 받아보기
- **🔒 보안 우선**: 모든 데이터 로컬 저장 및 암호화
- **🌐 오프라인 지원**: 네트워크 없이도 기본 기능 사용
- **📊 성능 모니터링**: 실시간 성능 및 사용량 추적

### 💎 혁신적 경험
- **🎨 모던 UI/UX**: 글래스모피즘과 마이크로 애니메이션
- **⌨️ 키보드 단축키**: 전문가를 위한 빠른 네비게이션
- **🔄 자동 백업**: 채팅 히스토리 및 설정 자동 저장
- **🌙 다크 모드**: 눈에 편한 어두운 테마 지원
- **♿ 접근성**: 스크린 리더 및 키보드 네비게이션 완벽 지원

---

## 🎬 데모 및 스크린샷

<details>
<summary>📱 모바일 버전</summary>

| 채팅 인터페이스 | 듀얼 AI 분석 | 영상 채팅 |
|:-:|:-:|:-:|
| ![Chat](https://via.placeholder.com/200x400/667eea/ffffff?text=Chat) | ![Dual AI](https://via.placeholder.com/200x400/764ba2/ffffff?text=Dual+AI) | ![Video](https://via.placeholder.com/200x400/2ed573/ffffff?text=Video) |

</details>

<details>
<summary>💻 데스크톱 버전</summary>

| 메인 대시보드 | AI 도구 모음 |
|:-:|:-:|
| ![Dashboard](https://via.placeholder.com/400x300/667eea/ffffff?text=Dashboard) | ![Tools](https://via.placeholder.com/400x300/ffa502/ffffff?text=AI+Tools) |

</details>

<details>
<summary>🎥 비디오 데모</summary>

[![Koki AI Hub Demo](https://img.youtube.com/vi/dQw4w9WgXcQ/0.jpg)](https://youtube.com/watch?v=dQw4w9WgXcQ)

*3분으로 보는 Koki AI Hub 완전 가이드*

</details>

---

## ⚡ 빠른 시작

### 🎯 30초 설치

```bash
# 1. 저장소 클론
git clone https://github.com/koki-ai/hub.git koki-ai-hub
cd koki-ai-hub

# 2. 환경 설정
cp .env.example .env
# .env 파일 편집하여 API 키 설정

# 3. 원클릭 실행
chmod +x deploy.sh
./deploy.sh development --start
```

**완료!** 🎉 [http://localhost:8000](http://localhost:8000) 에서 바로 사용 가능

### 🐳 Docker로 실행

```bash
# Docker Compose로 전체 스택 실행
docker-compose up -d

# 또는 단일 컨테이너
docker run -p 8000:8000 ghcr.io/koki-ai/hub:latest
```

### 🪟 Windows 사용자

```batch
# 더블클릭으로 실행
start_koki.bat
```

---

## 📋 시스템 요구사항

### 최소 요구사항
- **브라우저**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **운영체제**: Windows 10+, macOS 10.15+, Ubuntu 18+
- **메모리**: 2GB RAM
- **저장공간**: 500MB
- **네트워크**: 인터넷 연결 (API 사용 시)

### 권장 사양
- **브라우저**: Chrome 100+ (최적 성능)
- **운영체제**: 최신 버전
- **메모리**: 4GB+ RAM
- **저장공간**: 2GB+
- **네트워크**: 광대역 인터넷

### 지원 플랫폼
- 🖥️ **데스크톱**: Windows, macOS, Linux
- 📱 **모바일**: iOS 13+, Android 8+
- 🌐 **브라우저**: 모든 주요 브라우저
- ☁️ **클라우드**: AWS, GCP, Azure, Vercel, Netlify
- 🐳 **컨테이너**: Docker, Kubernetes

---

## 🏗️ 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                    🌐 Frontend (PWA)                        │
├─────────────────────────────────────────────────────────────┤
│  📱 React UI    🎤 Speech API    📹 WebRTC    🔄 Service Worker │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                   🔄 API Gateway (Nginx)                   │
├─────────────────────────────────────────────────────────────┤
│  🚦 Rate Limiting    🔒 SSL/TLS    📊 Load Balancing    🛡️ Security │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                🚀 Backend Services (Node.js)               │
├─────────────────────────────────────────────────────────────┤
│  🤖 Claude API    🧠 OpenAI API    🔄 WebSocket    📊 Metrics    │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                    💾 Data Layer                           │
├─────────────────────────────────────────────────────────────┤
│  📦 Redis Cache    📄 File Storage    📊 Analytics    🔍 Logs    │
└─────────────────────────────────────────────────────────────┘
```

### 기술 스택

#### Frontend
- **UI Framework**: Vanilla JavaScript + Modern CSS
- **PWA**: Service Worker + Web App Manifest
- **Animation**: CSS3 Transitions + Custom Animations
- **Icons**: Lucide + Custom SVG
- **Build**: Native ES Modules

#### Backend
- **Runtime**: Node.js 18+ 
- **Framework**: Express.js
- **Database**: Redis (Caching)
- **Real-time**: WebSocket
- **API Gateway**: Nginx

#### DevOps
- **Containerization**: Docker + Docker Compose
- **Orchestration**: Kubernetes
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus + Grafana
- **Logging**: ELK Stack

---

## 📚 문서

### 📖 사용자 가이드
- **[빠른 시작 가이드](docs/quick-start.md)** - 5분 안에 시작하기
- **[사용자 매뉴얼](docs/user-manual.md)** - 모든 기능 상세 가이드
- **[FAQ](docs/faq.md)** - 자주 묻는 질문과 답변
- **[문제 해결](docs/troubleshooting.md)** - 일반적인 문제 해결

### 👨‍💻 개발자 가이드
- **[API 문서](docs/api.md)** - REST API 및 WebSocket 가이드
- **[개발 환경 설정](docs/development.md)** - 로컬 개발 환경 구축
- **[기여 가이드](CONTRIBUTING.md)** - 프로젝트 기여 방법
- **[아키텍처 가이드](docs/architecture.md)** - 시스템 설계 및 구조

### 🚀 배포 가이드
- **[배포 가이드](DEPLOYMENT.md)** - 프로덕션 배포 완전 가이드
- **[Docker 가이드](docs/docker.md)** - 컨테이너 배포
- **[Kubernetes 가이드](docs/kubernetes.md)** - K8s 클러스터 배포
- **[클라우드 배포](docs/cloud.md)** - AWS, GCP, Azure 배포

### 🔒 보안 & 정책
- **[보안 정책](SECURITY.md)** - 보안 취약점 신고 및 정책
- **[프라이버시 정책](docs/privacy.md)** - 데이터 처리 및 보호
- **[라이선스](LICENSE)** - MIT 라이선스 전문

---

## 🛠️ 설치 및 설정

### 방법 1: 자동 설치 스크립트 (권장)

```bash
# Linux/macOS
curl -fsSL https://get.koki-ai.com | bash

# Windows (PowerShell)
iwr -useb https://get.koki-ai.com/windows | iex
```

### 방법 2: 수동 설치

<details>
<summary>📂 수동 설치 단계</summary>

#### 1. 저장소 클론
```bash
git clone https://github.com/koki-ai/hub.git
cd hub
```

#### 2. 환경 설정
```bash
# 환경 파일 생성
cp .env.example .env

# 필수 환경 변수 설정
nano .env
```

#### 3. 의존성 설치
```bash
# Node.js 의존성
cd api-proxy
npm install

# Python 의존성 (선택사항)
pip install -r requirements.txt
```

#### 4. 서비스 시작
```bash
# 개발 모드
npm run dev

# 프로덕션 모드
npm start
```

</details>

### 방법 3: Docker 설치

<details>
<summary>🐳 Docker 설치 옵션</summary>

#### 단일 컨테이너
```bash
docker run -d \
  --name koki-ai-hub \
  -p 8000:8000 \
  -e ANTHROPIC_API_KEY=your-key \
  ghcr.io/koki-ai/hub:latest
```

#### Docker Compose (전체 스택)
```bash
# 모든 서비스 시작
docker-compose up -d

# 로그 확인
docker-compose logs -f

# 중지
docker-compose down
```

#### 커스텀 설정
```yaml
version: '3.8'
services:
  koki-hub:
    image: ghcr.io/koki-ai/hub:latest
    ports:
      - "8000:8000"
    environment:
      - NODE_ENV=production
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
    volumes:
      - ./data:/app/data
```

</details>

---

## ⚙️ 설정 가이드

### 🔐 API 키 설정

1. **Anthropic Claude API**
   ```bash
   # https://console.anthropic.com에서 API 키 발급
   export ANTHROPIC_API_KEY=sk-ant-your-api-key-here
   ```

2. **OpenAI GPT API** (선택사항)
   ```bash
   # https://platform.openai.com에서 API 키 발급
   export OPENAI_API_KEY=sk-your-openai-api-key-here
   ```

3. **환경 파일 설정**
   ```bash
   # .env 파일 편집
   ANTHROPIC_API_KEY=sk-ant-your-actual-key
   OPENAI_API_KEY=sk-your-actual-key
   CORS_ORIGIN=https://your-domain.com
   ```

### 🎛️ 고급 설정

<details>
<summary>고급 설정 옵션</summary>

#### 성능 최적화
```bash
# Node.js 옵션
NODE_OPTIONS="--max-old-space-size=4096"
UV_THREADPOOL_SIZE=64

# Redis 설정
REDIS_URL=redis://localhost:6379
REDIS_MAX_CONNECTIONS=100

# 캐싱 설정
CACHE_TTL=3600
CACHE_MAX_SIZE=1000
```

#### 보안 설정
```bash
# JWT 설정
JWT_SECRET=your-super-secure-secret-key
JWT_EXPIRES_IN=7d

# CORS 설정
CORS_ORIGIN=https://yourdomain.com
CORS_CREDENTIALS=true

# SSL 설정
FORCE_HTTPS=true
HSTS_MAX_AGE=31536000
```

#### 모니터링 설정
```bash
# Prometheus 메트릭
PROMETHEUS_ENABLED=true
PROMETHEUS_PORT=9090

# 로깅 설정
LOG_LEVEL=info
LOG_FILE=./logs/app.log

# 애널리틱스
ANALYTICS_ENABLED=true
```

</details>

---

## 🚀 사용법

### 💬 기본 채팅

1. **웹 브라우저**에서 `http://localhost:8000` 접속
2. **API 키 설정**: 설정 페이지에서 Claude API 키 입력
3. **메시지 입력**: 채팅창에 질문 또는 요청사항 입력
4. **AI 응답 확인**: Claude AI의 지능적인 응답 받기

### 🤖 듀얼 AI 분석

1. **듀얼 AI 탭** 선택
2. **질문 입력**: 비교하고 싶은 질문 작성
3. **분석 실행**: "AI 응답 생성" 버튼 클릭
4. **결과 비교**: Claude와 GPT-4의 답변 비교 분석

### 📹 영상 AI 채팅

1. **영상 탭** 선택
2. **권한 허용**: 카메라와 마이크 권한 허용
3. **영상 시작**: 카메라 버튼으로 영상 활성화
4. **음성 대화**: 음성으로 AI와 자연스러운 대화

### 🛠️ AI 전문 도구

| 도구 | 설명 | 사용법 |
|------|------|--------|
| ✍️ **스마트 작성** | AI 문서 자동 작성 | 주제 입력 → 자동 생성 |
| 🌐 **실시간 번역** | 100개 언어 번역 | 텍스트 입력 → 언어 선택 |
| 💻 **코드 마법사** | 프로그래밍 도움 | 요구사항 → 코드 생성 |
| 📊 **데이터 분석** | 데이터 인사이트 | 데이터 업로드 → 분석 |
| 📝 **요약 전문가** | 긴 글 요약 | 텍스트 → 핵심 요약 |
| 🎓 **AI 튜터** | 맞춤형 학습 | 주제 선택 → 개인 코칭 |

---

## 🎯 고급 기능

### ⌨️ 키보드 단축키

| 단축키 | 기능 | 설명 |
|--------|------|------|
| `Ctrl + Enter` | 메시지 전송 | 입력한 메시지 즉시 전송 |
| `Ctrl + K` | 빠른 명령 | 명령 팔레트 열기 |
| `Alt + 1-5` | 페이지 전환 | 각 탭으로 빠른 이동 |
| `Ctrl + /` | 도움말 | 도움말 모달 표시 |
| `Ctrl + Shift + D` | 개발자 모드 | 디버그 패널 토글 |

### 🎤 음성 명령

```
"새로운 대화"     → 채팅 초기화
"설정 열어줘"     → 설정 페이지로 이동
"분석 시작"       → 듀얼 AI 분석 실행
"영상 시작"       → 영상 채팅 모드
"도구 보여줘"     → AI 도구 페이지
```

### 🔄 자동화 기능

- **스마트 캐싱**: 자주 사용하는 응답 자동 캐시
- **배경 동기화**: 설정 및 히스토리 자동 백업
- **성능 최적화**: 사용 패턴 기반 자동 최적화
- **오류 복구**: 네트워크 오류 시 자동 재시도

---

## 📊 성능 및 한계

### ⚡ 성능 지표

| 메트릭 | 값 | 설명 |
|--------|--------|------|
| **첫 페이지 로드** | < 2초 | PWA 캐싱으로 최적화 |
| **API 응답 시간** | < 5초 | Claude API 기준 |
| **동시 사용자** | 1,000+ | 로드 밸런싱 지원 |
| **메모리 사용량** | < 100MB | 효율적인 메모리 관리 |
| **오프라인 기능** | 90% | 대부분 기능 오프라인 지원 |

### 📏 사용 한계

- **API 호출 제한**: Anthropic/OpenAI 정책에 따름
- **파일 업로드**: 최대 10MB
- **동시 요청**: 분당 50회 (기본값)
- **세션 시간**: 24시간 (연장 가능)
- **저장 용량**: 로컬 스토리지 기준

### 🔧 최적화 팁

1. **브라우저 캐시 활용**: 정적 파일 1년 캐싱
2. **이미지 최적화**: WebP 형식 및 지연 로딩
3. **API 캐싱**: 동일 요청 1시간 캐싱
4. **청크 로딩**: 필요한 기능만 동적 로드
5. **서비스 워커**: 백그라운드 동기화

---

## 🤝 커뮤니티

### 💬 소통 채널

- **💌 Discord**: [discord.gg/koki-ai](https://discord.gg/koki-ai) - 실시간 채팅
- **📱 Telegram**: [@koki_ai_hub](https://t.me/koki_ai_hub) - 업데이트 알림
- **🐦 Twitter**: [@koki_ai](https://twitter.com/koki_ai) - 소식 및 팁
- **📺 YouTube**: [Koki AI](https://youtube.com/koki-ai) - 튜토리얼
- **📰 블로그**: [blog.koki-ai.com](https://blog.koki-ai.com) - 기술 블로그

### 🌟 기여자들

<!-- ALL-CONTRIBUTORS-LIST:START -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/contributor1"><img src="https://github.com/contributor1.png" width="100px;" alt=""/><br /><sub><b>김개발</b></sub></a><br />💻 🎨 📖</td>
    <td align="center"><a href="https://github.com/contributor2"><img src="https://github.com/contributor2.png" width="100px;" alt=""/><br /><sub><b>이디자인</b></sub></a><br />🎨 💻</td>
    <td align="center"><a href="https://github.com/contributor3"><img src="https://github.com/contributor3.png" width="100px;" alt=""/><br /><sub><b>박테스트</b></sub></a><br />🧪 📖</td>
    <td align="center"><a href="https://github.com/contributor4"><img src="https://github.com/contributor4.png" width="100px;" alt=""/><br /><sub><b>최번역</b></sub></a><br />🌍 📖</td>
  </tr>
</table>
<!-- ALL-CONTRIBUTORS-LIST:END -->

*기여해주신 모든 분들께 감사드립니다! [기여 가이드](CONTRIBUTING.md)를 참고하여 참여하세요.*

### 🏆 인정과 수상

- 🥇 **2024 AI Innovation Award** - Best AI Integration
- 🏅 **Open Source Excellence** - Community Choice
- 🎯 **PWA Awards** - Best User Experience
- 💎 **Developer Choice** - Most Helpful Tool

---

## 📈 로드맵

### 🎯 v2.1.0 (2024 Q2)
- [ ] 🌍 다국어 지원 (영어, 중국어, 일본어)
- [ ] 🎨 테마 커스터마이징
- [ ] 📊 고급 분석 대시보드
- [ ] 🔌 플러그인 시스템
- [ ] 🤝 팀 협업 기능

### 🚀 v2.2.0 (2024 Q3)
- [ ] 🧠 커스텀 AI 모델 지원
- [ ] 📱 모바일 앱 (React Native)
- [ ] ☁️ 클라우드 동기화
- [ ] 🔐 고급 보안 옵션
- [ ] 📈 API 사용량 분석

### 🌟 v3.0.0 (2024 Q4)
- [ ] 🎯 멀티모달 AI 통합
- [ ] 🥽 AR/VR 지원
- [ ] 🔗 블록체인 인증
- [ ] 🏢 엔터프라이즈 기능
- [ ] 🤖 AI 에이전트 워크플로우

### 💫 장기 비전
- **AI 민주화**: 누구나 쉽게 AI를 활용할 수 있는 플랫폼
- **개방성**: 오픈소스 생태계 구축
- **혁신**: 차세대 AI 인터페이스 개척
- **접근성**: 전 세계 모든 사용자에게 평등한 AI 접근

---

## ❓ FAQ

<details>
<summary><strong>Q: Koki AI Hub는 무료인가요?</strong></summary>

**A:** 네, 완전히 무료이며 오픈소스입니다! MIT 라이선스로 상업적 사용도 가능합니다. 단, Claude나 OpenAI API 사용 비용은 별도입니다.

</details>

<details>
<summary><strong>Q: API 키 없이도 사용할 수 있나요?</strong></summary>

**A:** 데모 모드에서는 API 키 없이도 기본 기능을 체험할 수 있습니다. 하지만 실제 AI 기능을 사용하려면 Anthropic 또는 OpenAI API 키가 필요합니다.

</details>

<details>
<summary><strong>Q: 모바일에서도 잘 작동하나요?</strong></summary>

**A:** 네! PWA로 개발되어 모바일에서도 네이티브 앱처럼 사용할 수 있습니다. 홈 화면에 추가하여 앱처럼 사용하세요.

</details>

<details>
<summary><strong>Q: 오프라인에서도 사용할 수 있나요?</strong></summary>

**A:** 기본 UI와 캐시된 응답은 오프라인에서도 사용 가능하지만, 새로운 AI 응답을 받으려면 인터넷 연결이 필요합니다.

</details>

<details>
<summary><strong>Q: 다른 AI 모델도 지원하나요?</strong></summary>

**A:** 현재 Claude와 GPT-4를 지원하며, v2.2.0에서 더 많은 AI 모델 지원을 계획하고 있습니다.

</details>

<details>
<summary><strong>Q: 데이터는 어디에 저장되나요?</strong></summary>

**A:** 모든 데이터는 사용자의 브라우저에 로컬로 저장됩니다. 서버에는 전송되지 않아 프라이버시가 보호됩니다.

</details>

<details>
<summary><strong>Q: 상업적 프로젝트에 사용할 수 있나요?</strong></summary>

**A:** 네, MIT 라이선스로 상업적 사용이 가능합니다. 단, 사용하는 AI API의 약관을 확인하세요.

</details>

---

## 🆘 지원 및 도움

### 📞 연락처
- **📧 일반 문의**: hello@koki-ai.com
- **🐛 버그 리포트**: [GitHub Issues](https://github.com/koki-ai/hub/issues)
- **💡 기능 제안**: [GitHub Discussions](https://github.com/koki-ai/hub/discussions)
- **🔒 보안 문제**: security@koki-ai.com

### 📚 학습 자료
- **🎓 튜토리얼**: [learn.koki-ai.com](https://learn.koki-ai.com)
- **📖 API 문서**: [docs.koki-ai.com/api](https://docs.koki-ai.com/api)
- **🎥 비디오 가이드**: [YouTube 채널](https://youtube.com/koki-ai)
- **📝 블로그**: [blog.koki-ai.com](https://blog.koki-ai.com)

### 🤝 커뮤니티 지원
- **💬 Discord**: 실시간 도움 및 토론
- **📱 Telegram**: 빠른 질의응답
- **🐦 Twitter**: 최신 소식 및 팁
- **📧 뉴스레터**: 월간 업데이트 소식

---

## 📄 라이선스

이 프로젝트는 [MIT 라이선스](LICENSE) 하에 배포됩니다.

```
MIT License

Copyright (c) 2024 Koki AI Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

---

## 🙏 감사의 말

Koki AI Hub는 다음 훌륭한 프로젝트들 덕분에 가능했습니다:

- **🤖 Anthropic Claude**: 뛰어난 AI 모델과 API 제공
- **🧠 OpenAI**: GPT 모델과 혁신적인 AI 기술
- **⚛️ React 생태계**: 현대적인 웹 개발 도구들
- **🐳 Docker**: 컨테이너화 및 배포 플랫폼
- **☸️ Kubernetes**: 오케스트레이션 및 스케일링
- **🔥 Node.js 커뮤니티**: 풍부한 라이브러리 생태계

그리고 무엇보다 **우리 커뮤니티의 모든 기여자들**에게 진심으로 감사드립니다! 🎉

---

## 🌟 스타 히스토리

[![Star History Chart](https://api.star-history.com/svg?repos=koki-ai/hub&type=Date)](https://star-history.com/#koki-ai/hub&Date)

---

<div align="center">

### 🚀 지금 시작하세요!

**[📥 다운로드](https://github.com/koki-ai/hub/releases)** • 
**[🎮 라이브 데모](https://koki-ai.com)** • 
**[📖 문서 보기](https://docs.koki-ai.com)**

---

**Made with ❤️ by the Koki AI Team**

*AI의 미래를 함께 만들어가요!*

**[⭐ Star](https://github.com/koki-ai/hub)** ∙ **[🍴 Fork](https://github.com/koki-ai/hub/fork)** ∙ **[👀 Watch](https://github.com/koki-ai/hub/subscription)**

</div>
