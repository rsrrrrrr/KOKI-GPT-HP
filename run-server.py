#!/usr/bin/env python3
"""
Koki AI Hub 로컬 서버 실행 스크립트
Python 3.6+ 필요
"""

import http.server
import socketserver
import webbrowser
import os
import sys
import threading
import time
from pathlib import Path

# 설정
PORT = 8000
HOST = 'localhost'
OPEN_BROWSER = True

class KokiHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """커스텀 HTTP 요청 핸들러"""
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=os.path.dirname(os.path.abspath(__file__)), **kwargs)
    
    def end_headers(self):
        # CORS 헤더 추가 (개발용)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        
        # PWA를 위한 MIME 타입 설정
        if self.path.endswith('.json'):
            self.send_header('Content-Type', 'application/json')
        elif self.path.endswith('.js'):
            self.send_header('Content-Type', 'application/javascript')
        elif self.path.endswith('.css'):
            self.send_header('Content-Type', 'text/css')
        
        # 캐시 설정 (개발용으로 캐시 비활성화)
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        
        super().end_headers()
    
    def do_OPTIONS(self):
        """CORS preflight 요청 처리"""
        self.send_response(200)
        self.end_headers()
    
    def log_message(self, format, *args):
        """로그 메시지 포맷 개선"""
        timestamp = time.strftime('%Y-%m-%d %H:%M:%S')
        print(f"[{timestamp}] {format % args}")

def check_files():
    """필수 파일 존재 확인"""
    required_files = ['index.html', 'manifest.json', 'sw.js']
    missing_files = []
    
    for file in required_files:
        if not Path(file).exists():
            missing_files.append(file)
    
    if missing_files:
        print("❌ 다음 파일들이 누락되었습니다:")
        for file in missing_files:
            print(f"   - {file}")
        print("\n📝 모든 파일을 동일한 폴더에 저장했는지 확인해주세요.")
        return False
    
    return True

def find_available_port(start_port=8000, max_attempts=10):
    """사용 가능한 포트 찾기"""
    import socket
    
    for port in range(start_port, start_port + max_attempts):
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.bind((HOST, port))
                return port
        except OSError:
            continue
    
    return None

def open_browser_delayed(url, delay=2):
    """지연된 브라우저 열기"""
    def open_browser():
        time.sleep(delay)
        try:
            webbrowser.open(url)
            print(f"🌐 브라우저에서 {url} 를 열었습니다.")
        except Exception as e:
            print(f"⚠️  브라우저를 자동으로 열 수 없습니다: {e}")
            print(f"   수동으로 브라우저에서 {url} 를 열어주세요.")
    
    if OPEN_BROWSER:
        thread = threading.Thread(target=open_browser)
        thread.daemon = True
        thread.start()

def print_startup_info(host, port):
    """시작 정보 출력"""
    print("=" * 60)
    print("🤖 Koki AI Hub v2.0.0 Pro")
    print("=" * 60)
    print(f"🚀 서버가 시작되었습니다!")
    print(f"📍 주소: http://{host}:{port}")
    print(f"📁 디렉토리: {os.getcwd()}")
    print("=" * 60)
    print("📱 PWA 설치:")
    print("   - 브라우저에서 '앱에 추가' 또는 '홈 화면에 추가' 클릭")
    print("   - 모바일에서는 공유 버튼 → '홈 화면에 추가'")
    print("=" * 60)
    print("⚙️  설정:")
    print("   - Claude API 키: sk-ant-test123456789 (테스트용)")
    print("   - 실제 API 키는 Anthropic 콘솔에서 발급")
    print("=" * 60)
    print("🔥 기능:")
    print("   ✅ AI 채팅 (Claude)")
    print("   ✅ 듀얼 AI 비교 (Claude vs GPT-4)")
    print("   ✅ 영상 채팅 (카메라 + 음성)")
    print("   ✅ AI 도구 모음 (작성, 번역, 코딩 등)")
    print("   ✅ 오프라인 지원 (PWA)")
    print("=" * 60)
    print("💡 팁:")
    print("   - Ctrl+C로 서버 중지")
    print("   - 파일 수정 시 브라우저에서 F5로 새로고침")
    print("   - 개발자 도구에서 'debug()' 명령으로 디버그 정보 확인")
    print("=" * 60)

def main():
    try:
        print("🔍 시스템 확인 중...")
        
        # Python 버전 확인
        if sys.version_info < (3, 6):
            print("❌ Python 3.6 이상이 필요합니다.")
            print(f"   현재 버전: {sys.version}")
            sys.exit(1)
        
        # 필수 파일 확인
        if not check_files():
            sys.exit(1)
        
        # 사용 가능한 포트 찾기
        available_port = find_available_port(PORT)
        if not available_port:
            print(f"❌ 포트 {PORT}부터 {PORT + 9}까지 모두 사용 중입니다.")
            print("   다른 프로그램을 종료하거나 포트를 변경해주세요.")
            sys.exit(1)
        
        # 서버 시작
        with socketserver.TCPServer((HOST, available_port), KokiHTTPRequestHandler) as httpd:
            url = f"http://{HOST}:{available_port}"
            
            # 시작 정보 출력
            print_startup_info(HOST, available_port)
            
            # 브라우저 열기
            open_browser_delayed(url)
            
            print(f"🎯 서버 실행 중... (포트 {available_port})")
            print("   Ctrl+C를 눌러 중지하세요.\n")
            
            # 서버 실행
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print("\n🛑 서버를 중지합니다...")
        print("👋 Koki AI Hub를 사용해주셔서 감사합니다!")
    
    except Exception as e:
        print(f"❌ 서버 실행 중 오류 발생: {e}")
        print("\n🔧 문제 해결:")
        print("   1. 포트가 사용 중인지 확인")
        print("   2. 방화벽 설정 확인")
        print("   3. 관리자 권한으로 실행")
        sys.exit(1)

if __name__ == "__main__":
    main()
