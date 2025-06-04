#!/usr/bin/env node

/**
 * Koki AI Hub 헬스체크 시스템
 * 모든 서비스의 상태를 주기적으로 확인하고 문제 발생 시 알림
 */

const http = require('http');
const https = require('https');
const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

class HealthChecker {
    constructor() {
        this.config = {
            interval: parseInt(process.env.CHECK_INTERVAL) || 30000, // 30초
            timeout: parseInt(process.env.CHECK_TIMEOUT) || 5000,    // 5초
            retries: parseInt(process.env.CHECK_RETRIES) || 3,       // 3회
            services: (process.env.SERVICES || 'nginx:80,redis:6379,api-proxy:3001').split(','),
            alertThreshold: 3, // 연속 실패 횟수
            logFile: process.env.HEALTH_LOG || './logs/health.log'
        };
        
        this.serviceStatus = new Map();
        this.alertCount = new Map();
        this.startTime = Date.now();
        
        this.initializeServices();
        this.ensureLogDirectory();
    }
    
    initializeServices() {
        this.config.services.forEach(service => {
            const [name, port] = service.split(':');
            this.serviceStatus.set(name, {
                name,
                port: parseInt(port),
                status: 'unknown',
                lastCheck: null,
                consecutiveFailures: 0,
                totalChecks: 0,
                totalFailures: 0,
                responseTime: 0,
                lastError: null
            });
            this.alertCount.set(name, 0);
        });
    }
    
    async ensureLogDirectory() {
        const logDir = path.dirname(this.config.logFile);
        try {
            await fs.mkdir(logDir, { recursive: true });
        } catch (error) {
            console.warn('로그 디렉토리 생성 실패:', error.message);
        }
    }
    
    async checkService(serviceName, port) {
        const startTime = Date.now();
        
        return new Promise((resolve) => {
            const timeout = setTimeout(() => {
                resolve({
                    status: 'timeout',
                    responseTime: this.config.timeout,
                    error: 'Connection timeout'
                });
            }, this.config.timeout);
            
            const request = http.request({
                hostname: serviceName === 'nginx' ? 'localhost' : serviceName,
                port: port,
                path: serviceName === 'api-proxy' ? '/health' : '/',
                method: 'GET',
                timeout: this.config.timeout
            }, (response) => {
                clearTimeout(timeout);
                const responseTime = Date.now() - startTime;
                
                if (response.statusCode >= 200 && response.statusCode < 400) {
                    resolve({
                        status: 'healthy',
                        responseTime,
                        statusCode: response.statusCode
                    });
                } else {
                    resolve({
                        status: 'unhealthy',
                        responseTime,
                        error: `HTTP ${response.statusCode}`
                    });
                }
            });
            
            request.on('error', (error) => {
                clearTimeout(timeout);
                const responseTime = Date.now() - startTime;
                resolve({
                    status: 'error',
                    responseTime,
                    error: error.message
                });
            });
            
            request.end();
        });
    }
    
    async checkRedis() {
        return new Promise((resolve) => {
            const net = require('net');
            const socket = new net.Socket();
            const startTime = Date.now();
            
            const timeout = setTimeout(() => {
                socket.destroy();
                resolve({
                    status: 'timeout',
                    responseTime: this.config.timeout,
                    error: 'Redis connection timeout'
                });
            }, this.config.timeout);
            
            socket.connect(6379, 'redis', () => {
                clearTimeout(timeout);
                const responseTime = Date.now() - startTime;
                
                // Redis PING 명령어 전송
                socket.write('PING\r\n');
                
                socket.on('data', (data) => {
                    socket.destroy();
                    if (data.toString().includes('PONG')) {
                        resolve({
                            status: 'healthy',
                            responseTime
                        });
                    } else {
                        resolve({
                            status: 'unhealthy',
                            responseTime,
                            error: 'Invalid Redis response'
                        });
                    }
                });
            });
            
            socket.on('error', (error) => {
                clearTimeout(timeout);
                const responseTime = Date.now() - startTime;
                resolve({
                    status: 'error',
                    responseTime,
                    error: error.message
                });
            });
        });
    }
    
