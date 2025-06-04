#!/bin/bash

# Koki AI Hub v2.0.0 Pro - 자동 설치 스크립트
# 사용법: curl -fsSL https://get.koki-ai.com | bash
# 또는: wget -qO- https://get.koki-ai.com | bash

set -e  # 오류 발생 시 스크립트 중단

# ===========================================
# 🎨 색상 및 스타일 정의
# ===========================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# 스타일 함수들
print_banner() {
    echo -e "${PURPLE}"
    echo "╔══════════════════════════════════════════════════════════════════╗"
    echo "║                    🤖 Koki AI Hub v2.0.0 Pro                    ║"
    echo "║                      완벽한 AI 워크벤치                            ║"
    echo "║                     자동 설치 시스템                              ║"
    echo "╚══════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}\n"
}

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
    echo -e "${CYAN}🚀 $1${NC}"
}

print_divider() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# ===========================================
# 🔧 설정 변수
# ===========================================

KOKI_VERSION="2.0.0"
KOKI_REPO="https://github.com/koki-ai/hub.git"
KOKI_DIR="$HOME/koki-ai-hub"
INSTALL_DIR="/opt/koki-ai-hub"
SERVICE_NAME="koki-ai-hub"
BACKUP_DIR="$HOME/.koki-backup"

# 플랫폼 감지
PLATFORM=""
ARCH=""
PACKAGE_MANAGER=""
INIT_SYSTEM=""

# 설치 옵션
INSTALL_TYPE="user"  # user, system, docker
INSTALL_LOCATION="$KOKI_DIR"
ENABLE_SERVICE=false
INSTALL_DOCKER=false
INSTALL_DEPENDENCIES=true
AUTO_START=true
CREATE_DESKTOP_ENTRY=true

# ===========================================
# 🔍 시스템 감지 함수
# ===========================================

detect_platform() {
    log_step "시스템 플랫폼 감지 중..."
    
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        PLATFORM="linux"
        if [[ -f /etc/os-release ]]; then
            . /etc/os-release
            DISTRO="$ID"
            VERSION="$VERSION_ID"
            log_info "Linux 배포판: $NAME $VERSION"
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        PLATFORM="macos"
        DISTRO="macos"
        VERSION=$(sw_vers -productVersion)
        log_info "macOS 버전: $VERSION"
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
        PLATFORM="windows"
        DISTRO="windows"
        log_info "Windows 플랫폼 감지됨"
    else
        log_error "지원하지 않는 플랫폼: $OSTYPE"
        exit 1
    fi
    
    # 아키텍처 감지
    ARCH=$(uname -m)
    case $ARCH in
        x86_64) ARCH="amd64" ;;
        aarch64|arm64) ARCH="arm64" ;;
        armv7l) ARCH="armv7" ;;
        *) log_warning "알 수 없는 아키텍처: $ARCH" ;;
    esac
    
    log_success "플랫폼: $PLATFORM, 아키텍처: $ARCH"
}

detect_package_manager() {
    log_step "패키지 관리자 감지 중..."
    
    if command -v apt &> /dev/null; then
        PACKAGE_MANAGER="apt"
    elif command -v yum &> /dev/null; then
        PACKAGE_MANAGER="yum"
    elif command -v dnf &> /dev/null; then
        PACKAGE_MANAGER="dnf"
    elif command -v pacman &> /dev/null; then
        PACKAGE_MANAGER="pacman"
    elif command -v brew &> /dev/null; then
        PACKAGE_MANAGER="brew"
    elif command -v zypper &> /dev/null; then
        PACKAGE_MANAGER="zypper"
    else
        log_warning "알려진 패키지 관리자를 찾을 수 없습니다"
        PACKAGE_MANAGER="manual"
    fi
    
    log_success "패키지 관리자: $PACKAGE_MANAGER"
}

detect_init_system() {
    log_step "초기화 시스템 감지 중..."
    
    if command -v systemctl &> /dev/null; then
        INIT_SYSTEM="systemd"
    elif command -v launchctl &> /dev/null; then
        INIT_SYSTEM="launchd"
    elif [[ -f /etc/init.d ]]; then
        INIT_SYSTEM="sysv"
    else
        INIT_SYSTEM="manual"
    fi
    
    log_success "초기화 시스템: $INIT_SYSTEM"
}

