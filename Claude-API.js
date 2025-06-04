/**
 * Claude API 연동 모듈
 * Anthropic Claude API를 실제로 연동하는 클래스
 */

class ClaudeAPI {
    constructor() {
        this.apiKey = '';
        this.baseURL = 'https://api.anthropic.com/v1';
        this.model = 'claude-3-sonnet-20240229';
        this.maxTokens = 4096;
        this.temperature = 0.7;
        this.isConnected = false;
        
        // 요청 제한 설정
        this.requestQueue = [];
        this.isProcessingQueue = false;
        this.maxRequestsPerMinute = 50;
        this.requestHistory = [];
    }
    
    /**
     * API 키 설정 및 연결 테스트
     * @param {string} apiKey - Claude API 키
     * @returns {Promise<boolean>} 연결 성공 여부
     */
    async connect(apiKey) {
        if (!apiKey || !apiKey.startsWith('sk-ant-')) {
            throw new Error('유효하지 않은 API 키 형식입니다');
        }
        
        this.apiKey = apiKey;
        
        try {
            // 연결 테스트
            const testResponse = await this.sendMessage('Hello', { maxTokens: 10 });
            this.isConnected = true;
            console.log('✅ Claude API 연결 성공');
            return true;
            
        } catch (error) {
            this.isConnected = false;
            console.error('❌ Claude API 연결 실패:', error);
            throw new Error(`API 연결 실패: ${error.message}`);
        }
    }
    
    /**
     * 메시지 전송
     * @param {string} message - 사용자 메시지
     * @param {Object} options - 추가 옵션
     * @returns {Promise<string>} AI 응답
     */
    async sendMessage(message, options = {}) {
        if (!this.isConnected) {
            throw new Error('API가 연결되지 않았습니다');
        }
        
        // 요청 제한 확인
        await this.checkRateLimit();
        
        const requestOptions = {
            model: options.model || this.model,
            max_tokens: options.maxTokens || this.maxTokens,
            temperature: options.temperature || this.temperature,
            messages: [
                {
                    role: 'user',
                    content: message
                }
            ]
        };
        
        // 시스템 프롬프트 추가
        if (options.systemPrompt) {
            requestOptions.system = options.systemPrompt;
        }
        
        try {
            const response = await this.makeRequest('/messages', requestOptions);
            
            if (response.content && response.content[0] && response.content[0].text) {
                return response.content[0].text;
            } else {
                throw new Error('잘못된 응답 형식');
            }
            
        } catch (error) {
            console.error('메시지 전송 실패:', error);
            throw new Error(`응답 생성 실패: ${error.message}`);
        }
    }
    
    /**
     * 대화 히스토리를 포함한 메시지 전송
     * @param {Array} messages - 대화 히스토리
     * @param {Object} options - 추가 옵션
     * @returns {Promise<string>} AI 응답
     */
    async sendConversation(messages, options = {}) {
        if (!this.isConnected) {
            throw new Error('API가 연결되지 않았습니다');
        }
        
        await this.checkRateLimit();
        
        const requestOptions = {
            model: options.model || this.model,
            max_tokens: options.maxTokens || this.maxTokens,
            temperature: options.temperature || this.temperature,
            messages: messages.map(msg => ({
                role: msg.role,
                content: msg.content
            }))
        };
        
        if (options.systemPrompt) {
            requestOptions.system = options.systemPrompt;
        }
        
        try {
            const response = await this.makeRequest('/messages', requestOptions);
            return response.content[0].text;
            
        } catch (error) {
            console.error('대화 전송 실패:', error);
            throw new Error(`대화 처리 실패: ${error.message}`);
        }
    }
    
