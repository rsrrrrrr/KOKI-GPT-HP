/**
 * Koki AI Hub Service Worker
 * PWA 오프라인 지원 및 캐싱
 */

const CACHE_NAME = 'koki-ai-hub-v2.0.0';
const STATIC_CACHE_NAME = 'koki-static-v2.0.0';
const DYNAMIC_CACHE_NAME = 'koki-dynamic-v2.0.0';

// 캐시할 정적 파일들
const STATIC_FILES = [
    '/',
    '/index.html',
    '/manifest.json',
    '/favicon.ico'
];

// 캐시 크기 제한
const MAX_CACHE_SIZE = 50;
const MAX_CACHE_AGE = 7 * 24 * 60 * 60 * 1000; // 7일

// 설치 이벤트
self.addEventListener('install', event => {
    console.log('🔧 Service Worker 설치 중...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE_NAME)
            .then(cache => {
                console.log('📦 정적 파일 캐싱 중...');
                return cache.addAll(STATIC_FILES);
            })
            .then(() => {
                console.log('✅ Service Worker 설치 완료');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('❌ Service Worker 설치 실패:', error);
            })
    );
});

// 활성화 이벤트
self.addEventListener('activate', event => {
    console.log('🚀 Service Worker 활성화 중...');
    
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        // 이전 버전 캐시 삭제
                        if (cacheName !== STATIC_CACHE_NAME && 
                            cacheName !== DYNAMIC_CACHE_NAME) {
                            console.log('🗑️ 이전 캐시 삭제:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('✅ Service Worker 활성화 완료');
                return self.clients.claim();
            })
            .catch(error => {
                console.error('❌ Service Worker 활성화 실패:', error);
            })
    );
});

// 네트워크 요청 인터셉트
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);
    
    // API 요청은 캐시하지 않음
    if (url.pathname.includes('/api/') || 
        url.hostname.includes('anthropic.com') ||
        url.hostname.includes('openai.com')) {
        return;
    }
    
    // HTML 요청 처리 (네트워크 우선 + 캐시 폴백)
    if (request.headers.get('accept')?.includes('text/html')) {
        event.respondWith(handleHTMLRequest(request));
        return;
    }
    
    // 기타 리소스 처리 (캐시 우선 + 네트워크 폴백)
    event.respondWith(handleResourceRequest(request));
});

// HTML 요청 처리 (네트워크 우선)
async function handleHTMLRequest(request) {
    try {
        // 네트워크에서 먼저 시도
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            // 성공하면 캐시에 저장
            const cache = await caches.open(DYNAMIC_CACHE_NAME);
            cache.put(request, networkResponse.clone());
            return networkResponse;
        }
        
        throw new Error('Network response not ok');
        
    } catch (error) {
        console.log('🌐 네트워크 실패, 캐시에서 가져옴:', request.url);
        
        // 네트워크 실패 시 캐시에서 가져오기
        const cachedResponse = await caches.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // 캐시에도 없으면 기본 HTML 반환
        return caches.match('/') || createOfflinePage();
    }
}

// 리소스 요청 처리 (캐시 우선)
async function handleResourceRequest(request) {
    try {
        // 캐시에서 먼저 찾기
        const cachedResponse = await caches.match(request);
        
        if (cachedResponse) {
            // 백그라운드에서 업데이트 확인
            updateCache(request);
            return cachedResponse;
        }
        
        // 캐시에 없으면 네트워크에서 가져오기
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            // 캐시에 저장
            const cache = await caches.open(DYNAMIC_CACHE_NAME);
            await limitCacheSize(cache, MAX_CACHE_SIZE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
        
    } catch (error) {
        console.log('❌ 리소스 로드 실패:', request.url);
        
        // 기본 이미지나 폰트 등 대체 리소스 반환
        if (request.destination === 'image') {
            return createPlaceholderImage();
        }
        
        throw error;
    }
}

// 백그라운드 캐시 업데이트
async function updateCache(request) {
    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(DYNAMIC_CACHE_NAME);
            cache.put(request, response);
        }
    } catch (error) {
        // 조용히 실패
    }
}

// 캐시 크기 제한
async function limitCacheSize(cache, maxSize) {
    const keys = await cache.keys();
    
    if (keys.length > maxSize) {
        // 오래된 항목 삭제
        const sortedKeys = keys.sort((a, b) => {
            // 간단한 LRU 구현
            return new Date(a.headers.get('date') || 0) - 
                   new Date(b.headers.get('date') || 0);
        });
        
        const deletePromises = sortedKeys
            .slice(0, keys.length - maxSize)
            .map(key => cache.delete(key));
            
        await Promise.all(deletePromises);
    }
}