# ===========================================
# ⚠️  설치 전 검사
# ===========================================

check_requirements() {
    log_step "시스템 요구사항 확인 중..."
    
    local missing_deps=()
    
    # 필수 명령어 확인
    local required_commands=("git" "curl" "tar")
    for cmd in "${required_commands[@]}"; do
        if ! command -v $cmd &> /dev/null; then
            missing_deps+=("$cmd")
        fi
    done
    
    # Python 확인
    if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null; then
        missing_deps+=("python3")
    fi
    
    # Node.js 확인 (선택사항)
    if ! command -v node &> /dev/null; then
        log_warning "Node.js가 설치되지 않았습니다 (나중에 설치 가능)"
    fi
    
    # 디스크 공간 확인 (최소 1GB)
    local available_space
    if [[ "$PLATFORM" == "macos" ]]; then
        available_space=$(df -h / | awk 'NR==2 {print $4}' | sed 's/G.*//')
    else
        available_space=$(df -h / | awk 'NR==2 {print $4}' | sed 's/G.*//')
    fi
    
    if [[ ${available_space%.*} -lt 1 ]]; then
        log_error "디스크 공간 부족: 최소 1GB 필요"
        exit 1
    fi
    
    # 권한 확인
    if [[ "$INSTALL_TYPE" == "system" ]] && [[ $EUID -ne 0 ]]; then
        log_error "시스템 설치를 위해서는 관리자 권한이 필요합니다"
        log_info "sudo $0 를 실행하거나 사용자 설치를 선택하세요"
        exit 1
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        log_error "다음 의존성이 누락되었습니다: ${missing_deps[*]}"
        log_info "자동으로 설치를 시도합니다..."
        install_system_dependencies
    else
        log_success "모든 시스템 요구사항이 충족되었습니다"
    fi
}

install_system_dependencies() {
    log_step "시스템 의존성 설치 중..."
    
    case $PACKAGE_MANAGER in
        apt)
            sudo apt update
            sudo apt install -y git curl python3 python3-pip build-essential
            ;;
        yum|dnf)
            sudo $PACKAGE_MANAGER install -y git curl python3 python3-pip gcc gcc-c++ make
            ;;
        pacman)
            sudo pacman -S --noconfirm git curl python python-pip base-devel
            ;;
        brew)
            brew install git curl python3
            ;;
        zypper)
            sudo zypper install -y git curl python3 python3-pip gcc make
            ;;
        *)
            log_error "패키지 관리자를 찾을 수 없습니다. 수동으로 의존성을 설치하세요:"
            log_info "필요한 패키지: git, curl, python3, python3-pip"
            exit 1
            ;;
    esac
    
    log_success "시스템 의존성 설치 완료"
}

# ===========================================
# 📥 다운로드 및 설치
# ===========================================

download_koki() {
    log_step "Koki AI Hub 다운로드 중..."
    
    # 기존 설치 확인
    if [[ -d "$INSTALL_LOCATION" ]]; then
        log_warning "기존 설치가 발견되었습니다: $INSTALL_LOCATION"
        read -p "백업 후 계속하시겠습니까? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            backup_existing_installation
        else
            log_info "설치가 취소되었습니다"
            exit 0
        fi
    fi
    
    # 설치 디렉토리 생성
    mkdir -p "$(dirname "$INSTALL_LOCATION")"
    
    # Git 클론
    if ! git clone --depth 1 --branch main "$KOKI_REPO" "$INSTALL_LOCATION"; then
        log_error "저장소 클론에 실패했습니다"
        exit 1
    fi
    
    log_success "Koki AI Hub 다운로드 완료"
}

backup_existing_installation() {
    log_step "기존 설치 백업 중..."
    
    local backup_name="koki-backup-$(date +%Y%m%d_%H%M%S)"
    local backup_path="$BACKUP_DIR/$backup_name"
    
    mkdir -p "$BACKUP_DIR"
    
    if mv "$INSTALL_LOCATION" "$backup_path"; then
        log_success "기존 설치가 백업되었습니다: $backup_path"
    else
        log_error "백업에 실패했습니다"
        exit 1
    fi
}