    /**
     * 스트리밍 메시지 전송
     * @param {string} message - 사용자 메시지
     * @param {Function} onChunk - 청크 수신 콜백
     * @param {Object} options - 추가 옵션
     */
    async sendMessageStream(message, onChunk, options = {}) {
        if (!this.isConnected) {
            throw new Error('API가 연결되지 않았습니다');
        }
        
        await this.checkRateLimit();
        
        const requestOptions = {
            model: options.model || this.model,
            max_tokens: options.maxTokens || this.maxTokens,
            temperature: options.temperature || this.temperature,
            stream: true,
            messages: [
                {
                    role: 'user',
                    content: message
                }
            ]
        };
        
        if (options.systemPrompt) {
            requestOptions.system = options.systemPrompt;
        }
        
        try {
            await this.makeStreamRequest('/messages', requestOptions, onChunk);
            
        } catch (error) {
            console.error('스트리밍 전송 실패:', error);
            throw new Error(`스트리밍 실패: ${error.message}`);
        }
    }
    
    /**
     * HTTP 요청 생성
     * @param {string} endpoint - API 엔드포인트
     * @param {Object} data - 요청 데이터
     * @returns {Promise<Object>} 응답 데이터
     */
    async makeRequest(endpoint, data) {
        const url = `${this.baseURL}${endpoint}`;
        
        const headers = {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey,
            'anthropic-version': '2023-06-01'
        };
        
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(data)
        });
        
        // 요청 기록
        this.recordRequest();
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            
            switch (response.status) {
                case 401:
                    throw new Error('API 키가 유효하지 않습니다');
                case 429:
                    throw new Error('요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요');
                case 500:
                    throw new Error('서버 오류가 발생했습니다');
                default:
                    throw new Error(errorData.error?.message || `HTTP ${response.status}`);
            }
        }
        
        return await response.json();
    }
    
    /**
     * 스트리밍 요청 생성
     * @param {string} endpoint - API 엔드포인트
     * @param {Object} data - 요청 데이터
     * @param {Function} onChunk - 청크 처리 콜백
     */
    async makeStreamRequest(endpoint, data, onChunk) {
        const url = `${this.baseURL}${endpoint}`;
        
        const headers = {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey,
            'anthropic-version': '2023-06-01'
        };
        
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(data)
        });
        
        this.recordRequest();
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
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
                            
                            if (parsed.type === 'content_block_delta') {
                                const text = parsed.delta?.text || '';
                                if (text) {
                                    onChunk(text);
                                }
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
    
    /**
     * 요청 제한 확인
     */
    async checkRateLimit() {
        const now = Date.now();
        const oneMinuteAgo = now - 60 * 1000;
        
        // 1분 내 요청 기록 정리
        this.requestHistory = this.requestHistory.filter(time => time > oneMinuteAgo);
        
        // 요청 한도 확인
        if (this.requestHistory.length >= this.maxRequestsPerMinute) {
            const waitTime = this.requestHistory[0] + 60 * 1000 - now;
            console.warn(`요청 한도 도달. ${Math.ceil(waitTime / 1000)}초 대기...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
    }
    
    /**
     * 요청 기록
     */
    recordRequest() {
        this.requestHistory.push(Date.now());
    }
    
    /**
     * 사용 가능한 모델 목록 조회
     * @returns {Array} 모델 목록
     */
    getAvailableModels() {
        return [
            'claude-3-opus-20240229',
            'claude-3-sonnet-20240229', 
            'claude-3-haiku-20240307',
            'claude-2.1',
            'claude-2.0',
            'claude-instant-1.2'
        ];
    }
    
    /**
     * 현재 설정 조회
     * @returns {Object} 현재 설정
     */
    getSettings() {
        return {
            model: this.model,
            maxTokens: this.maxTokens,
            temperature: this.temperature,
            isConnected: this.isConnected,
            requestsInQueue: this.requestQueue.length,
            requestsThisMinute: this.requestHistory.length
        };
    }
    
    /**
     * 설정 업데이트
     * @param {Object} settings - 새 설정
     */
    updateSettings(settings) {
        if (settings.model && this.getAvailableModels().includes(settings.model)) {
            this.model = settings.model;
        }
        
        if (typeof settings.maxTokens === 'number' && settings.maxTokens > 0) {
            this.maxTokens = Math.min(settings.maxTokens, 8192);
        }
        
        if (typeof settings.temperature === 'number') {
            this.temperature = Math.max(0, Math.min(1, settings.temperature));
        }
        
        console.log('설정 업데이트됨:', this.getSettings());
    }
    
    /**
     * 연결 끊기
     */
    disconnect() {
        this.apiKey = '';
        this.isConnected = false;
        this.requestHistory = [];
        this.requestQueue = [];
        console.log('Claude API 연결 해제됨');
    }
    
    /**
     * 에러 분석 및 사용자 친화적 메시지 변환
     * @param {Error} error - 원본 에러
     * @returns {string} 사용자 친화적 에러 메시지
     */
    static getErrorMessage(error) {
        const message = error.message.toLowerCase();
        
        if (message.includes('network') || message.includes('fetch')) {
            return '네트워크 연결을 확인해주세요';
        } else if (message.includes('api key') || message.includes('401')) {
            return 'API 키를 확인해주세요';
        } else if (message.includes('rate limit') || message.includes('429')) {
            return '요청이 너무 많습니다. 잠시 후 다시 시도해주세요';
        } else if (message.includes('token')) {
            return '입력이 너무 깁니다. 짧게 줄여서 다시 시도해주세요';
        } else if (message.includes('model')) {
            return '지원하지 않는 모델입니다';
        } else {
            return '일시적인 오류가 발생했습니다. 다시 시도해주세요';
        }
    }
}

/**
 * GPT-4 API 연동 클래스 (비교 분석용)
 */
class GPT4API {
    constructor() {
        this.apiKey = '';
        this.baseURL = 'https://api.openai.com/v1';
        this.model = 'gpt-4';
        this.maxTokens = 4096;
        this.temperature = 0.7;
        this.isConnected = false;
    }
    
    async connect(apiKey) {
        if (!apiKey || !apiKey.startsWith('sk-')) {
            throw new Error('유효하지 않은 OpenAI API 키 형식입니다');
        }
        
        this.apiKey = apiKey;
        
        try {
            const testResponse = await this.sendMessage('Hello', { maxTokens: 10 });
            this.isConnected = true;
            console.log('✅ GPT-4 API 연결 성공');
            return true;
            
        } catch (error) {
            this.isConnected = false;
            throw new Error(`GPT-4 API 연결 실패: ${error.message}`);
        }
    }
    
    async sendMessage(message, options = {}) {
        if (!this.isConnected) {
            throw new Error('GPT-4 API가 연결되지 않았습니다');
        }
        
        const requestOptions = {
            model: options.model || this.model,
            max_tokens: options.maxTokens || this.maxTokens,
            temperature: options.temperature || this.temperature,
            messages: [
                {
                    role: 'user',
                    content: message
                }
            ]
        };
        
        if (options.systemPrompt) {
            requestOptions.messages.unshift({
                role: 'system',
                content: options.systemPrompt
            });
        }
        
        try {
            const response = await this.makeRequest('/chat/completions', requestOptions);
            return response.choices[0].message.content;
            
        } catch (error) {
            throw new Error(`GPT-4 응답 생성 실패: ${error.message}`);
        }
    }
    
    async makeRequest(endpoint, data) {
        const url = `${this.baseURL}${endpoint}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `HTTP ${response.status}`);
        }
        
        return await response.json();
    }
    
    disconnect() {
        this.apiKey = '';
        this.isConnected = false;
        console.log('GPT-4 API 연결 해제됨');
    }
}

// 전역 변수로 API 인스턴스 생성
window.claudeAPI = new ClaudeAPI();
window.gpt4API = new GPT4API();

export { ClaudeAPI, GPT4API };
