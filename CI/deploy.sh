#!/bin/bash

# Koki AI Hub 자동 배포 스크립트
# 사용법: ./deploy.sh [환경] [옵션]
# 예시: ./deploy.sh production --clean --backup

set -e  # 오류 발생 시 스크립트 중단

# ===========================================
# 🎯 설정 및 변수
# ===========================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR"
DEPLOY_ENV="${1:-development}"
DEPLOY_OPTIONS="${@:2}"

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# 로그 함수
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_step() {
    echo -e "${PURPLE}🚀 $1${NC}"
}

# ===========================================
# 🔧 유틸리티 함수
# ===========================================

check_requirements() {
    log_step "시스템 요구사항 확인 중..."
    
    local missing_deps=()
    
    # Docker 확인
    if ! command -v docker &> /dev/null; then
        missing_deps+=("docker")
    fi
    
    # Docker Compose 확인
    if ! command -v docker-compose &> /dev/null; then
        missing_deps+=("docker-compose")
    fi
    
    # Node.js 확인 (개발 환경용)
    if [[ "$DEPLOY_ENV" == "development" ]] && ! command -v node &> /dev/null; then
        missing_deps+=("node")
    fi
    
    # Git 확인
    if ! command -v git &> /dev/null; then
        missing_deps+=("git")
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        log_error "다음 의존성이 누락되었습니다: ${missing_deps[*]}"
        exit 1
    fi
    
    log_success "모든 요구사항이 충족되었습니다"
}

validate_environment() {
    log_step "환경 설정 검증 중..."
    
    local env_file=""
    case "$DEPLOY_ENV" in
        development)
            env_file=".env.development"
            ;;
        staging)
            env_file=".env.staging"
            ;;
        production)
            env_file=".env.production"
            ;;
        *)
            log_error "지원하지 않는 환경입니다: $DEPLOY_ENV"
            log_info "사용 가능한 환경: development, staging, production"
            exit 1
            ;;
    esac
    
    # .env 파일 확인
    if [[ ! -f "$PROJECT_DIR/$env_file" && ! -f "$PROJECT_DIR/.env" ]]; then
        log_error "환경 설정 파일을 찾을 수 없습니다: $env_file 또는 .env"
        log_info ".env.example을 복사하여 설정 파일을 생성하세요"
        exit 1
    fi
    
    # 필수 환경 변수 확인
    local required_vars=("NODE_ENV" "PORT")
    if [[ "$DEPLOY_ENV" == "production" ]]; then
        required_vars+=("ANTHROPIC_API_KEY" "REDIS_HOST")
    fi
    
    # 환경 변수 로드
    if [[ -f "$PROJECT_DIR/$env_file" ]]; then
        set -a
        source "$PROJECT_DIR/$env_file"
        set +a
    elif [[ -f "$PROJECT_DIR/.env" ]]; then
        set -a
        source "$PROJECT_DIR/.env"
        set +a
    fi
    
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var}" ]]; then
            log_error "필수 환경 변수가 설정되지 않았습니다: $var"
            exit 1
        fi
    done
    
    log_success "환경 설정이 유효합니다"
}