install_node_dependencies() {
    log_step "Node.js 의존성 설치 중..."
    
    cd "$INSTALL_LOCATION"
    
    # Node.js 설치 확인
    if ! command -v node &> /dev/null; then
        log_info "Node.js를 설치합니다..."
        install_nodejs
    fi
    
    # npm 의존성 설치
    if [[ -d "api-proxy" ]]; then
        cd api-proxy
        if npm install --production; then
            log_success "Node.js 의존성 설치 완료"
        else
            log_error "Node.js 의존성 설치 실패"
            exit 1
        fi
        cd ..
    fi
}

install_nodejs() {
    case $PLATFORM in
        linux)
            if [[ "$PACKAGE_MANAGER" == "apt" ]]; then
                curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
                sudo apt-get install -y nodejs
            elif [[ "$PACKAGE_MANAGER" == "yum" ]] || [[ "$PACKAGE_MANAGER" == "dnf" ]]; then
                curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
                sudo $PACKAGE_MANAGER install -y nodejs npm
            else
                log_error "Node.js 자동 설치를 지원하지 않는 배포판입니다"
                log_info "https://nodejs.org에서 수동으로 설치하세요"
                exit 1
            fi
            ;;
        macos)
            if command -v brew &> /dev/null; then
                brew install node
            else
                log_error "Homebrew가 필요합니다. https://brew.sh에서 설치하세요"
                exit 1
            fi
            ;;
        *)
            log_error "Node.js 자동 설치를 지원하지 않는 플랫폼입니다"
            exit 1
            ;;
    esac
}

# ===========================================
# ⚙️  설정 및 구성
# ===========================================

setup_configuration() {
    log_step "초기 설정 구성 중..."
    
    cd "$INSTALL_LOCATION"
    
    # 환경 설정 파일 생성
    if [[ ! -f .env ]]; then
        if [[ -f .env.example ]]; then
            cp .env.example .env
            log_success "환경 설정 파일이 생성되었습니다"
        else
            create_default_env
        fi
    fi
    
    # 디렉토리 권한 설정
    if [[ "$INSTALL_TYPE" == "system" ]]; then
        chown -R root:root "$INSTALL_LOCATION"
        chmod -R 755 "$INSTALL_LOCATION"
    else
        chmod -R 755 "$INSTALL_LOCATION"
    fi
    
    # 실행 스크립트 권한 설정
    local scripts=("deploy.sh" "run_server.py")
    for script in "${scripts[@]}"; do
        if [[ -f "$script" ]]; then
            chmod +x "$script"
        fi
    done
    
    log_success "초기 설정 구성 완료"
}

create_default_env() {
    log_info "기본 환경 설정 파일을 생성합니다..."
    
    cat > .env << 'EOF'
# Koki AI Hub 환경 설정
NODE_ENV=production
PORT=3001

# API 키 (실제 키로 변경하세요)
ANTHROPIC_API_KEY=sk-ant-test123456789
OPENAI_API_KEY=

# 보안 설정
JWT_SECRET=your-jwt-secret-key-here
SESSION_SECRET=your-session-secret-here

# 네트워크 설정
CORS_ORIGIN=*
HOST=0.0.0.0

# 기능 플래그
FEATURE_DUAL_AI=true
FEATURE_VIDEO_CHAT=true
FEATURE_VOICE_RECOGNITION=true

# 로그 설정
LOG_LEVEL=info
LOG_FILE=./logs/app.log
EOF
    
    log_success "기본 환경 설정 파일이 생성되었습니다"
}

# ===========================================
# 🔧 서비스 설정
# ===========================================

setup_service() {
    if [[ "$ENABLE_SERVICE" == true ]]; then
        log_step "시스템 서비스 설정 중..."
        
        case $INIT_SYSTEM in
            systemd)
                setup_systemd_service
                ;;
            launchd)
                setup_launchd_service
                ;;
            *)
                log_warning "자동 서비스 설정을 지원하지 않는 시스템입니다"
                create_manual_start_script
                ;;
        esac
    else
        create_manual_start_script
    fi
}