// 오프라인 페이지 생성
function createOfflinePage() {
    const html = `
        <!DOCTYPE html>
        <html lang="ko">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>오프라인 - Koki AI Hub</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    margin: 0;
                    text-align: center;
                    padding: 20px;
                }
                .emoji { font-size: 4rem; margin-bottom: 20px; }
                h1 { font-size: 2rem; margin-bottom: 15px; }
                p { font-size: 1.1rem; margin-bottom: 25px; opacity: 0.9; }
                button {
                    background: rgba(255,255,255,0.2);
                    border: 1px solid rgba(255,255,255,0.3);
                    color: white;
                    padding: 12px 24px;
                    border-radius: 25px;
                    font-size: 1rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                button:hover {
                    background: rgba(255,255,255,0.3);
                    transform: translateY(-2px);
                }
            </style>
        </head>
        <body>
            <div class="emoji">📱</div>
            <h1>오프라인 모드</h1>
            <p>인터넷 연결을 확인해주세요.<br>일부 기능은 오프라인에서도 사용 가능합니다.</p>
            <button onclick="window.location.reload()">다시 시도</button>
        </body>
        </html>
    `;
    
    return new Response(html, {
        headers: { 'Content-Type': 'text/html' }
    });
}

// 플레이스홀더 이미지 생성
function createPlaceholderImage() {
    const svg = `
        <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
            <rect width="200" height="200" fill="#667eea"/>
            <text x="100" y="100" text-anchor="middle" dy="0.3em" 
                  font-family="sans-serif" font-size="60" fill="white">🤖</text>
        </svg>
    `;
    
    return new Response(svg, {
        headers: { 'Content-Type': 'image/svg+xml' }
    });
}

// 메시지 처리
self.addEventListener('message', event => {
    const { action, data } = event.data;
    
    switch (action) {
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;
            
        case 'CLEAR_CACHE':
            clearAllCaches().then(() => {
                event.ports[0].postMessage({ success: true });
            });
            break;
            
        case 'GET_CACHE_INFO':
            getCacheInfo().then(info => {
                event.ports[0].postMessage(info);
            });
            break;
            
        default:
            console.log('알 수 없는 메시지:', action);
    }
});

// 모든 캐시 삭제
async function clearAllCaches() {
    const cacheNames = await caches.keys();
    await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
    );
    console.log('🗑️ 모든 캐시 삭제 완료');
}

// 캐시 정보 조회
async function getCacheInfo() {
    const cacheNames = await caches.keys();
    const info = {};
    
    for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        info[cacheName] = keys.length;
    }
    
    return info;
}

// 백그라운드 동기화 (실험적 기능)
self.addEventListener('sync', event => {
    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

async function doBackgroundSync() {
    try {
        console.log('🔄 백그라운드 동기화 실행');
        // 여기에 백그라운드 작업 구현
        // 예: 저장된 메시지 전송, 데이터 동기화 등
    } catch (error) {
        console.error('❌ 백그라운드 동기화 실패:', error);
    }
}

// 푸시 알림 처리
self.addEventListener('push', event => {
    const options = {
        body: '새로운 AI 응답이 도착했습니다!',
        icon: '/icon-192.png',
        badge: '/badge-72.png',
        tag: 'koki-notification',
        renotify: true,
        requireInteraction: false,
        actions: [
            {
                action: 'open',
                title: '열기',
                icon: '/icon-open.png'
            },
            {
                action: 'close',
                title: '닫기',
                icon: '/icon-close.png'
            }
        ]
    };
    
    if (event.data) {
        const payload = event.data.json();
        options.body = payload.body || options.body;
        options.title = payload.title || 'Koki AI Hub';
    }
    
    event.waitUntil(
        self.registration.showNotification('Koki AI Hub', options)
    );
});

// 알림 클릭 처리
self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    if (event.action === 'open' || !event.action) {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// 에러 처리
self.addEventListener('error', event => {
    console.error('❌ Service Worker 오류:', event.error);
});

self.addEventListener('unhandledrejection', event => {
    console.error('❌ 처리되지 않은 Promise 거부:', event.reason);
});

console.log('🚀 Koki AI Hub Service Worker 로드됨');