    async checkDiskSpace() {
        return new Promise((resolve) => {
            const df = spawn('df', ['-h', '/']);
            let output = '';
            
            df.stdout.on('data', (data) => {
                output += data.toString();
            });
            
            df.on('close', (code) => {
                if (code === 0) {
                    const lines = output.trim().split('\n');
                    const diskInfo = lines[1].split(/\s+/);
                    const usedPercent = parseInt(diskInfo[4]);
                    
                    resolve({
                        status: usedPercent > 90 ? 'warning' : 'healthy',
                        usedPercent,
                        available: diskInfo[3],
                        total: diskInfo[1]
                    });
                } else {
                    resolve({
                        status: 'error',
                        error: 'Failed to check disk space'
                    });
                }
            });
            
            df.on('error', () => {
                resolve({
                    status: 'error',
                    error: 'df command not available'
                });
            });
        });
    }
    
    async checkMemoryUsage() {
        try {
            const meminfo = await fs.readFile('/proc/meminfo', 'utf8');
            const lines = meminfo.split('\n');
            
            const total = parseInt(lines.find(line => line.startsWith('MemTotal')).split(/\s+/)[1]);
            const available = parseInt(lines.find(line => line.startsWith('MemAvailable')).split(/\s+/)[1]);
            const used = total - available;
            const usedPercent = Math.round((used / total) * 100);
            
            return {
                status: usedPercent > 90 ? 'warning' : 'healthy',
                usedPercent,
                used: Math.round(used / 1024), // MB
                total: Math.round(total / 1024), // MB
                available: Math.round(available / 1024) // MB
            };
        } catch (error) {
            return {
                status: 'error',
                error: 'Failed to read memory info'
            };
        }
    }
    
    async performHealthCheck() {
        console.log(`🔍 헬스체크 시작 - ${new Date().toISOString()}`);
        
        const results = {
            timestamp: new Date().toISOString(),
            uptime: Date.now() - this.startTime,
            services: {},
            system: {}
        };
        
        // 서비스 체크
        for (const [serviceName, serviceInfo] of this.serviceStatus) {
            let checkResult;
            
            if (serviceName === 'redis') {
                checkResult = await this.checkRedis();
            } else {
                checkResult = await this.checkService(serviceName, serviceInfo.port);
            }
            
            // 재시도 로직
            if (checkResult.status !== 'healthy' && this.config.retries > 1) {
                for (let i = 1; i < this.config.retries; i++) {
                    console.log(`⚠️ ${serviceName} 재시도 ${i}/${this.config.retries - 1}`);
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                    if (serviceName === 'redis') {
                        checkResult = await this.checkRedis();
                    } else {
                        checkResult = await this.checkService(serviceName, serviceInfo.port);
                    }
                    
                    if (checkResult.status === 'healthy') break;
                }
            }
            
            // 상태 업데이트
            const isHealthy = checkResult.status === 'healthy';
            serviceInfo.status = checkResult.status;
            serviceInfo.lastCheck = new Date().toISOString();
            serviceInfo.responseTime = checkResult.responseTime || 0;
            serviceInfo.lastError = checkResult.error || null;
            serviceInfo.totalChecks++;
            
            if (!isHealthy) {
                serviceInfo.totalFailures++;
                serviceInfo.consecutiveFailures++;
                
                // 알림 체크
                if (serviceInfo.consecutiveFailures >= this.config.alertThreshold) {
                    await this.sendAlert(serviceName, checkResult);
                }
            } else {
                serviceInfo.consecutiveFailures = 0;
            }
            
            results.services[serviceName] = {
                status: checkResult.status,
                responseTime: checkResult.responseTime,
                consecutiveFailures: serviceInfo.consecutiveFailures,
                uptime: serviceInfo.totalChecks > 0 ? 
                    ((serviceInfo.totalChecks - serviceInfo.totalFailures) / serviceInfo.totalChecks * 100).toFixed(2) : 0,
                error: checkResult.error
            };
            
            console.log(`${isHealthy ? '✅' : '❌'} ${serviceName}: ${checkResult.status} (${checkResult.responseTime}ms)`);
        }
        
        // 시스템 리소스 체크
        results.system.disk = await this.checkDiskSpace();
        results.system.memory = await this.checkMemoryUsage();
        
        console.log(`💾 디스크 사용률: ${results.system.disk.usedPercent || 'N/A'}%`);
        console.log(`🧠 메모리 사용률: ${results.system.memory.usedPercent || 'N/A'}%`);
        
        // 결과 로깅
        await this.logResults(results);
        
        // 전체 상태 결정
        const overallStatus = this.determineOverallStatus(results);
        console.log(`🎯 전체 상태: ${overallStatus}\n`);
        
        return results;
    }
    