setup_systemd_service() {
    log_info "systemd 서비스를 생성합니다..."
    
    cat > /tmp/koki-ai-hub.service << EOF
[Unit]
Description=Koki AI Hub - Complete AI Workbench
Documentation=https://docs.koki-ai.com
After=network.target

[Service]
Type=simple
User=$(whoami)
WorkingDirectory=$INSTALL_LOCATION
ExecStart=$INSTALL_LOCATION/deploy.sh production --start
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=koki-ai-hub
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF
    
    sudo mv /tmp/koki-ai-hub.service /etc/systemd/system/
    sudo systemctl daemon-reload
    sudo systemctl enable koki-ai-hub
    
    if [[ "$AUTO_START" == true ]]; then
        sudo systemctl start koki-ai-hub
        log_success "systemd 서비스가 시작되었습니다"
    fi
    
    log_success "systemd 서비스 설정 완료"
}

setup_launchd_service() {
    log_info "launchd 서비스를 생성합니다..."
    
    local plist_path="$HOME/Library/LaunchAgents/com.koki-ai.hub.plist"
    
    cat > "$plist_path" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.koki-ai.hub</string>
    <key>ProgramArguments</key>
    <array>
        <string>$INSTALL_LOCATION/deploy.sh</string>
        <string>production</string>
        <string>--start</string>
    </array>
    <key>WorkingDirectory</key>
    <string>$INSTALL_LOCATION</string>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>$INSTALL_LOCATION/logs/stdout.log</string>
    <key>StandardErrorPath</key>
    <string>$INSTALL_LOCATION/logs/stderr.log</string>
</dict>
</plist>
EOF
    
    launchctl load "$plist_path"
    
    if [[ "$AUTO_START" == true ]]; then
        launchctl start com.koki-ai.hub
        log_success "launchd 서비스가 시작되었습니다"
    fi
    
    log_success "launchd 서비스 설정 완료"
}

create_manual_start_script() {
    log_info "수동 시작 스크립트를 생성합니다..."
    
    cat > "$INSTALL_LOCATION/start-koki.sh" << 'EOF'
#!/bin/bash

# Koki AI Hub 시작 스크립트
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🚀 Koki AI Hub 시작 중..."

# 환경 변수 로드
if [[ -f .env ]]; then
    set -a
    source .env
    set +a
fi

# 배포 스크립트 실행
if [[ -f deploy.sh ]]; then
    ./deploy.sh production --start
else
    # 폴백: Python 서버
    if [[ -f run_server.py ]]; then
        python3 run_server.py
    else
        echo "❌ 시작 스크립트를 찾을 수 없습니다"
        exit 1
    fi
fi
EOF
    
    chmod +x "$INSTALL_LOCATION/start-koki.sh"
    
    log_success "수동 시작 스크립트가 생성되었습니다: $INSTALL_LOCATION/start-koki.sh"
}

# ===========================================
# 🖥️  데스크톱 통합
# ===========================================

create_desktop_entry() {
    if [[ "$CREATE_DESKTOP_ENTRY" == true && "$PLATFORM" == "linux" ]]; then
        log_step "데스크톱 엔트리 생성 중..."
        
        local desktop_dir="$HOME/.local/share/applications"
        mkdir -p "$desktop_dir"
        
        cat > "$desktop_dir/koki-ai-hub.desktop" << EOF
[Desktop Entry]
Version=1.0
Type=Application
Name=Koki AI Hub
Comment=Complete AI Workbench - Claude & GPT-4 Integration
Exec=$INSTALL_LOCATION/start-koki.sh
Icon=$INSTALL_LOCATION/assets/icon.png
Terminal=false
Categories=Development;Office;Education;
Keywords=AI;Claude;GPT;Chatbot;Assistant;
StartupNotify=true
EOF
        
        chmod +x "$desktop_dir/koki-ai-hub.desktop"
        
        # 아이콘 생성 (기본 SVG 아이콘)
        mkdir -p "$INSTALL_LOCATION/assets"
        create_default_icon
        
        log_success "데스크톱 엔트리가 생성되었습니다"
    fi
}

