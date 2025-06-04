# 🤝 Koki AI Hub 기여 가이드

Koki AI Hub 프로젝트에 기여해주셔서 감사합니다! 이 가이드는 프로젝트에 효과적으로 기여하는 방법을 설명합니다.

## 📋 목차

1. [시작하기](#-시작하기)
2. [개발 환경 설정](#-개발-환경-설정)
3. [기여 방법](#-기여-방법)
4. [코딩 표준](#-코딩-표준)
5. [테스트 가이드라인](#-테스트-가이드라인)
6. [Pull Request 가이드](#-pull-request-가이드)
7. [이슈 리포팅](#-이슈-리포팅)
8. [커뮤니티 가이드라인](#-커뮤니티-가이드라인)

---

## 🚀 시작하기

### 기여할 수 있는 방법

- 🐛 **버그 리포트**: 발견한 문제를 신고
- 💡 **기능 제안**: 새로운 기능 아이디어 제안
- 📝 **문서 개선**: README, 가이드, 코멘트 개선
- 🔧 **코드 기여**: 버그 수정, 기능 개발, 성능 개선
- 🎨 **UI/UX 개선**: 디자인, 사용성 개선
- 🌍 **번역**: 다국어 지원
- 📊 **테스트**: 테스트 케이스 추가 및 개선

### 기여자 혜택

- 🏆 GitHub 프로필에 기여 내역 표시
- 📜 프로젝트 README에 기여자로 등록
- 🎯 Koki AI 커뮤니티 멤버십
- 💌 기여자 전용 뉴스레터 구독
- 🎁 특별 기여자 굿즈 (주요 기여 시)

---

## 💻 개발 환경 설정

### 1. 필수 요구사항

```bash
# Node.js 18+ 설치
node --version  # v18.0.0+

# Python 3.9+ 설치  
python --version  # 3.9.0+

# Git 설치
git --version

# Docker 설치 (선택사항)
docker --version
```

### 2. 저장소 포크 및 클론

```bash
# 1. GitHub에서 저장소 포크
# 2. 로컬에 클론
git clone https://github.com/YOUR_USERNAME/koki-ai-hub.git
cd koki-ai-hub

# 3. 원본 저장소를 upstream으로 추가
git remote add upstream https://github.com/koki-ai/hub.git
```

### 3. 개발 환경 설정

```bash
# 환경 설정 파일 생성
cp .env.example .env
# .env 파일 편집하여 개발용 API 키 설정

# 의존성 설치
cd api-proxy
npm install

# 개발 서버 시작
npm run dev
```

### 4. 개발 도구 설정

```bash
# ESLint 및 Prettier 설정
npm run lint:fix

# 사전 커밋 훅 설정
npm run prepare

# 테스트 실행
npm test
```

---

## 🛠️ 기여 방법

### 브랜치 전략

```
main           # 프로덕션 브랜치
├── develop    # 개발 브랜치
├── feature/*  # 기능 개발 브랜치
├── bugfix/*   # 버그 수정 브랜치
├── hotfix/*   # 긴급 수정 브랜치
└── docs/*     # 문서 개선 브랜치
```

### 워크플로우

1. **이슈 확인**: 기존 이슈 검색 또는 새 이슈 생성
2. **브랜치 생성**: `feature/issue-number-description` 형식
3. **개발**: 코딩 표준 준수하여 개발
4. **테스트**: 변경사항에 대한 테스트 작성 및 실행
5. **커밋**: 컨벤션을 따라 의미있는 커밋 메시지 작성
6. **Push**: 개인 포크로 푸시
7. **Pull Request**: 상세한 설명과 함께 PR 생성
8. **코드 리뷰**: 리뷰어의 피드백 반영
9. **머지**: 승인 후 메인 브랜치에 머지

### 브랜치 생성 예시

```bash
# develop 브랜치에서 시작
git checkout develop
git pull upstream develop

# 새 기능 브랜치 생성
git checkout -b feature/123-add-voice-commands

# 작업 완료 후 푸시
git push origin feature/123-add-voice-commands
```

---

## 📝 코딩 표준

### JavaScript/Node.js

```javascript
// ✅ 좋은 예시
const apiKey = process.env.ANTHROPIC_API_KEY;

/**
 * Claude API 호출 함수
 * @param {Array} messages - 메시지 배열
 * @param {Object} options - 추가 옵션
 * @returns {Promise<Object>} API 응답
 */
async function callClaudeAPI(messages, options = {}) {
  try {
    const response = await fetch('/api/claude/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, ...options })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Claude API 호출 실패:', error);
    throw error;
  }
}

// ❌ 나쁜 예시
function bad_function(msg) {
  // 주석 없음, 에러 처리 없음, 네이밍 컨벤션 위반
  return fetch('/api').then(r => r.json());
}
```

### CSS/스타일링

```css
/* ✅ 좋은 예시 - 의미있는 클래스명과 구조화 */
.message-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
}

.message-container--user {
  align-items: flex-end;
}

.message-container--assistant {
  align-items: flex-start;
}

/* ❌ 나�은 예시 */
.msg { background: red; }
```

### HTML 구조

```html
<!-- ✅ 좋은 예시 - 시맨틱 HTML과 접근성 -->
<main class="chat-container" role="main" aria-label="채팅 인터페이스">
  <section class="messages" aria-live="polite" aria-label="채팅 메시지">
    <article class="message message--user" role="article">
      <p>사용자 메시지</p>
      <time datetime="2024-01-01T12:00:00Z">12:00</time>
    </article>
  </section>
  
  <form class="input-form" aria-label="메시지 입력">
    <label for="message-input" class="sr-only">메시지 입력</label>
    <textarea 
      id="message-input" 
      placeholder="메시지를 입력하세요..."
      aria-describedby="input-help"
    ></textarea>
    <button type="submit" aria-label="메시지 전송">
      <span aria-hidden="true">📤</span>
    </button>
  </form>
</main>

<!-- ❌ 나쁜 예시 -->
<div onclick="send()">Send</div>
```

### 파일 구조

```
src/
├── components/          # 재사용 가능한 컴포넌트
│   ├── ChatMessage/
│   │   ├── index.js
│   │   ├── ChatMessage.css
│   │   └── ChatMessage.test.js
│   └── VoiceRecorder/
├── services/            # API 및 비즈니스 로직
│   ├── api/
│   └── utils/
├── assets/              # 정적 자원
├── tests/               # 테스트 파일
└── docs/                # 컴포넌트 문서
```

### 네이밍 컨벤션

- **변수/함수**: camelCase (`userMessage`, `sendMessage`)
- **상수**: UPPER_SNAKE_CASE (`API_BASE_URL`, `MAX_RETRIES`)
- **클래스**: PascalCase (`ChatMessage`, `APIService`)
- **파일명**: kebab-case (`chat-message.js`, `api-service.js`)
- **CSS 클래스**: BEM 방식 (`message__content--highlighted`)

---

## 🧪 테스트 가이드라인

### 테스트 작성 원칙

1. **AAA 패턴**: Arrange, Act, Assert
2. **단일 책임**: 하나의 테스트는 하나의 기능만 검증
3. **독립성**: 테스트 간 의존성 없음
4. **반복 가능**: 언제든 동일한 결과

### 단위 테스트 예시

```javascript
// api-service.test.js
describe('APIService', () => {
  let apiService;
  
  beforeEach(() => {
    apiService = new APIService();
  });
  
  describe('sendMessage', () => {
    test('유효한 메시지로 API 호출 성공', async () => {
      // Arrange
      const messages = [{ role: 'user', content: 'Hello' }];
      const mockResponse = { content: [{ text: 'Hi there!' }] };
      
      jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse)
      });
      
      // Act
      const result = await apiService.sendMessage(messages);
      
      // Assert
      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith('/api/claude/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages })
      });
    });
    
    test('API 오류 시 예외 발생', async () => {
      // Arrange
      jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: false,
        status: 500
      });
      
      // Act & Assert
      await expect(apiService.sendMessage([])).rejects.toThrow('HTTP 500');
    });
  });
});
```

### 통합 테스트 예시

```javascript
// integration.test.js
describe('전체 워크플로우 통합 테스트', () => {
  test('메시지 전송부터 응답까지', async () => {
    // 실제 서버와의 통합 테스트
    const response = await request(app)
      .post('/api/claude/messages')
      .send({ messages: [{ role: 'user', content: 'Test' }] })
      .expect(200);
      
    expect(response.body).toHaveProperty('content');
  });
});
```

### 테스트 실행

```bash
# 모든 테스트 실행
npm test

# 특정 파일 테스트
npm test -- api-service.test.js

# 커버리지 리포트
npm run test:coverage

# 감시 모드
npm run test:watch
```

---

## 📬 Pull Request 가이드

### PR 제목 컨벤션

```
타입: 간략한 설명 (#이슈번호)

예시:
feat: Claude API 스트리밍 지원 추가 (#123)
fix: 음성 인식 권한 오류 수정 (#124)
docs: README 설치 가이드 개선 (#125)
refactor: API 서비스 코드 리팩토링 (#126)
test: 채팅 컴포넌트 테스트 추가 (#127)
```

### PR 템플릿

```markdown
## 🎯 변경 사항

### 추가된 기능
- [ ] 새로운 음성 명령 인식
- [ ] 실시간 번역 기능

### 수정된 버그
- [ ] #123: 마이크 권한 오류
- [ ] #124: 캐시 만료 문제

### 개선 사항
- [ ] 응답 속도 최적화
- [ ] UI/UX 개선

## 🧪 테스트

- [ ] 단위 테스트 통과
- [ ] 통합 테스트 통과
- [ ] 수동 테스트 완료
- [ ] 회귀 테스트 확인

## 📸 스크린샷/데모

<!-- 변경 사항을 보여주는 스크린샷이나 GIF -->

## 📝 체크리스트

- [ ] 코딩 스타일 가이드 준수
- [ ] 문서 업데이트 (필요시)
- [ ] Breaking changes 없음
- [ ] 성능에 부정적 영향 없음
- [ ] 접근성 고려사항 검토

## 🔗 관련 이슈

Closes #123
Related to #124

## 📋 추가 정보

<!-- 리뷰어가 알아야 할 추가 정보 -->
```

### PR 리뷰 과정

1. **자동 검사**: CI/CD 파이프라인 통과 확인
2. **코드 리뷰**: 최소 2명의 리뷰어 승인 필요
3. **테스트**: 모든 테스트 통과 확인
4. **문서**: 필요시 문서 업데이트
5. **승인**: 메인테이너 최종 승인 후 머지

---

## 🐛 이슈 리포팅

### 버그 리포트 템플릿

```markdown
## 🐛 버그 설명

음성 인식 기능이 Chrome에서 작동하지 않습니다.

## 🔄 재현 단계

1. Chrome 브라우저에서 앱 접속
2. 마이크 권한 허용
3. 음성 입력 버튼 클릭
4. 말하기 시도

## 🎯 예상 동작

음성이 텍스트로 변환되어 입력창에 표시

## 💥 실제 동작

"음성 인식을 지원하지 않는 브라우저입니다" 오류 메시지 표시

## 🖥️ 환경 정보

- **OS**: Windows 11
- **브라우저**: Chrome 120.0.6099.109
- **앱 버전**: v2.0.0
- **디바이스**: Desktop

## 📸 스크린샷

<!-- 스크린샷 첨부 -->

## 📋 추가 정보

- Firefox에서는 정상 작동
- 개발자 도구에서 특별한 오류 없음
```

### 기능 제안 템플릿

```markdown
## 💡 기능 제안

음성 명령으로 페이지 네비게이션

## 🎯 문제점/필요성

현재 터치나 클릭으로만 페이지 이동이 가능한데, 
핸즈프리 환경에서 불편함을 겪고 있습니다.

## 💭 제안 해결책

"설정으로 이동", "채팅으로 돌아가기" 등의 
음성 명령을 인식하여 페이지 전환

## 🔄 대안

- 키보드 단축키 지원
- 제스처 네비게이션

## 📈 추가 컨텍스트

- 접근성 향상
- 차량 내 사용 시 유용
- 핸즈프리 작업 환경 지원
```

---

## 🤝 커뮤니티 가이드라인

### 행동 규범

1. **존중**: 모든 기여자를 존중하고 배려
2. **포용성**: 다양한 배경과 경험을 환영
3. **건설적**: 건설적이고 도움이 되는 피드백 제공
4. **협력**: 공동 목표를 위한 협력적 태도
5. **학습**: 실수로부터 배우는 성장 마인드

### 커뮤니케이션 가이드

#### ✅ 좋은 예시

```
"이 접근법도 좋지만, 성능 관점에서 이런 방법은 어떨까요? 
[코드 예시]
참고 링크: [관련 문서]"

"버그 리포트 감사합니다! 재현해보니 확실히 문제가 있네요. 
다음 릴리스에서 수정하겠습니다."
```

#### ❌ 피해야 할 표현

```
"이건 완전히 잘못된 방법입니다."
"이렇게 기본적인 것도 모르세요?"
"당연히 안 되죠."
```

### 도움 요청

- 💬 **Discord**: 실시간 채팅 (discord.gg/koki-ai)
- 📧 **이메일**: help@koki-ai.com
- 📖 **문서**: docs.koki-ai.com
- 🎥 **튜토리얼**: youtube.com/koki-ai

### 기여자 인정

모든 기여는 다음과 같이 인정됩니다:

- 📜 README 기여자 섹션에 이름 등재
- 🏆 GitHub 프로필에 기여 기록
- 💌 월간 기여자 뉴스레터
- 🎁 주요 기여자 굿즈 및 혜택

---

## 🎉 마무리

Koki AI Hub는 커뮤니티의 힘으로 성장하는 프로젝트입니다. 
여러분의 기여가 더 나은 AI 경험을 만드는 데 도움이 됩니다.

질문이 있으시면 언제든 연락해주세요!

**Happy Contributing! 🚀**

---

*이 가이드라인은 지속적으로 개선됩니다. 
제안 사항이 있으시면 이슈로 등록해주세요.*