    determineOverallStatus(results) {
        const serviceStatuses = Object.values(results.services).map(s => s.status);
        const systemStatuses = Object.values(results.system).map(s => s.status);
        
        if (serviceStatuses.includes('error') || serviceStatuses.includes('timeout')) {
            return 'critical';
        } else if (serviceStatuses.includes('unhealthy') || systemStatuses.includes('warning')) {
            return 'warning';
        } else if (serviceStatuses.every(s => s === 'healthy')) {
            return 'healthy';
        } else {
            return 'unknown';
        }
    }
    
    async sendAlert(serviceName, result) {
        const alertKey = `${serviceName}-${Date.now()}`;
        const alertData = {
            service: serviceName,
            status: result.status,
            error: result.error,
            timestamp: new Date().toISOString(),
            consecutiveFailures: this.serviceStatus.get(serviceName).consecutiveFailures
        };
        
        console.log(`🚨 알림 발송: ${serviceName} 서비스 오류`);
        
        // 이메일 알림 (구현 예시)
        if (process.env.SMTP_HOST && process.env.ADMIN_EMAIL) {
            await this.sendEmailAlert(alertData);
        }
        
        // Slack 알림 (구현 예시)
        if (process.env.SLACK_WEBHOOK_URL) {
            await this.sendSlackAlert(alertData);
        }
        
        // Discord 알림 (구현 예시)
        if (process.env.DISCORD_WEBHOOK_URL) {
            await this.sendDiscordAlert(alertData);
        }
        
        this.alertCount.set(serviceName, this.alertCount.get(serviceName) + 1);
    }
    
    async sendEmailAlert(alertData) {
        // 이메일 발송 로직 (nodemailer 등 사용)
        console.log('📧 이메일 알림 발송:', alertData.service);
    }
    
    async sendSlackAlert(alertData) {
        try {
            const payload = {
                text: `🚨 Koki AI Hub 서비스 오류`,
                attachments: [{
                    color: 'danger',
                    fields: [
                        { title: '서비스', value: alertData.service, short: true },
                        { title: '상태', value: alertData.status, short: true },
                        { title: '연속 실패', value: alertData.consecutiveFailures, short: true },
                        { title: '오류', value: alertData.error || 'N/A', short: false }
                    ],
                    footer: 'Koki AI Hub Health Check',
                    ts: Math.floor(Date.now() / 1000)
                }]
            };
            
            // Slack webhook 호출
            console.log('📱 Slack 알림 발송:', alertData.service);
        } catch (error) {
            console.error('Slack 알림 발송 실패:', error);
        }
    }
    