create_default_icon() {
    cat > "$INSTALL_LOCATION/assets/icon.svg" << 'EOF'
<svg width="192" height="192" viewBox="0 0 192 192" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="192" height="192" rx="40" fill="url(#gradient0)"/>
  <defs>
    <linearGradient id="gradient0" x1="0" y1="0" x2="192" y2="192" gradientUnits="userSpaceOnUse">
      <stop stop-color="#667eea"/>
      <stop offset="1" stop-color="#764ba2"/>
    </linearGradient>
  </defs>
  <text x="96" y="110" font-family="sans-serif" font-size="80" fill="white" text-anchor="middle">🤖</text>
</svg>
EOF
    
    # SVG를 PNG로 변환 (ImageMagick이 있는 경우)
    if command -v convert &> /dev/null; then
        convert "$INSTALL_LOCATION/assets/icon.svg" "$INSTALL_LOCATION/assets/icon.png"
    fi
}

# ===========================================
# ✅ 설치 검증
# ===========================================

verify_installation() {
    log_step "설치 검증 중..."
    
    local verification_failed=false
    
    # 디렉토리 존재 확인
    if [[ ! -d "$INSTALL_LOCATION" ]]; then
        log_error "설치 디렉토리를 찾을 수 없습니다: $INSTALL_LOCATION"
        verification_failed=true
    fi
    
    # 필수 파일 확인
    local required_files=("index.html" "manifest.json" "deploy.sh")
    for file in "${required_files[@]}"; do
        if [[ ! -f "$INSTALL_LOCATION/$file" ]]; then
            log_error "필수 파일을 찾을 수 없습니다: $file"
            verification_failed=true
        fi
    done
    
    # 환경 설정 파일 확인
    if [[ ! -f "$INSTALL_LOCATION/.env" ]]; then
        log_warning "환경 설정 파일이 없습니다"
    fi
    
    # 권한 확인
    if [[ ! -x "$INSTALL_LOCATION/deploy.sh" ]]; then
        log_error "배포 스크립트에 실행 권한이 없습니다"
        verification_failed=true
    fi
    
    # 서비스 상태 확인
    if [[ "$ENABLE_SERVICE" == true ]]; then
        case $INIT_SYSTEM in
            systemd)
                if ! systemctl is-enabled koki-ai-hub &> /dev/null; then
                    log_warning "서비스가 활성화되지 않았습니다"
                fi
                ;;
            launchd)
                if ! launchctl list | grep -q com.koki-ai.hub; then
                    log_warning "서비스가 로드되지 않았습니다"
                fi
                ;;
        esac
    fi
    
    if [[ "$verification_failed" == true ]]; then
        log_error "설치 검증에 실패했습니다"
        return 1
    else
        log_success "설치 검증 완료"
        return 0
    fi
}

# ===========================================
# 🎉 설치 완료 및 안내
# ===========================================

show_completion_message() {
    print_divider
    echo -e "${GREEN}🎉 Koki AI Hub v$KOKI_VERSION 설치가 완료되었습니다!${NC}\n"
    
    echo -e "${CYAN}📂 설치 위치:${NC} $INSTALL_LOCATION"
    echo -e "${CYAN}🌐 접속 주소:${NC} http://localhost:8000"
    
    if [[ "$ENABLE_SERVICE" == true ]]; then
        echo -e "${CYAN}🔧 서비스 관리:${NC}"
        case $INIT_SYSTEM in
            systemd)
                echo "  시작: sudo systemctl start koki-ai-hub"
                echo "  중지: sudo systemctl stop koki-ai-hub"
                echo "  상태: sudo systemctl status koki-ai-hub"
                echo "  로그: sudo journalctl -u koki-ai-hub -f"
                ;;
            launchd)
                echo "  시작: launchctl start com.koki-ai.hub"
                echo "  중지: launchctl stop com.koki-ai.hub"
                ;;
        esac
    else
        echo -e "${CYAN}🚀 수동 시작:${NC} $INSTALL_LOCATION/start-koki.sh"
    fi
    
    echo ""
    echo -e "${YELLOW}⚙️  다음 단계:${NC}"
    echo "1. 브라우저에서 http://localhost:8000 접속"
    echo "2. 설정 페이지에서 Claude API 키 입력"
    echo "3. 마이크 및 카메라 권한 허용"
    echo "4. AI 채팅 시작!"
    
    echo ""
    echo -e "${BLUE}📚 도움말:${NC}"
    echo "• 사용자 가이드: https://docs.koki-ai.com"
    echo "• 커뮤니티: https://community.koki-ai.com"
    echo "• 이슈 리포트: https://github.com/koki-ai/hub/issues"
    
    if [[ "$AUTO_START" == true ]]; then
        echo ""
        echo -e "${GREEN}🔥 서비스가 자동으로 시작되었습니다!${NC}"
        echo "브라우저에서 바로 사용하실 수 있습니다."
    fi
    
    print_divider
}