create_backup() {
    if [[ " $DEPLOY_OPTIONS " =~ " --backup " || " $DEPLOY_OPTIONS " =~ " -b " ]]; then
        log_step "백업 생성 중..."
        
        local backup_dir="./backups/$(date +%Y%m%d_%H%M%S)"
        mkdir -p "$backup_dir"
        
        # 현재 배포 백업
        if [[ -d "./current" ]]; then
            cp -r ./current/* "$backup_dir/"
            log_success "현재 배포 백업 완료: $backup_dir"
        fi
        
        # 데이터베이스 백업 (Redis)
        if command -v redis-cli &> /dev/null; then
            redis-cli --rdb "$backup_dir/dump.rdb" 2>/dev/null || log_warning "Redis 백업 실패"
        fi
        
        # 로그 백업
        if [[ -d "./logs" ]]; then
            cp -r ./logs "$backup_dir/"
        fi
        
        # 오래된 백업 정리 (30일 이상)
        find ./backups -type d -mtime +30 -exec rm -rf {} + 2>/dev/null || true
        
        log_success "백업 생성 완료"
    fi
}

clean_environment() {
    if [[ " $DEPLOY_OPTIONS " =~ " --clean " || " $DEPLOY_OPTIONS " =~ " -c " ]]; then
        log_step "환경 정리 중..."
        
        # Docker 컨테이너 정리
        if command -v docker &> /dev/null; then
            docker container prune -f 2>/dev/null || true
            docker image prune -f 2>/dev/null || true
            docker network prune -f 2>/dev/null || true
            docker volume prune -f 2>/dev/null || true
        fi
        
        # 로그 파일 정리
        if [[ -d "./logs" ]]; then
            find ./logs -name "*.log" -mtime +7 -delete 2>/dev/null || true
        fi
        
        # 임시 파일 정리
        rm -rf ./tmp/* 2>/dev/null || true
        rm -rf ./.cache/* 2>/dev/null || true
        
        log_success "환경 정리 완료"
    fi
}

# ===========================================
# 📦 배포 함수들
# ===========================================

deploy_development() {
    log_step "개발 환경 배포 시작..."
    
    # 의존성 설치
    if [[ -f "./api-proxy/package.json" ]]; then
        cd "./api-proxy"
        npm install
        cd "$PROJECT_DIR"
        log_success "Node.js 의존성 설치 완료"
    fi
    
    # 개발 서버 시작
    if [[ " $DEPLOY_OPTIONS " =~ " --start " ]]; then
        log_info "개발 서버를 시작합니다..."
        
        # Python 서버 (백그라운드)
        if [[ -f "./run_server.py" ]]; then
            python3 run_server.py &
            DEV_SERVER_PID=$!
            log_info "Python 서버 시작됨 (PID: $DEV_SERVER_PID)"
        fi
        
        # API 프록시 서버 (백그라운드)
        if [[ -f "./api-proxy/server.js" ]]; then
            cd "./api-proxy"
            npm run dev &
            API_SERVER_PID=$!
            cd "$PROJECT_DIR"
            log_info "API 프록시 서버 시작됨 (PID: $API_SERVER_PID)"
        fi
        
        log_success "개발 서버들이 시작되었습니다"
        log_info "접속 URL: http://localhost:8000"
        log_info "서버를 중지하려면 Ctrl+C를 누르세요"
        
        # PID 파일 생성
        echo "$DEV_SERVER_PID" > .dev_server.pid
        echo "$API_SERVER_PID" > .api_server.pid
        
        wait
    fi
}

deploy_staging() {
    log_step "스테이징 환경 배포 시작..."
    
    # Docker Compose로 배포
    docker-compose -f docker-compose.yml -f docker-compose.override.yml down
    docker-compose -f docker-compose.yml -f docker-compose.override.yml build
    docker-compose -f docker-compose.yml -f docker-compose.override.yml up -d
    
    # 서비스 상태 확인
    sleep 10
    check_services
    
    log_success "스테이징 환경 배포 완료"
    log_info "접속 URL: http://localhost:8080"
}

deploy_production() {
    log_step "프로덕션 환경 배포 시작..."
    
    # 보안 검사
    security_check
    
    # 프로덕션 배포 확인
    echo -e "${YELLOW}프로덕션 환경에 배포하시겠습니까? (y/N): ${NC}"
    read -r confirmation
    if [[ ! "$confirmation" =~ ^[Yy]$ ]]; then
        log_info "배포가 취소되었습니다"
        exit 0
    fi
    
    # Docker Compose로 프로덕션 배포
    docker-compose -f docker-compose.yml down
    docker-compose -f docker-compose.yml build --no-cache
    docker-compose -f docker-compose.yml up -d
    
    # 서비스 상태 확인
    sleep 15
    check_services
    
    # SSL 인증서 확인
    check_ssl_certificate
    
    # 헬스체크 시작
    if [[ -f "./healthcheck/healthcheck.js" ]]; then
        docker-compose exec healthcheck node healthcheck.js &
        log_success "헬스체크 시스템 시작됨"
    fi
    
    log_success "프로덕션 환경 배포 완료"
    log_info "접속 URL: https://koki-ai.com"
}

security_check() {
    log_step "보안 검사 실행 중..."
    
    local security_issues=()
    
    # API 키 검사
    if [[ -z "$ANTHROPIC_API_KEY" || "$ANTHROPIC_API_KEY" == "sk-ant-test123456789" ]]; then
        security_issues+=("실제 Claude API 키를 설정하세요")
    fi
    
    # CORS 설정 검사
    if [[ "$CORS_ORIGIN" == "*" ]]; then
        security_issues+=("프로덕션에서는 CORS_ORIGIN을 구체적으로 설정하세요")
    fi
    
    # 디버그 모드 검사
    if [[ "$DEBUG_MODE" == "true" ]]; then
        security_issues+=("프로덕션에서는 DEBUG_MODE를 false로 설정하세요")
    fi
    
    # SSL 설정 검사
    if [[ "$FORCE_HTTPS" != "true" ]]; then
        security_issues+=("FORCE_HTTPS를 true로 설정하세요")
    fi
    
    # 기본 비밀번호 검사
    if [[ "$JWT_SECRET" == "your-very-secure-jwt-secret-key-here-min-32-chars" ]]; then
        security_issues+=("JWT_SECRET을 변경하세요")
    fi
    
    if [ ${#security_issues[@]} -ne 0 ]; then
        log_error "보안 문제가 발견되었습니다:"
        for issue in "${security_issues[@]}"; do
            echo -e "  ${RED}• $issue${NC}"
        done
        exit 1
    fi
    
    log_success "보안 검사 통과"
}

check_services() {
    log_step "서비스 상태 확인 중..."
    
    local services=("nginx" "api-proxy" "redis")
    local failed_services=()
    
    for service in "${services[@]}"; do
        if docker-compose ps -q "$service" > /dev/null 2>&1; then
            if [[ "$(docker-compose ps -q "$service" | xargs docker inspect -f '{{.State.Status}}')" == "running" ]]; then
                log_success "$service 서비스 실행 중"
            else
                failed_services+=("$service")
                log_error "$service 서비스 실행 실패"
            fi
        else
            failed_services+=("$service")
            log_error "$service 서비스를 찾을 수 없음"
        fi
    done
    
    if [ ${#failed_services[@]} -ne 0 ]; then
        log_error "일부 서비스가 실행되지 않았습니다: ${failed_services[*]}"
        
        # 로그 출력
        for service in "${failed_services[@]}"; do
            echo -e "\n${YELLOW}=== $service 로그 ====${NC}"
            docker-compose logs --tail=20 "$service" 2>/dev/null || echo "로그를 가져올 수 없음"
        done
        
        exit 1
    fi
    
    # 헬스체크 엔드포인트 확인
    local health_url="http://localhost:${PORT:-3001}/health"
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$health_url" > /dev/null 2>&1; then
            log_success "헬스체크 엔드포인트 응답 정상"
            break
        fi
        
        if [ $attempt -eq $max_attempts ]; then
            log_error "헬스체크 엔드포인트 응답 없음"
            exit 1
        fi
        
        log_info "헬스체크 대기 중... ($attempt/$max_attempts)"
        sleep 2
        ((attempt++))
    done
}

check_ssl_certificate() {
    if [[ "$DEPLOY_ENV" == "production" && "$FORCE_HTTPS" == "true" ]]; then
        log_step "SSL 인증서 확인 중..."
        
        local domain="${DOMAIN:-localhost}"
        local cert_file="/etc/nginx/ssl/fullchain.pem"
        
        if docker-compose exec nginx test -f "$cert_file" 2>/dev/null; then
            local expiry_date=$(docker-compose exec nginx openssl x509 -in "$cert_file" -noout -enddate 2>/dev/null | cut -d= -f2)
            log_success "SSL 인증서 확인됨 (만료일: $expiry_date)"
        else
            log_warning "SSL 인증서를 찾을 수 없습니다"
            log_info "Let's Encrypt를 사용하여 인증서를 생성하세요"
        fi
    fi
}

setup_monitoring() {
    if [[ " $DEPLOY_OPTIONS " =~ " --monitoring " ]]; then
        log_step "모니터링 시스템 설정 중..."
        
        # Prometheus 설정
        if [[ "$PROMETHEUS_ENABLED" == "true" ]]; then
            docker-compose up -d prometheus grafana
            log_success "Prometheus 및 Grafana 시작됨"
            log_info "Grafana 접속: http://localhost:3000 (admin/admin123)"
        fi
        
        # 로그 수집 설정
        docker-compose up -d fluentd
        log_success "로그 수집 시스템 시작됨"
    fi
}

show_deployment_info() {
    log_step "배포 정보"
    
    echo -e "${BLUE}┌─────────────────────────────────────┐${NC}"
    echo -e "${BLUE}│           Koki AI Hub v2.0.0       │${NC}"
    echo -e "${BLUE}├─────────────────────────────────────┤${NC}"
    echo -e "${BLUE}│ 환경: ${DEPLOY_ENV}${NC}"
    echo -e "${BLUE}│ 시간: $(date)${NC}"
    echo -e "${BLUE}│ 버전: $(git describe --tags --always 2>/dev/null || echo 'unknown')${NC}"
    echo -e "${BLUE}└─────────────────────────────────────┘${NC}"
    
    case "$DEPLOY_ENV" in
        development)
            echo -e "\n${GREEN}🔗 접속 정보:${NC}"
            echo -e "  메인 앱: http://localhost:8000"
            echo -e "  API: http://localhost:3001"
            echo -e "  헬스체크: http://localhost:3001/health"
            ;;
        staging)
            echo -e "\n${GREEN}🔗 접속 정보:${NC}"
            echo -e "  메인 앱: http://localhost:8080"
            echo -e "  API: http://localhost:3001"
            echo -e "  모니터링: http://localhost:3000"
            ;;
        production)
            echo -e "\n${GREEN}🔗 접속 정보:${NC}"
            echo -e "  메인 앱: https://koki-ai.com"
            echo -e "  API: https://api.koki-ai.com"
            echo -e "  모니터링: https://monitor.koki-ai.com"
            ;;
    esac
    
    echo -e "\n${YELLOW}💡 유용한 명령어:${NC}"
    echo -e "  로그 확인: docker-compose logs -f [서비스명]"
    echo -e "  서비스 재시작: docker-compose restart [서비스명]"
    echo -e "  상태 확인: docker-compose ps"
    echo -e "  중지: docker-compose down"
}

# ===========================================
# 🚀 메인 실행 로직
# ===========================================

show_banner() {
    echo -e "${PURPLE}"
    echo "╔══════════════════════════════════════════════════════════════════╗"
    echo "║                    🤖 Koki AI Hub v2.0.0                        ║"
    echo "║                      자동 배포 시스템                              ║"
    echo "╚══════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}\n"
}

show_help() {
    echo "사용법: $0 [환경] [옵션]"
    echo ""
    echo "환경:"
    echo "  development  개발 환경 (기본값)"
    echo "  staging      스테이징 환경"
    echo "  production   프로덕션 환경"
    echo ""
    echo "옵션:"
    echo "  --clean, -c       배포 전 환경 정리"
    echo "  --backup, -b      배포 전 백업 생성"
    echo "  --start           서버 시작 (개발 환경)"
    echo "  --monitoring      모니터링 시스템 활성화"
    echo "  --help, -h        도움말 표시"
    echo ""
    echo "예시:"
    echo "  $0 development --start"
    echo "  $0 staging --clean --backup"
    echo "  $0 production --backup --monitoring"
}

main() {
    # 도움말 확인
    if [[ " $DEPLOY_OPTIONS " =~ " --help " || " $DEPLOY_OPTIONS " =~ " -h " ]]; then
        show_help
        exit 0
    fi
    
    show_banner
    
    log_step "Koki AI Hub 배포 시작 ($DEPLOY_ENV 환경)"
    
    # 사전 검사
    check_requirements
    validate_environment
    
    # 백업 생성
    create_backup
    
    # 환경 정리
    clean_environment
    
    # 환경별 배포
    case "$DEPLOY_ENV" in
        development)
            deploy_development
            ;;
        staging)
            deploy_staging
            ;;
        production)
            deploy_production
            ;;
    esac
    
    # 모니터링 설정
    setup_monitoring
    
    # 배포 정보 표시
    show_deployment_info
    
    log_success "🎉 배포가 성공적으로 완료되었습니다!"
}

# 스크립트 직접 실행 시
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