    async sendDiscordAlert(alertData) {
        try {
            const payload = {
                embeds: [{
                    title: '🚨 Koki AI Hub 서비스 오류',
                    color: 15158332, // 빨간색
                    fields: [
                        { name: '서비스', value: alertData.service, inline: true },
                        { name: '상태', value: alertData.status, inline: true },
                        { name: '연속 실패', value: alertData.consecutiveFailures.toString(), inline: true },
                        { name: '오류', value: alertData.error || 'N/A' }
                    ],
                    timestamp: alertData.timestamp
                }]
            };
            
            console.log('🎮 Discord 알림 발송:', alertData.service);
        } catch (error) {
            console.error('Discord 알림 발송 실패:', error);
        }
    }
    
    async logResults(results) {
        const logEntry = {
            timestamp: results.timestamp,
            summary: this.generateSummary(results),
            details: results
        };
        
        try {
            const logLine = JSON.stringify(logEntry) + '\n';
            await fs.appendFile(this.config.logFile, logLine);
        } catch (error) {
            console.error('로그 저장 실패:', error);
        }
    }
    
    generateSummary(results) {
        const totalServices = Object.keys(results.services).length;
        const healthyServices = Object.values(results.services).filter(s => s.status === 'healthy').length;
        const avgResponseTime = Object.values(results.services)
            .reduce((sum, s) => sum + (s.responseTime || 0), 0) / totalServices;
        
        return {
            totalServices,
            healthyServices,
            healthyPercent: Math.round((healthyServices / totalServices) * 100),
            avgResponseTime: Math.round(avgResponseTime),
            overallStatus: this.determineOverallStatus(results)
        };
    }
    
    async generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            uptime: Date.now() - this.startTime,
            services: {}
        };
        
        for (const [serviceName, serviceInfo] of this.serviceStatus) {
            report.services[serviceName] = {
                name: serviceName,
                currentStatus: serviceInfo.status,
                uptime: serviceInfo.totalChecks > 0 ? 
                    ((serviceInfo.totalChecks - serviceInfo.totalFailures) / serviceInfo.totalChecks * 100).toFixed(2) : 0,
                totalChecks: serviceInfo.totalChecks,
                totalFailures: serviceInfo.totalFailures,
                consecutiveFailures: serviceInfo.consecutiveFailures,
                avgResponseTime: serviceInfo.responseTime,
                lastCheck: serviceInfo.lastCheck,
                alertsSent: this.alertCount.get(serviceName)
            };
        }
        
        return report;
    }
    
    async start() {
        console.log('🚀 Koki AI Hub 헬스체크 시스템 시작');
        console.log(`📊 모니터링 서비스: ${this.config.services.join(', ')}`);
        console.log(`⏰ 체크 간격: ${this.config.interval / 1000}초`);
        console.log(`🔄 재시도 횟수: ${this.config.retries}`);
        console.log(`📝 로그 파일: ${this.config.logFile}\n`);
        
        // 즉시 첫 번째 체크 실행
        await this.performHealthCheck();
        
        // 주기적 체크 시작
        setInterval(async () => {
            try {
                await this.performHealthCheck();
            } catch (error) {
                console.error('헬스체크 실행 오류:', error);
            }
        }, this.config.interval);
        
        // 정기 리포트 생성 (1시간마다)
        setInterval(async () => {
            const report = await this.generateReport();
            console.log('📊 정기 리포트:', JSON.stringify(report, null, 2));
        }, 3600000);
        
        // Graceful shutdown
        process.on('SIGINT', () => this.shutdown('SIGINT'));
        process.on('SIGTERM', () => this.shutdown('SIGTERM'));
    }
    
    async shutdown(signal) {
        console.log(`\n${signal} 신호 수신, 헬스체크 시스템 종료 중...`);
        
        const finalReport = await this.generateReport();
        console.log('📊 최종 리포트:', JSON.stringify(finalReport, null, 2));
        
        process.exit(0);
    }
}

// 스크립트 직접 실행 시
if (require.main === module) {
    const healthChecker = new HealthChecker();
    healthChecker.start().catch(error => {
        console.error('헬스체크 시스템 시작 실패:', error);
        process.exit(1);
    });
}

module.exports = HealthChecker;