show_error_message() {
    print_divider
    echo -e "${RED}❌ 설치 중 오류가 발생했습니다${NC}\n"
    
    echo -e "${YELLOW}🔧 문제 해결:${NC}"
    echo "1. 시스템 요구사항을 확인하세요"
    echo "2. 네트워크 연결을 확인하세요"
    echo "3. 충분한 디스크 공간이 있는지 확인하세요"
    echo "4. 관리자 권한이 필요한 경우 sudo를 사용하세요"
    
    echo ""
    echo -e "${BLUE}📞 지원:${NC}"
    echo "• GitHub Issues: https://github.com/koki-ai/hub/issues"
    echo "• 커뮤니티: https://discord.gg/koki-ai"
    echo "• 이메일: support@koki-ai.com"
    
    print_divider
}

# ===========================================
# 🔄 사용자 인터페이스
# ===========================================

show_install_options() {
    echo -e "${CYAN}설치 옵션을 선택해주세요:${NC}\n"
    
    echo "1) 사용자 설치 (권장) - $HOME/koki-ai-hub"
    echo "2) 시스템 설치 - /opt/koki-ai-hub"
    echo "3) Docker 설치"
    echo "4) 커스텀 위치"
    echo ""
    
    read -p "선택하세요 (1-4) [1]: " -n 1 -r choice
    echo ""
    
    case $choice in
        2)
            INSTALL_TYPE="system"
            INSTALL_LOCATION="$INSTALL_DIR"
            ENABLE_SERVICE=true
            ;;
        3)
            INSTALL_TYPE="docker"
            install_docker_version
            exit 0
            ;;
        4)
            read -p "설치 경로를 입력하세요: " custom_path
            if [[ -n "$custom_path" ]]; then
                INSTALL_LOCATION="$custom_path"
            fi
            ;;
        *)
            # 기본값 (사용자 설치)
            ;;
    esac
}

ask_additional_options() {
    echo -e "\n${CYAN}추가 옵션:${NC}"
    
    # 서비스 자동 시작
    if [[ "$INSTALL_TYPE" != "docker" ]]; then
        read -p "시스템 부팅 시 자동 시작하시겠습니까? (y/N): " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            ENABLE_SERVICE=true
            AUTO_START=true
        fi
    fi
    
    # 데스크톱 엔트리
    if [[ "$PLATFORM" == "linux" ]]; then
        read -p "데스크톱 바로가기를 생성하시겠습니까? (Y/n): " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Nn]$ ]]; then
            CREATE_DESKTOP_ENTRY=true
        fi
    fi
    
    # 의존성 설치
    read -p "시스템 의존성을 자동으로 설치하시겠습니까? (Y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Nn]$ ]]; then
        INSTALL_DEPENDENCIES=false
    fi
}

