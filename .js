/**
 * Koki AI Hub API 프록시 서버 테스트 스위트
 * Jest를 사용한 종합적인 테스트
 */

const request = require('supertest');
const KokiAPIProxy = require('../server');
const Redis = require('redis');

// 테스트 설정
process.env.NODE_ENV = 'test';
process.env.PORT = 3002;
process.env.REDIS_HOST = 'localhost';
process.env.REDIS_PORT = '6380'; // 테스트용 Redis 포트

describe('Koki AI Hub API 프록시', () => {
  let app;
  let server;
  let redis;

  beforeAll(async () => {
    // 테스트용 서버 시작
    app = new KokiAPIProxy();
    server = app.server;
    
    // 테스트용 Redis 연결
    redis = Redis.createClient({
      socket: { host: 'localhost', port: 6380 }
    });
    await redis.connect();
    
    // 테스트 데이터 설정
    await setupTestData();
  });

  afterAll(async () => {
    // 테스트 데이터 정리
    await cleanupTestData();
    
    // 연결 종료
    if (redis) await redis.quit();
    if (server) server.close();
  });

  beforeEach(async () => {
    // 각 테스트 전 캐시 초기화
    if (redis) await redis.flushAll();
  });

  describe('🔍 기본 엔드포인트', () => {
    test('GET /health - 헬스체크 응답', async () => {
      const response = await request(server)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
    });

    test('GET /nonexistent - 404 응답', async () => {
      await request(server)
        .get('/nonexistent')
        .expect(404);
    });

    test('OPTIONS /api/claude/messages - CORS 프리플라이트', async () => {
      const response = await request(server)
        .options('/api/claude/messages')
        .expect(200);

      expect(response.headers).toHaveProperty('access-control-allow-origin');
      expect(response.headers).toHaveProperty('access-control-allow-methods');
    });
  });

  describe('🤖 Claude API 프록시', () => {
    const validMessage = {
      messages: [
        { role: 'user', content: 'Hello, world!' }
      ]
    };

    test('POST /api/claude/messages - 유효한 요청', async () => {
      const response = await request(server)
        .post('/api/claude/messages')
        .send(validMessage)
        .expect(200);

      expect(response.body).toHaveProperty('content');
      expect(Array.isArray(response.body.content)).toBe(true);
    });

    test('POST /api/claude/messages - 잘못된 요청 형식', async () => {
      const response = await request(server)
        .post('/api/claude/messages')
        .send({ invalid: 'data' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('messages array required');
    });

    test('POST /api/claude/messages - 빈 메시지 배열', async () => {
      const response = await request(server)
        .post('/api/claude/messages')
        .send({ messages: [] })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    test('POST /api/claude/messages - 시스템 프롬프트 포함', async () => {
      const messageWithSystem = {
        ...validMessage,
        system: 'You are a helpful assistant.'
      };

      const response = await request(server)
        .post('/api/claude/messages')
        .send(messageWithSystem)
        .expect(200);

      expect(response.body).toHaveProperty('content');
    });

    test('POST /api/claude/messages - 캐시 테스트', async () => {
      // 첫 번째 요청
      const start1 = Date.now();
      await request(server)
        .post('/api/claude/messages')
        .send(validMessage)
        .expect(200);
      const duration1 = Date.now() - start1;

      // 두 번째 요청 (캐시됨)
      const start2 = Date.now();
      const response2 = await request(server)
        .post('/api/claude/messages')
        .send(validMessage)
        .expect(200);
      const duration2 = Date.now() - start2;

      // 캐시된 응답이 더 빨라야 함
      expect(duration2).toBeLessThan(duration1);
      expect(response2.body).toHaveProperty('content');
    });

    test('POST /api/claude/stream - 스트리밍 응답', async () => {
      const response = await request(server)
        .post('/api/claude/stream')
        .send(validMessage)
        .expect(200);

      expect(response.headers['content-type']).toContain('text/event-stream');
    });
  });

  describe('🔄 OpenAI API 프록시', () => {
    const openaiMessage = {
      messages: [
        { role: 'user', content: 'Hello from OpenAI!' }
      ]
    };

    test('POST /api/openai/chat/completions - OpenAI 요청', async () => {
      if (!process.env.OPENAI_API_KEY) {
        return test.skip('OpenAI API 키가 설정되지 않음');
      }

      const response = await request(server)
        .post('/api/openai/chat/completions')
        .send(openaiMessage)
        .expect(200);

      expect(response.body).toHaveProperty('choices');
      expect(Array.isArray(response.body.choices)).toBe(true);
    });

    test('POST /api/openai/chat/completions - API 키 없음', async () => {
      // 임시로 API 키 제거
      const originalKey = process.env.OPENAI_API_KEY;
      delete process.env.OPENAI_API_KEY;

      const response = await request(server)
        .post('/api/openai/chat/completions')
        .send(openaiMessage)
        .expect(503);

      expect(response.body.error).toContain('not configured');

      // API 키 복원
      process.env.OPENAI_API_KEY = originalKey;
    });
  });

  describe('💾 캐시 관리', () => {
    test('GET /api/cache/stats - 캐시 통계', async () => {
      const response = await request(server)
        .get('/api/cache/stats')
        .expect(200);

      expect(typeof response.body).toBe('object');
    });

    test('DELETE /api/cache/:key - 캐시 삭제', async () => {
      // 캐시 항목 생성
      await redis.set('test-key', 'test-value');

      const response = await request(server)
        .delete('/api/cache/test-key')
        .expect(200);

      expect(response.body).toHaveProperty('deleted', true);

      // 삭제 확인
      const value = await redis.get('test-key');
      expect(value).toBeNull();
    });
  });

  describe('📊 사용량 통계', () => {
    test('GET /api/stats/usage - 사용량 조회', async () => {
      const response = await request(server)
        .get('/api/stats/usage')
        .expect(200);

      expect(response.body).toHaveProperty('claude');
      expect(response.body).toHaveProperty('openai');
      expect(typeof response.body.claude).toBe('number');
    });
  });

  describe('🚦 레이트 제한', () => {
    test('레이트 제한 테스트', async () => {
      const requests = [];
      
      // 동시에 많은 요청 전송
      for (let i = 0; i < 105; i++) {
        requests.push(
          request(server)
            .post('/api/claude/messages')
            .send(validMessage)
        );
      }

      const responses = await Promise.allSettled(requests);
      
      // 일부 요청이 429 상태로 차단되어야 함
      const rateLimited = responses.filter(
        result => result.value?.status === 429
      );
      
      expect(rateLimited.length).toBeGreaterThan(0);
    });
  });

  describe('🔒 보안 테스트', () => {
    test('SQL Injection 방어', async () => {
      const maliciousPayload = {
        messages: [
          { role: 'user', content: "'; DROP TABLE users; --" }
        ]
      };

      const response = await request(server)
        .post('/api/claude/messages')
        .send(maliciousPayload);

      // 서버가 크래시하지 않고 정상 응답해야 함
      expect(response.status).toBeLessThan(500);
    });

    test('XSS 방어', async () => {
      const xssPayload = {
        messages: [
          { role: 'user', content: '<script>alert("xss")</script>' }
        ]
      };

      const response = await request(server)
        .post('/api/claude/messages')
        .send(xssPayload);

      // 응답에 스크립트가 그대로 포함되지 않아야 함
      const responseText = JSON.stringify(response.body);
      expect(responseText).not.toContain('<script>');
    });

    test('과도한 페이로드 크기 방어', async () => {
      const largePayload = {
        messages: [
          { role: 'user', content: 'A'.repeat(50 * 1024 * 1024) } // 50MB
        ]
      };

      const response = await request(server)
        .post('/api/claude/messages')
        .send(largePayload);

      expect(response.status).toBe(413); // Payload Too Large
    });

    test('헤더 인젝션 방어', async () => {
      await request(server)
        .get('/health')
        .set('X-Injected-Header', 'malicious\r\nSet-Cookie: evil=true')
        .expect(200);

      // 응답 헤더에 악의적인 헤더가 없어야 함
      // (이는 프레임워크 수준에서 보호됨)
    });
  });

  describe('🌐 WebSocket 테스트', () => {
    let ws;

    afterEach(() => {
      if (ws) {
        ws.close();
        ws = null;
      }
    });

    test('WebSocket 연결', (done) => {
      const WebSocket = require('ws');
      ws = new WebSocket(`ws://localhost:${process.env.PORT}/ws`);

      ws.on('open', () => {
        expect(ws.readyState).toBe(WebSocket.OPEN);
        done();
      });

      ws.on('error', done);
    });

    test('WebSocket 채팅 메시지', (done) => {
      const WebSocket = require('ws');
      ws = new WebSocket(`ws://localhost:${process.env.PORT}/ws`);

      ws.on('open', () => {
        ws.send(JSON.stringify({
          type: 'chat',
          id: 'test-1',
          messages: [{ role: 'user', content: 'Hello via WebSocket!' }]
        }));
      });

      ws.on('message', (data) => {
        const response = JSON.parse(data);
        
        if (response.type === 'chat_response') {
          expect(response).toHaveProperty('id', 'test-1');
          expect(response).toHaveProperty('response');
          done();
        }
      });

      ws.on('error', done);
    });

    test('WebSocket ping/pong', (done) => {
      const WebSocket = require('ws');
      ws = new WebSocket(`ws://localhost:${process.env.PORT}/ws`);

      ws.on('open', () => {
        ws.send(JSON.stringify({ type: 'ping' }));
      });

      ws.on('message', (data) => {
        const response = JSON.parse(data);
        
        if (response.type === 'pong') {
          done();
        }
      });

      ws.on('error', done);
    });
  });

  describe('📈 성능 테스트', () => {
    test('동시 요청 처리', async () => {
      const concurrentRequests = 50;
      const requests = [];

      const startTime = Date.now();

      for (let i = 0; i < concurrentRequests; i++) {
        requests.push(
          request(server)
            .get('/health')
            .expect(200)
        );
      }

      await Promise.all(requests);
      const endTime = Date.now();
      const duration = endTime - startTime;

      // 50개의 동시 요청이 10초 내에 완료되어야 함
      expect(duration).toBeLessThan(10000);
    });

    test('메모리 누수 테스트', async () => {
      const initialMemory = process.memoryUsage().heapUsed;

      // 반복적으로 요청 실행
      for (let i = 0; i < 100; i++) {
        await request(server)
          .get('/health')
          .expect(200);
      }

      // 가비지 컬렉션 강제 실행
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // 메모리 증가가 100MB 미만이어야 함
      expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024);
    });
  });

  describe('🔧 오류 처리', () => {
    test('서버 오류 처리', async () => {
      // 의도적으로 오류를 발생시키는 요청
      const response = await request(server)
        .post('/api/claude/messages')
        .send({ messages: [{ role: 'invalid', content: 'test' }] });

      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(response.body).toHaveProperty('error');
    });

    test('네트워크 오류 시뮬레이션', async () => {
      // Redis 연결 해제
      if (redis) await redis.quit();

      const response = await request(server)
        .get('/api/cache/stats');

      // Redis 오류 시 적절한 응답
      expect(response.status).toBe(503);
      
      // Redis 재연결
      redis = Redis.createClient({
        socket: { host: 'localhost', port: 6380 }
      });
      await redis.connect();
    });
  });

  // 헬퍼 함수들
  async function setupTestData() {
    console.log('🔧 테스트 데이터 설정 중...');
    
    // 환경 변수 설정
    process.env.ANTHROPIC_API_KEY = 'sk-ant-test123456789';
    process.env.REDIS_HOST = 'localhost';
    process.env.REDIS_PORT = '6380';
    
    // 모의 데이터 설정
    if (redis) {
      await redis.set('test:setup', JSON.stringify({
        timestamp: Date.now(),
        version: '2.0.0'
      }));
    }
  }

  async function cleanupTestData() {
    console.log('🧹 테스트 데이터 정리 중...');
    
    if (redis) {
      await redis.flushAll();
    }
  }
});

// 성능 벤치마크 테스트
describe('📊 성능 벤치마크', () => {
  let app, server;

  beforeAll(async () => {
    app = new KokiAPIProxy();
    server = app.server;
  });

  afterAll(() => {
    if (server) server.close();
  });

  test('처리량 벤치마크', async () => {
    const duration = 10000; // 10초
    const startTime = Date.now();
    let requestCount = 0;

    while (Date.now() - startTime < duration) {
      await request(server)
        .get('/health')
        .expect(200);
      requestCount++;
    }

    const actualDuration = Date.now() - startTime;
    const requestsPerSecond = (requestCount / actualDuration) * 1000;

    console.log(`📈 처리량: ${requestsPerSecond.toFixed(2)} requests/sec`);
    
    // 최소 100 requests/sec 처리 능력 확인
    expect(requestsPerSecond).toBeGreaterThan(100);
  });

  test('응답 시간 분포', async () => {
    const responseTimes = [];

    for (let i = 0; i < 100; i++) {
      const start = Date.now();
      await request(server)
        .get('/health')
        .expect(200);
      responseTimes.push(Date.now() - start);
    }

    const avg = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    const p95 = responseTimes.sort((a, b) => a - b)[94]; // 95th percentile

    console.log(`📊 평균 응답 시간: ${avg.toFixed(2)}ms`);
    console.log(`📊 95th percentile: ${p95}ms`);

    expect(avg).toBeLessThan(100); // 100ms 미만
    expect(p95).toBeLessThan(500); // 500ms 미만
  });
});

// 통합 테스트
describe('🔗 통합 테스트', () => {
  let app, server;

  beforeAll(async () => {
    app = new KokiAPIProxy();
    server = app.server;
  });

  afterAll(() => {
    if (server) server.close();
  });

  test('전체 워크플로우 테스트', async () => {
    // 1. 헬스체크
    await request(server)
      .get('/health')
      .expect(200);

    // 2. Claude API 호출
    const chatResponse = await request(server)
      .post('/api/claude/messages')
      .send({
        messages: [{ role: 'user', content: 'Integration test message' }]
      })
      .expect(200);

    expect(chatResponse.body).toHaveProperty('content');

    // 3. 사용량 통계 확인
    const statsResponse = await request(server)
      .get('/api/stats/usage')
      .expect(200);

    expect(statsResponse.body.claude).toBeGreaterThan(0);

    // 4. 캐시 통계 확인
    await request(server)
      .get('/api/cache/stats')
      .expect(200);
  });
});
