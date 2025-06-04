# 🚀 Koki AI Hub v2.0.0 Pro - 완전한 배포 가이드

**완벽한 AI 워크벤치의 전체 설치 및 배포 가이드**

---

## 📋 목차

1. [빠른 시작](#-빠른-시작)
2. [로컬 개발 환경](#-로컬-개발-환경)
3. [스테이징 환경](#-스테이징-환경)
4. [프로덕션 배포](#-프로덕션-배포)
5. [도커 배포](#-도커-배포)
6. [클라우드 배포](#-클라우드-배포)
7. [모니터링 설정](#-모니터링-설정)
8. [문제 해결](#-문제-해결)

---

## 🎯 빠른 시작

### 최소 요구사항
- **OS**: Windows 10+, macOS 10.15+, Ubuntu 18+
- **브라우저**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **저장공간**: 500MB 이상
- **네트워크**: 인터넷 연결 (API 사용 시)

### 30초 설치

```bash
# 1. 저장소 클론
git clone https://github.com/koki-ai/hub.git koki-ai-hub
cd koki-ai-hub

# 2. 환경 설정
cp .env.example .env
# .env 파일을 편집하여 API 키 설정

# 3. 자동 배포
chmod +x deploy.sh
./deploy.sh development --start
```

**완료!** 🎉 [http://localhost:8000](http://localhost:8000) 에서 접속

---

## 💻 로컬 개발 환경

### 방법 1: Python 간편 실행 (권장)

```bash
# Python 3.6+ 필요
python run_server.py
```

### 방법 2: Windows 원클릭

```batch
# Windows에서 더블클릭
start_koki.bat
```

### 방법 3: Node.js 서버

```bash
# Node.js 18+ 필요
cd api-proxy
npm install
npm run dev
```

### 방법 4: VS Code Live Server

1. VS Code에서 프로젝트 열기
2. Live Server 확장 설치
3. `index.html` 우클릭 → "Open with Live Server"

### 개발 환경 설정

```bash
# 환경 변수 설정
export NODE_ENV=development
export PORT=3001
export ANTHROPIC_API_KEY=sk-ant-test123456789  # 테스트 키

# 개발 서버 시작
npm run dev

# 또는 PM2로 관리
npm install -g pm2
pm2 start ecosystem.config.js
```

---

## 🔧 스테이징 환경

### Docker Compose 사용

```bash
# 1. 환경 파일 준비
cp .env.example .env.staging

# 2. 스테이징 배포
./deploy.sh staging --clean --backup

# 3. 서비스 확인
docker-compose ps
docker-compose logs -f
```

### 수동 설정

```bash
# 1. 의존성 설치
cd api-proxy && npm install

# 2. 환경 변수 설정
export NODE_ENV=staging
export PORT=3001
export REDIS_HOST=localhost

# 3. 서비스 시작
npm start

# 4. Nginx 프록시 설정
sudo nginx -t && sudo nginx -s reload
```

### 스테이징 확인 항목

- [ ] 모든 서비스가 정상 실행되는가?
- [ ] API 엔드포인트가 응답하는가?
- [ ] 데이터베이스 연결이 정상인가?
- [ ] 로그가 정상적으로 기록되는가?
- [ ] 성능이 기대 수준인가?

---

## 🌍 프로덕션 배포

### 사전 준비

```bash
# 1. 시스템 업데이트
sudo apt update && sudo apt upgrade -y

# 2. 필수 패키지 설치
sudo apt install -y docker.io docker-compose nginx certbot python3-certbot-nginx

# 3. 방화벽 설정
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 22
sudo ufw enable
```

### SSL 인증서 설정

```bash
# Let's Encrypt 인증서 발급
sudo certbot --nginx -d koki-ai.com -d www.koki-ai.com

# 자동 갱신 설정
sudo crontab -e
# 다음 줄 추가: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 프로덕션 배포

```bash
# 1. 환경 설정
cp .env.example .env.production
# 실제 API 키와 설정 값으로 수정

# 2. 보안 설정 확인
./deploy.sh production --backup --monitoring

# 3. 서비스 상태 확인
curl -I https://koki-ai.com/health
```

### 프로덕션 체크리스트

#### 🔒 보안
- [ ] API 키가 실제 값으로 설정됨
- [ ] CORS가 특정 도메인으로 제한됨
- [ ] HTTPS 강제 사용 활성화
- [ ] 방화벽 규칙 적용
- [ ] 정기적 보안 업데이트 계획

#### 🚀 성능
- [ ] CDN 설정 (CloudFlare 등)
- [ ] 이미지 최적화 활성화
- [ ] Gzip/Brotli 압축 활성화
- [ ] 캐싱 전략 구현
- [ ] 로드 밸런싱 설정

#### 📊 모니터링
- [ ] 헬스체크 엔드포인트 설정
- [ ] 로그 수집 시스템 구축
- [ ] 에러 트래킹 (Sentry 등)
- [ ] 성능 모니터링 (New Relic 등)
- [ ] 알림 시스템 구축

---

## 🐳 도커 배포

### 단일 컨테이너 배포

```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install --production
EXPOSE 3001
CMD ["npm", "start"]
```

```bash
# 빌드 및 실행
docker build -t koki-ai-hub .
docker run -p 3001:3001 --env-file .env koki-ai-hub
```

### Docker Compose 전체 스택

```bash
# 전체 스택 시작
docker-compose up -d

# 스케일링
docker-compose up -d --scale api-proxy=3

# 업데이트
docker-compose pull
docker-compose up -d
```

### Docker Swarm 클러스터

```bash
# Swarm 초기화
docker swarm init

# 스택 배포
docker stack deploy -c docker-compose.yml koki-stack

# 서비스 확인
docker service ls
```

---

## ☁️ 클라우드 배포

### AWS 배포

#### EC2 + ELB + RDS

```bash
# 1. EC2 인스턴스 생성 (Ubuntu 20.04 LTS)
# t3.medium 이상 권장

# 2. 보안 그룹 설정
# 80, 443, 22 포트 오픈

# 3. 배포 스크립트 실행
./deploy.sh production --clean --backup --monitoring
```

#### ECS Fargate

```yaml
# ecs-task-definition.json
{
  "family": "koki-ai-hub",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "containerDefinitions": [
    {
      "name": "koki-api",
      "image": "koki-ai/hub:latest",
      "portMappings": [
        {
          "containerPort": 3001,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ]
    }
  ]
}
```

#### Lambda + API Gateway

```javascript
// lambda/handler.js
const serverless = require('serverless-http');
const app = require('./server');

module.exports.handler = serverless(app);
```

### Google Cloud Platform

#### Cloud Run

```yaml
# cloudbuild.yaml
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/koki-ai-hub', '.']
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/koki-ai-hub']
  - name: 'gcr.io/cloud-builders/gcloud'
    args: [
      'run', 'deploy', 'koki-ai-hub',
      '--image', 'gcr.io/$PROJECT_ID/koki-ai-hub',
      '--platform', 'managed',
      '--region', 'us-central1'
    ]
```

#### GKE (Kubernetes)

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: koki-ai-hub
spec:
  replicas: 3
  selector:
    matchLabels:
      app: koki-ai-hub
  template:
    metadata:
      labels:
        app: koki-ai-hub
    spec:
      containers:
      - name: api
        image: gcr.io/PROJECT_ID/koki-ai-hub:latest
        ports:
        - containerPort: 3001
        env:
        - name: NODE_ENV
          value: "production"
```

### Microsoft Azure

#### App Service

```bash
# Azure CLI 배포
az webapp create --resource-group myResourceGroup \
  --plan myAppServicePlan \
  --name koki-ai-hub \
  --deployment-container-image-name koki-ai/hub:latest
```

#### Container Instances

```yaml
# azure-container-instances.yaml
apiVersion: 2019-12-01
location: eastus
name: koki-ai-hub
properties:
  containers:
  - name: koki-api
    properties:
      image: koki-ai/hub:latest
      ports:
      - port: 3001
        protocol: TCP
      resources:
        requests:
          cpu: 1.0
          memoryInGB: 1.5
```

---

## 📊 모니터링 설정

### Prometheus + Grafana

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'koki-api'
    static_configs:
      - targets: ['api-proxy:3001']
    metrics_path: '/metrics'
```

```bash
# Grafana 대시보드 설정
docker-compose up -d prometheus grafana
# 접속: http://localhost:3000 (admin/admin123)
```

### ELK Stack (로그 분석)

```yaml
# docker-compose.elk.yml
version: '3.8'
services:
  elasticsearch:
    image: elasticsearch:7.17.0
    environment:
      - discovery.type=single-node
    ports:
      - "9200:9200"
  
  logstash:
    image: logstash:7.17.0
    ports:
      - "5044:5044"
  
  kibana:
    image: kibana:7.17.0
    ports:
      - "5601:5601"
```

### 헬스체크 시스템

```bash
# 자동 헬스체크 시작
cd healthcheck
node healthcheck.js

# 또는 Docker로 실행
docker-compose up -d healthcheck
```

### 알림 설정

#### Slack 알림

```bash
# 환경 변수 설정
export SLACK_WEBHOOK_URL=https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX

# 알림 테스트
curl -X POST -H 'Content-type: application/json' \
  --data '{"text":"🚨 Koki AI Hub 테스트 알림"}' \
  $SLACK_WEBHOOK_URL
```

#### 이메일 알림

```javascript
// 이메일 설정 (nodemailer)
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});
```

---

## 🔧 문제 해결

### 일반적인 문제들

#### 1. 포트 충돌

```bash
# 포트 사용 확인
sudo netstat -tulpn | grep :8000
sudo lsof -i :8000

# 프로세스 종료
sudo kill -9 PID
```

#### 2. 권한 문제

```bash
# Docker 권한 설정
sudo usermod -aG docker $USER
newgrp docker

# 파일 권한 설정
chmod +x deploy.sh
chmod +x run_server.py
```

#### 3. 메모리 부족

```bash
# 스왑 파일 생성
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

#### 4. SSL 인증서 문제

```bash
# 인증서 갱신
sudo certbot renew

# Nginx 설정 테스트
sudo nginx -t

# SSL 테스트
openssl s_client -connect koki-ai.com:443
```

### 로그 분석

```bash
# 애플리케이션 로그
docker-compose logs -f api-proxy

# Nginx 로그
sudo tail -f /var/log/nginx/error.log

# 시스템 로그
sudo journalctl -fu docker
```

### 성능 튜닝

#### Node.js 최적화

```bash
# 메모리 제한 설정
export NODE_OPTIONS="--max-old-space-size=4096"

# 프로덕션 모드
export NODE_ENV=production

# 클러스터 모드
pm2 start server.js -i max
```

#### Nginx 최적화

```nginx
# nginx.conf 최적화
worker_processes auto;
worker_connections 4096;

# Gzip 압축
gzip on;
gzip_comp_level 6;
gzip_min_length 1000;

# 캐싱
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

#### Redis 최적화

```bash
# Redis 설정
echo 'vm.overcommit_memory = 1' >> /etc/sysctl.conf
echo 'net.core.somaxconn = 65535' >> /etc/sysctl.conf
sysctl -p
```

---

## 📈 확장 계획

### 수평 확장

```bash
# 로드 밸런서 뒤에 여러 인스턴스
docker-compose up -d --scale api-proxy=5

# Kubernetes 자동 스케일링
kubectl autoscale deployment koki-ai-hub --cpu-percent=70 --min=2 --max=10
```

### 데이터베이스 확장

```bash
# Redis 클러스터
redis-cli --cluster create \
  127.0.0.1:7000 127.0.0.1:7001 127.0.0.1:7002 \
  127.0.0.1:7003 127.0.0.1:7004 127.0.0.1:7005 \
  --cluster-replicas 1
```

### CDN 연동

```javascript
// CloudFlare 설정
const cloudflare = require('cloudflare')({
  email: 'your-email@example.com',
  key: 'your-api-key'
});

// 캐시 퍼지
await cloudflare.zones.purgeCache(zoneId);
```

---

## 🎯 마지막 체크리스트

### 배포 전 확인사항

- [ ] 모든 환경 변수 설정됨
- [ ] API 키 유효성 확인됨
- [ ] 보안 설정 완료됨
- [ ] 백업 계획 수립됨
- [ ] 모니터링 시스템 구축됨
- [ ] 롤백 계획 준비됨
- [ ] 성능 테스트 완료됨
- [ ] 문서화 완료됨

### 배포 후 확인사항

- [ ] 모든 서비스 정상 동작
- [ ] 헬스체크 통과
- [ ] 성능 지표 정상
- [ ] 로그 정상 기록
- [ ] 알림 시스템 동작
- [ ] 백업 자동 실행
- [ ] SSL 인증서 유효
- [ ] 사용자 피드백 수집

---

## 🎉 완료!

축하합니다! Koki AI Hub v2.0.0 Pro가 성공적으로 배포되었습니다.

### 다음 단계:
1. 🔐 보안 설정 강화
2. 📊 모니터링 대시보드 설정
3. 🚀 성능 최적화
4. 👥 팀 액세스 관리
5. 📈 사용량 분석

### 지원:
- 📖 **문서**: [docs.koki-ai.com](https://docs.koki-ai.com)
- 💬 **커뮤니티**: [community.koki-ai.com](https://community.koki-ai.com)
- 📧 **지원**: support@koki-ai.com
- 🐛 **버그 리포트**: [GitHub Issues](https://github.com/koki-ai/hub/issues)

---

**Happy AI Building! 🤖✨**

*Made with ❤️ by Koki AI Team*