install_docker_version() {
    log_step "Docker를 사용한 설치를 시작합니다..."
    
    # Docker 설치 확인
    if ! command -v docker &> /dev/null; then
        log_info "Docker를 설치합니다..."
        install_docker
    fi
    
    # Docker Compose 설치 확인
    if ! command -v docker-compose &> /dev/null; then
        log_info "Docker Compose를 설치합니다..."
        install_docker_compose
    fi
    
    # 설정 파일 다운로드
    local temp_dir=$(mktemp -d)
    cd "$temp_dir"
    
    curl -fsSL https://raw.githubusercontent.com/koki-ai/hub/main/docker-compose.yml -o docker-compose.yml
    curl -fsSL https://raw.githubusercontent.com/koki-ai/hub/main/.env.example -o .env
    
    # 환경 설정
    echo "ANTHROPIC_API_KEY=sk-ant-test123456789" >> .env
    
    # 컨테이너 시작
    docker-compose up -d
    
    log_success "Docker 설치가 완료되었습니다!"
    log_info "접속 주소: http://localhost:8000"
    
    # 정리
    cd "$HOME"
    rm -rf "$temp_dir"
}

install_docker() {
    case $PLATFORM in
        linux)
            curl -fsSL https://get.docker.com | sh
            sudo systemctl start docker
            sudo systemctl enable docker
            sudo usermod -aG docker $USER
            ;;
        macos)
            log_error "macOS에서는 Docker Desktop을 수동으로 설치해주세요: https://docker.com/products/docker-desktop"
            exit 1
            ;;
        *)
            log_error "Docker 자동 설치를 지원하지 않는 플랫폼입니다"
            exit 1
            ;;
    esac
}

install_docker_compose() {
    if [[ "$PLATFORM" == "linux" ]]; then
        sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        sudo chmod +x /usr/local/bin/docker-compose
    fi
}

# ===========================================
# 🚀 메인 실행 함수
# ===========================================

main() {
    # 시그널 핸들러 설정
    trap 'log_error "설치가 중단되었습니다"; exit 1' INT TERM
    
    print_banner
    
    # 시스템 정보 수집
    detect_platform
    detect_package_manager
    detect_init_system
    
    # 사용자 옵션 수집
    show_install_options
    ask_additional_options
    
    print_divider
    log_step "설치를 시작합니다..."
    
    # 설치 프로세스
    if check_requirements; then
        download_koki
        
        if [[ "$INSTALL_DEPENDENCIES" == true ]]; then
            install_node_dependencies
        fi
        
        setup_configuration
        setup_service
        create_desktop_entry
        
        if verify_installation; then
            show_completion_message
        else
            show_error_message
            exit 1
        fi
    else
        show_error_message
        exit 1
    fi
}

# ===========================================
# 📋 명령행 인수 처리
# ===========================================

while [[ $# -gt 0 ]]; do
    case $1 in
        --system)
            INSTALL_TYPE="system"
            INSTALL_LOCATION="$INSTALL_DIR"
            ENABLE_SERVICE=true
            shift
            ;;
        --docker)
            INSTALL_TYPE="docker"
            shift
            ;;
        --location=*)
            INSTALL_LOCATION="${1#*=}"
            shift
            ;;
        --no-service)
            ENABLE_SERVICE=false
            shift
            ;;
        --no-auto-start)
            AUTO_START=false
            shift
            ;;
        --no-desktop)
            CREATE_DESKTOP_ENTRY=false
            shift
            ;;
        --no-deps)
            INSTALL_DEPENDENCIES=false
            shift
            ;;
        --help|-h)
            echo "Koki AI Hub 설치 스크립트"
            echo ""
            echo "사용법: $0 [옵션]"
            echo ""
            echo "옵션:"
            echo "  --system              시스템 설치 (/opt/koki-ai-hub)"
            echo "  --docker              Docker를 사용한 설치"
            echo "  --location=PATH       커스텀 설치 경로"
            echo "  --no-service          시스템 서비스 생성 안함"
            echo "  --no-auto-start       자동 시작 안함"
            echo "  --no-desktop          데스크톱 엔트리 생성 안함"
            echo "  --no-deps             의존성 자동 설치 안함"
            echo "  --help, -h            이 도움말 표시"
            echo ""
            echo "예시:"
            echo "  $0                    기본 사용자 설치"
            echo "  $0 --system           시스템 설치"
            echo "  $0 --docker           Docker 설치"
            echo "  $0 --location=/custom 커스텀 경로 설치"
            exit 0
            ;;
        *)
            log_error "알 수 없는 옵션: $1"
            log_info "도움말: $0 --help"
            exit 1
            ;;
    esac
done

# 스크립트 직접 실행 시
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
