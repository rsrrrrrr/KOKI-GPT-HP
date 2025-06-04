# 🚀 Koki AI Hub API 문서

**완벽한 AI 워크벤치 API 가이드**

---

## 📋 목차

1. [개요](#-개요)
2. [인증](#-인증)
3. [Claude API](#-claude-api)
4. [OpenAI API](#-openai-api)
5. [WebSocket API](#-websocket-api)
6. [캐시 관리](#-캐시-관리)
7. [모니터링](#-모니터링)
8. [에러 처리](#-에러-처리)
9. [SDK 및 예제](#-sdk-및-예제)

---

## 🎯 개요

Koki AI Hub는 여러 AI 서비스를 통합하는 RESTful API와 실시간 WebSocket API를 제공합니다.

### 기본 정보

- **Base URL**: `https://api.koki-ai.com` (프로덕션) / `http://localhost:3001` (로컬)
- **API Version**: v1
- **Content-Type**: `application/json`
- **Rate Limiting**: 100 requests/15min (일반), 50 requests/1min (Claude API)
- **CORS**: 설정된 도메인에서만 접근 가능

### 지원 기능

- 🤖 **Claude AI 통합**: Anthropic Claude API 프록시
- 🧠 **OpenAI 통합**: GPT-4 API 프록시  
- 🔄 **실시간 스트리밍**: Server-Sent Events 지원
- 🌐 **WebSocket**: 실시간 양방향 통신
- 💾 **캐싱**: Redis 기반 지능형 캐싱
- 📊 **모니터링**: 사용량 통계 및 헬스체크

---

## 🔐 인증

### API 키 설정

현재 버전에서는 클라이언트 사이드에서 직접 API 키를 관리합니다.

```javascript
// 환경 변수 또는 설정에서 API 키 설정
const ANTHROPIC_API_KEY = 'sk-ant-your-api-key';
const OPENAI_API_KEY = 'sk-your-openai-key';
```

### 헤더 설정

```javascript
const headers = {
  'Content-Type': 'application/json',
  'User-Agent': 'Koki-AI-Hub/2.0.0'
};
```

---

## 🤖 Claude API

### POST /api/claude/messages

Claude AI와 대화를 위한 메인 엔드포인트입니다.

#### 요청

```http
POST /api/claude/messages
Content-Type: application/json

{
  "messages": [
    {
      "role": "user", 
      "content": "Hello, Claude!"
    }
  ],
  "max_tokens": 4096,
  "temperature": 0.7,
  "system": "You are a helpful assistant."
}
```

#### 파라미터

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `messages` | Array | ✅ | 대화 메시지 배열 |
| `messages[].role` | String | ✅ | `user` 또는 `assistant` |
| `messages[].content` | String | ✅ | 메시지 내용 |
| `max_tokens` | Integer | ❌ | 최대 토큰 수 (기본: 4096) |
| `temperature` | Float | ❌ | 창의성 수준 0.0-1.0 (기본: 0.7) |
| `system` | String | ❌ | 시스템 프롬프트 |

#### 응답

```json
{
  "id": "msg_123456789",
  "type": "message",
  "role": "assistant",
  "content": [
    {
      "type": "text",
      "text": "Hello! I'm Claude, an AI assistant. How can I help you today?"
    }
  ],
  "model": "claude-3-sonnet-20240229",
  "stop_reason": "end_turn",
  "stop_sequence": null,
  "usage": {
    "input_tokens": 10,
    "output_tokens": 25
  }
}
```

#### 예제 코드

<details>
<summary>JavaScript/Fetch</summary>

```javascript
async function sendClaudeMessage(message) {
  try {
    const response = await fetch('/api/claude/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          { role: 'user', content: message }
        ],
        max_tokens: 4096
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.content[0].text;
  } catch (error) {
    console.error('Claude API 오류:', error);
    throw error;
  }
}

// 사용 예시
sendClaudeMessage('안녕하세요, Claude!')
  .then(response => console.log(response))
  .catch(error => console.error(error));
```

</details>

<details>
<summary>Python/Requests</summary>

```python
import requests
import json

def send_claude_message(message):
    url = "http://localhost:3001/api/claude/messages"
    
    payload = {
        "messages": [
            {"role": "user", "content": message}
        ],
        "max_tokens": 4096
    }
    
    headers = {
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()
        
        data = response.json()
        return data["content"][0]["text"]
    
    except requests.exceptions.RequestException as e:
        print(f"Claude API 오류: {e}")
        raise

# 사용 예시
try:
    result = send_claude_message("안녕하세요, Claude!")
    print(result)
except Exception as e:
    print(f"오류: {e}")
```

</details>

<details>
<summary>curl</summary>

```bash
curl -X POST http://localhost:3001/api/claude/messages \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "안녕하세요, Claude!"
      }
    ],
    "max_tokens": 4096,
    "temperature": 0.7
  }'
```

</details>

### POST /api/claude/stream

실시간 스트리밍 응답을 위한 엔드포인트입니다.

#### 요청

```http
POST /api/claude/stream
Content-Type: application/json

{
  "messages": [
    {
      "role": "user",
      "content": "Tell me a long story"
    }
  ]
}
```

#### 응답 (Server-Sent Events)

```
data: {"type": "content", "text": "Once"}

data: {"type": "content", "text": " upon"}

data: {"type": "content", "text": " a"}

data: {"type": "content", "text": " time"}

data: [DONE]
```

#### 예제 코드

```javascript
async function streamClaudeMessage(message, onChunk) {
  const response = await fetch('/api/claude/stream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: [{ role: 'user', content: message }]
    })
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  try {
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;
      
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          
          if (data === '[DONE]') {
            return;
          }
          
          try {
            const parsed = JSON.parse(data);
            if (parsed.type === 'content') {
              onChunk(parsed.text);
            }
          } catch (e) {
            // JSON 파싱 오류 무시
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

// 사용 예시
streamClaudeMessage('긴 이야기를 들려주세요', (chunk) => {
  console.log('받은 청크:', chunk);
});
```

---

## 🧠 OpenAI API

### POST /api/openai/chat/completions

OpenAI GPT 모델과의 대화를 위한 엔드포인트입니다.

#### 요청

```http
POST /api/openai/chat/completions
Content-Type: application/json

{
  "model": "gpt-4",
  "messages": [
    {
      "role": "user",
      "content": "Hello, GPT!"
    }
  ],
  "max_tokens": 4096,
  "temperature": 0.7
}
```

#### 파라미터

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `model` | String | ❌ | 모델명 (기본: gpt-4) |
| `messages` | Array | ✅ | 대화 메시지 배열 |
| `max_tokens` | Integer | ❌ | 최대 토큰 수 |
| `temperature` | Float | ❌ | 창의성 수준 0.0-2.0 |
| `top_p` | Float | ❌ | 확률 컷오프 |
| `frequency_penalty` | Float | ❌ | 빈도 페널티 |
| `presence_penalty` | Float | ❌ | 존재 페널티 |

#### 응답

```json
{
  "id": "chatcmpl-123",
  "object": "chat.completion", 
  "created": 1677652288,
  "model": "gpt-4",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Hello! I'm GPT-4. How can I assist you today?"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 9,
    "completion_tokens": 12,
    "total_tokens": 21
  }
}
```

#### 예제 코드

```javascript
async function sendGPTMessage(message) {
  try {
    const response = await fetch('/api/openai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'user', content: message }
        ],
        max_tokens: 4096
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API 오류:', error);
    throw error;
  }
}
```

---

## 🌐 WebSocket API

실시간 양방향 통신을 위한 WebSocket API입니다.

### 연결

```javascript
const ws = new WebSocket('ws://localhost:3001/ws');

ws.onopen = () => {
  console.log('WebSocket 연결됨');
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('받은 메시지:', data);
};

ws.onerror = (error) => {
  console.error('WebSocket 오류:', error);
};

ws.onclose = () => {
  console.log('WebSocket 연결 종료됨');
};
```

### 메시지 형식

#### 채팅 요청

```json
{
  "type": "chat",
  "id": "unique-request-id",
  "messages": [
    {
      "role": "user",
      "content": "Hello via WebSocket!"
    }
  ],
  "options": {
    "model": "claude-3-sonnet-20240229",
    "max_tokens": 4096
  }
}
```

#### 채팅 응답

```json
{
  "type": "chat_response",
  "id": "unique-request-id",
  "response": {
    "content": [
      {
        "type": "text",
        "text": "Hello! This is a WebSocket response."
      }
    ]
  }
}
```

#### Ping/Pong

```json
// 클라이언트에서 서버로
{
  "type": "ping"
}

// 서버에서 클라이언트로
{
  "type": "pong"
}
```

#### 에러

```json
{
  "type": "error",
  "id": "request-id-if-applicable",
  "error": "Error message"
}
```

### 예제 코드

```javascript
class KokiWebSocket {
  constructor(url) {
    this.ws = new WebSocket(url);
    this.requestHandlers = new Map();
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.ws.onopen = () => {
      console.log('WebSocket 연결됨');
      this.startHeartbeat();
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleMessage(data);
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket 오류:', error);
    };

    this.ws.onclose = () => {
      console.log('WebSocket 연결 종료됨');
      this.stopHeartbeat();
    };
  }

  handleMessage(data) {
    switch (data.type) {
      case 'chat_response':
        const handler = this.requestHandlers.get(data.id);
        if (handler) {
          handler.resolve(data.response);
          this.requestHandlers.delete(data.id);
        }
        break;
      
      case 'chat_error':
        const errorHandler = this.requestHandlers.get(data.id);
        if (errorHandler) {
          errorHandler.reject(new Error(data.error));
          this.requestHandlers.delete(data.id);
        }
        break;
      
      case 'pong':
        // 하트비트 응답
        break;
    }
  }

  sendChatMessage(messages, options = {}) {
    return new Promise((resolve, reject) => {
      const id = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      this.requestHandlers.set(id, { resolve, reject });
      
      this.ws.send(JSON.stringify({
        type: 'chat',
        id: id,
        messages: messages,
        options: options
      }));
      
      // 타임아웃 설정 (30초)
      setTimeout(() => {
        if (this.requestHandlers.has(id)) {
          this.requestHandlers.delete(id);
          reject(new Error('요청 타임아웃'));
        }
      }, 30000);
    });
  }

  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000); // 30초마다 ping
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
  }

  close() {
    this.stopHeartbeat();
    this.ws.close();
  }
}

// 사용 예시
const kokiWS = new KokiWebSocket('ws://localhost:3001/ws');

// 메시지 전송
kokiWS.sendChatMessage([
  { role: 'user', content: 'WebSocket을 통한 채팅!' }
]).then(response => {
  console.log('응답:', response);
}).catch(error => {
  console.error('오류:', error);
});
```

---

## 💾 캐시 관리

### GET /api/cache/stats

캐시 사용량 통계를 조회합니다.

#### 응답

```json
{
  "used_memory": "15728640",
  "used_memory_human": "15.00M",
  "total_connections_received": "1000",
  "total_commands_processed": "5000",
  "keyspace_hits": "450",
  "keyspace_misses": "50",
  "hit_rate": "90.0%"
}
```

### DELETE /api/cache/:key

특정 캐시 키를 삭제합니다.

#### 요청

```http
DELETE /api/cache/user_session_123
```

#### 응답

```json
{
  "deleted": true
}
```

### POST /api/cache/clear

전체 캐시를 지웁니다. (관리자 권한 필요)

#### 응답

```json
{
  "cleared": true,
  "keys_deleted": 1234
}
```

---

## 📊 모니터링

### GET /health

서비스 상태를 확인합니다.

#### 응답

```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "uptime": 86400,
  "version": "2.0.0",
  "services": {
    "redis": "healthy",
    "claude_api": "healthy",
    "openai_api": "healthy"
  },
  "metrics": {
    "requests_per_minute": 45,
    "average_response_time": 1250,
    "error_rate": 0.02
  }
}
```

### GET /api/stats/usage

API 사용량 통계를 조회합니다.

#### 응답

```json
{
  "today": {
    "claude": 150,
    "openai": 75,
    "claude_stream": 25
  },
  "this_week": {
    "claude": 1200,
    "openai": 600,
    "claude_stream": 200
  },
  "this_month": {
    "claude": 5000,
    "openai": 2500,
    "claude_stream": 800
  }
}
```

### GET /metrics

Prometheus 메트릭을 제공합니다.

#### 응답 (Prometheus 형식)

```
# HELP http_requests_total Total number of HTTP requests
# TYPE http_requests_total counter
http_requests_total{method="GET",status="200"} 1234
http_requests_total{method="POST",status="200"} 567

# HELP http_request_duration_seconds HTTP request duration
# TYPE http_request_duration_seconds histogram
http_request_duration_seconds_bucket{le="0.1"} 100
http_request_duration_seconds_bucket{le="0.5"} 200
http_request_duration_seconds_bucket{le="1.0"} 250
```

---

## ❌ 에러 처리

### 에러 응답 형식

모든 API 에러는 다음 형식으로 반환됩니다:

```json
{
  "error": {
    "type": "invalid_request_error",
    "code": "invalid_api_key",
    "message": "API 키가 유효하지 않습니다",
    "details": {
      "field": "api_key",
      "expected": "string starting with 'sk-ant-'"
    }
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "request_id": "req_123456789"
}
```

### HTTP 상태 코드

| 코드 | 설명 | 예시 |
|------|------|------|
| `200` | 성공 | 정상 응답 |
| `400` | 잘못된 요청 | 필수 파라미터 누락 |
| `401` | 인증 실패 | 잘못된 API 키 |
| `403` | 권한 없음 | 접근 금지된 리소스 |
| `404` | 찾을 수 없음 | 존재하지 않는 엔드포인트 |
| `429` | 요청 제한 | 레이트 리미트 초과 |
| `500` | 서버 오류 | 내부 서버 오류 |
| `502` | 게이트웨이 오류 | 업스트림 서버 오류 |
| `503` | 서비스 이용 불가 | 서버 점검 중 |

### 에러 타입

#### `invalid_request_error`
- 잘못된 파라미터
- 필수 필드 누락
- 잘못된 데이터 형식

#### `authentication_error`
- API 키 누락
- 잘못된 API 키
- 만료된 토큰

#### `permission_error`
- 권한 부족
- 리소스 접근 금지

#### `rate_limit_error`
- 요청 한도 초과
- API 할당량 소진

#### `api_error`
- 외부 API 오류
- 네트워크 문제
- 타임아웃

#### `server_error`
- 내부 서버 오류
- 데이터베이스 연결 실패
- 메모리 부족

### 에러 처리 예제

```javascript
async function handleApiRequest(url, options) {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new ApiError(response.status, errorData.error);
    }
    
    return await response.json();
    
  } catch (error) {
    if (error instanceof ApiError) {
      // API 에러 처리
      console.error(`API 오류 [${error.status}]:`, error.message);
      
      switch (error.type) {
        case 'rate_limit_error':
          // 재시도 로직
          await delay(error.retryAfter || 60000);
          return handleApiRequest(url, options);
          
        case 'authentication_error':
          // 인증 갱신 로직
          await refreshApiKey();
          return handleApiRequest(url, options);
          
        case 'server_error':
          // 서버 오류는 사용자에게 친화적 메시지
          throw new Error('일시적인 서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
          
        default:
          throw error;
      }
    } else {
      // 네트워크 오류 등
      console.error('네트워크 오류:', error);
      throw new Error('네트워크 연결을 확인해주세요.');
    }
  }
}

class ApiError extends Error {
  constructor(status, errorData) {
    super(errorData.message);
    this.name = 'ApiError';
    this.status = status;
    this.type = errorData.type;
    this.code = errorData.code;
    this.details = errorData.details;
    this.retryAfter = errorData.retry_after;
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

---

## 🛠️ SDK 및 예제

### JavaScript SDK

```javascript
class KokiAIClient {
  constructor(baseUrl = 'http://localhost:3001') {
    this.baseUrl = baseUrl;
    this.defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Koki-AI-Hub-SDK/2.0.0'
      }
    };
  }

  async claude(messages, options = {}) {
    const response = await this.request('/api/claude/messages', {
      method: 'POST',
      body: JSON.stringify({
        messages,
        ...options
      })
    });
    
    return response.content[0].text;
  }

  async gpt(messages, options = {}) {
    const response = await this.request('/api/openai/chat/completions', {
      method: 'POST',
      body: JSON.stringify({
        model: 'gpt-4',
        messages,
        ...options
      })
    });
    
    return response.choices[0].message.content;
  }

  async dualAnalysis(message) {
    const [claudeResponse, gptResponse] = await Promise.all([
      this.claude([{ role: 'user', content: message }]),
      this.gpt([{ role: 'user', content: message }])
    ]);

    return {
      claude: claudeResponse,
      gpt: gptResponse,
      comparison: this.compareResponses(claudeResponse, gptResponse)
    };
  }

  compareResponses(claude, gpt) {
    return {
      length: {
        claude: claude.length,
        gpt: gpt.length
      },
      tone: this.analyzeTone(claude, gpt),
      similarity: this.calculateSimilarity(claude, gpt)
    };
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      ...this.defaultOptions,
      ...options,
      headers: {
        ...this.defaultOptions.headers,
        ...options.headers
      }
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API Error: ${errorData.error?.message || response.statusText}`);
    }

    return await response.json();
  }

  // 유틸리티 메서드들
  analyzeTone(text1, text2) {
    // 간단한 톤 분석 (실제로는 더 정교한 NLP 라이브러리 사용)
    return {
      formal: this.isFormal(text1) && this.isFormal(text2),
      technical: this.isTechnical(text1) || this.isTechnical(text2)
    };
  }

  calculateSimilarity(text1, text2) {
    // 코사인 유사도 계산 (단순화된 버전)
    const words1 = text1.toLowerCase().split(/\s+/);
    const words2 = text2.toLowerCase().split(/\s+/);
    const commonWords = words1.filter(word => words2.includes(word));
    
    return commonWords.length / Math.max(words1.length, words2.length);
  }

  isFormal(text) {
    const formalWords = ['따라서', '그러므로', '즉', '또한', '그러나'];
    return formalWords.some(word => text.includes(word));
  }

  isTechnical(text) {
    const techWords = ['API', '함수', '변수', '클래스', '데이터'];
    return techWords.some(word => text.includes(word));
  }
}

// 사용 예시
const koki = new KokiAIClient();

// Claude와 대화
koki.claude([
  { role: 'user', content: '인공지능의 미래에 대해 알려주세요' }
]).then(response => {
  console.log('Claude:', response);
});

// 듀얼 AI 분석
koki.dualAnalysis('블록체인 기술의 장단점은 무엇인가요?')
  .then(analysis => {
    console.log('Claude 응답:', analysis.claude);
    console.log('GPT 응답:', analysis.gpt);
    console.log('비교 결과:', analysis.comparison);
  });
```

### Python SDK

```python
import requests
import asyncio
import aiohttp
from typing import List, Dict, Any, Optional

class KokiAIClient:
    def __init__(self, base_url: str = "http://localhost:3001"):
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'User-Agent': 'Koki-AI-Hub-SDK/2.0.0'
        })

    def claude(self, messages: List[Dict[str, str]], **options) -> str:
        """Claude AI에게 메시지 전송"""
        response = self.session.post(
            f"{self.base_url}/api/claude/messages",
            json={
                "messages": messages,
                **options
            }
        )
        response.raise_for_status()
        data = response.json()
        return data["content"][0]["text"]

    def gpt(self, messages: List[Dict[str, str]], **options) -> str:
        """GPT-4에게 메시지 전송"""
        response = self.session.post(
            f"{self.base_url}/api/openai/chat/completions",
            json={
                "model": "gpt-4",
                "messages": messages,
                **options
            }
        )
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"]

    def dual_analysis(self, message: str) -> Dict[str, Any]:
        """Claude와 GPT-4 응답 비교 분석"""
        messages = [{"role": "user", "content": message}]
        
        # 병렬 요청
        import concurrent.futures
        
        with concurrent.futures.ThreadPoolExecutor() as executor:
            claude_future = executor.submit(self.claude, messages)
            gpt_future = executor.submit(self.gpt, messages)
            
            claude_response = claude_future.result()
            gpt_response = gpt_future.result()

        return {
            "claude": claude_response,
            "gpt": gpt_response,
            "comparison": self._compare_responses(claude_response, gpt_response)
        }

    def _compare_responses(self, claude: str, gpt: str) -> Dict[str, Any]:
        """응답 비교 분석"""
        return {
            "length": {
                "claude": len(claude),
                "gpt": len(gpt)
            },
            "word_count": {
                "claude": len(claude.split()),
                "gpt": len(gpt.split())
            },
            "similarity": self._calculate_similarity(claude, gpt)
        }

    def _calculate_similarity(self, text1: str, text2: str) -> float:
        """텍스트 유사도 계산"""
        words1 = set(text1.lower().split())
        words2 = set(text2.lower().split())
        
        intersection = words1.intersection(words2)
        union = words1.union(words2)
        
        return len(intersection) / len(union) if union else 0.0

    def get_health(self) -> Dict[str, Any]:
        """서버 상태 확인"""
        response = self.session.get(f"{self.base_url}/health")
        response.raise_for_status()
        return response.json()

    def get_usage_stats(self) -> Dict[str, Any]:
        """사용량 통계 조회"""
        response = self.session.get(f"{self.base_url}/api/stats/usage")
        response.raise_for_status()
        return response.json()

# 비동기 버전
class AsyncKokiAIClient:
    def __init__(self, base_url: str = "http://localhost:3001"):
        self.base_url = base_url

    async def claude(self, messages: List[Dict[str, str]], **options) -> str:
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{self.base_url}/api/claude/messages",
                json={"messages": messages, **options}
            ) as response:
                response.raise_for_status()
                data = await response.json()
                return data["content"][0]["text"]

    async def gpt(self, messages: List[Dict[str, str]], **options) -> str:
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{self.base_url}/api/openai/chat/completions",
                json={"model": "gpt-4", "messages": messages, **options}
            ) as response:
                response.raise_for_status()
                data = await response.json()
                return data["choices"][0]["message"]["content"]

    async def dual_analysis(self, message: str) -> Dict[str, Any]:
        messages = [{"role": "user", "content": message}]
        
        # 비동기 병렬 처리
        claude_task = self.claude(messages)
        gpt_task = self.gpt(messages)
        
        claude_response, gpt_response = await asyncio.gather(
            claude_task, gpt_task
        )

        return {
            "claude": claude_response,
            "gpt": gpt_response,
            "comparison": self._compare_responses(claude_response, gpt_response)
        }

# 사용 예시
if __name__ == "__main__":
    # 동기 방식
    client = KokiAIClient()
    
    # Claude와 대화
    response = client.claude([
        {"role": "user", "content": "Python으로 웹 스크래핑하는 방법을 알려주세요"}
    ])
    print("Claude:", response)
    
    # 듀얼 분석
    analysis = client.dual_analysis("머신러닝의 기본 개념을 설명해주세요")
    print("Claude:", analysis["claude"])
    print("GPT:", analysis["gpt"])
    print("유사도:", analysis["comparison"]["similarity"])
    
    # 비동기 방식
    async def async_example():
        async_client = AsyncKokiAIClient()
        analysis = await async_client.dual_analysis("데이터 과학이란 무엇인가요?")
        print("비동기 결과:", analysis)
    
    asyncio.run(async_example())
```

---

## 📝 추가 예제

### React Hook

```javascript
import { useState, useCallback } from 'react';

export const useKokiAI = (baseUrl = 'http://localhost:3001') => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendMessage = useCallback(async (message, provider = 'claude') => {
    setLoading(true);
    setError(null);

    try {
      const endpoint = provider === 'claude' 
        ? '/api/claude/messages'
        : '/api/openai/chat/completions';

      const payload = provider === 'claude'
        ? { messages: [{ role: 'user', content: message }] }
        : { 
            model: 'gpt-4',
            messages: [{ role: 'user', content: message }] 
          };

      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      const result = provider === 'claude'
        ? data.content[0].text
        : data.choices[0].message.content;

      return result;

    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [baseUrl]);

  const dualAnalysis = useCallback(async (message) => {
    setLoading(true);
    setError(null);

    try {
      const [claudeResponse, gptResponse] = await Promise.all([
        sendMessage(message, 'claude'),
        sendMessage(message, 'gpt')
      ]);

      return {
        claude: claudeResponse,
        gpt: gptResponse
      };

    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [sendMessage]);

  return {
    sendMessage,
    dualAnalysis,
    loading,
    error
  };
};

// 사용 예시
function ChatComponent() {
  const { sendMessage, dualAnalysis, loading, error } = useKokiAI();
  const [response, setResponse] = useState('');

  const handleSendMessage = async () => {
    try {
      const result = await sendMessage('안녕하세요!', 'claude');
      setResponse(result);
    } catch (error) {
      console.error('메시지 전송 실패:', error);
    }
  };

  return (
    <div>
      <button onClick={handleSendMessage} disabled={loading}>
        {loading ? '전송 중...' : '메시지 전송'}
      </button>
      {error && <div className="error">오류: {error}</div>}
      {response && <div className="response">{response}</div>}
    </div>
  );
}
```

### Vue.js Composable

```javascript
import { ref, computed } from 'vue';

export function useKokiAI(baseUrl = 'http://localhost:3001') {
  const loading = ref(false);
  const error = ref(null);
  const responses = ref([]);

  const isLoading = computed(() => loading.value);
  const hasError = computed(() => !!error.value);

  const sendMessage = async (message, provider = 'claude') => {
    loading.value = true;
    error.value = null;

    try {
      const endpoint = provider === 'claude' 
        ? '/api/claude/messages'
        : '/api/openai/chat/completions';

      const payload = provider === 'claude'
        ? { messages: [{ role: 'user', content: message }] }
        : { 
            model: 'gpt-4',
            messages: [{ role: 'user', content: message }] 
          };

      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      const result = provider === 'claude'
        ? data.content[0].text
        : data.choices[0].message.content;

      responses.value.push({
        message,
        response: result,
        provider,
        timestamp: new Date()
      });

      return result;

    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const clearHistory = () => {
    responses.value = [];
    error.value = null;
  };

  return {
    // State
    loading: isLoading,
    error: hasError,
    responses: computed(() => responses.value),
    
    // Actions
    sendMessage,
    clearHistory
  };
}
```

---

이 API 문서는 Koki AI Hub의 모든 기능을 활용하는 데 필요한 정보를 제공합니다. 추가 질문이나 지원이 필요하시면 [GitHub Issues](https://github.com/koki-ai/hub/issues) 또는 [커뮤니티](https://community.koki-ai.com)를 이용해주세요.

**Happy Coding! 🚀**
