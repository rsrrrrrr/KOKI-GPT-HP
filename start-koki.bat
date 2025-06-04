@echo off
chcp 65001 >nul
title Koki AI Hub v2.0.0 Pro

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                  🤖 Koki AI Hub v2.0.0 Pro                 ║
echo ║                    완벽한 AI 워크벤치                         ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

:: 필수 파일 확인
echo 🔍 파일 확인 중...
if not exist "index.html" (
    echo ❌ index.html 파일이 없습니다.
    goto :error
)
if not exist "manifest.json" (
    echo ❌ manifest.json 파일이 없습니다.
    goto :error
)
if not exist "sw.js" (
    echo ❌ sw.js 파일이 없습니다.
    goto :error
)
echo ✅ 모든 필수 파일이 확인되었습니다.
echo.

:: Python 확인 및 실행
echo 🐍 Python 확인 중...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python이 설치되지 않았거나 PATH에 등록되지 않았습니다.
    echo.
    echo 📥 Python 설치 방법:
    echo    1. https://python.org에서 Python 3.6 이상 다운로드
    echo    2. 설치 시 'Add Python to PATH' 체크
    echo    3. 설치 후 이 파일을 다시 실행
    echo.
    goto :alternative
)

echo ✅ Python이 확인되었습니다.
echo.

:: Python 서버 실행 확인
if exist "run_server.py" (
    echo 🚀 Python 서버로 실행 중...
    python run_server.py
) else (
    echo 🚀 기본 Python 서버로 실행 중...
    echo 📍 주소: http://localhost:8000
    echo 💡 Ctrl+C로 서버를 중지할 수 있습니다.
    echo.
    
    :: 브라우저에서 자동으로 열기 (3초 후)
    start "" cmd /c "timeout /t 3 /nobreak >nul & start http://localhost:8000"
    
    :: Python HTTP 서버 실행
    python -m http.server 8000
)

goto :end

:alternative
echo.
echo 🔧 대안 실행 방법:
echo.
echo 방법 1: Node.js 사용
echo    npm install -g http-server
echo    http-server
echo.
echo 방법 2: PHP 사용 (XAMPP 등)
echo    php -S localhost:8000
echo.
echo 방법 3: 웹 서버에 업로드
echo    - 웹 호스팅 서비스에 모든 파일 업로드
echo    - HTTPS 주소로 접속
echo.
echo 방법 4: Visual Studio Code
echo    - Live Server 확장 설치
echo    - index.html 우클릭 → Open with Live Server
echo.
goto :end

:error
echo.
echo ❌ 오류가 발생했습니다.
echo.
echo 📝 확인사항:
echo    1. 모든 파일이 같은 폴더에 있는지 확인
echo       - index.html
echo       - manifest.json  
echo       - sw.js
echo       - run_server.py (선택사항)
echo.
echo    2. 파일명이 정확한지 확인
echo.
echo    3. 파일이 손상되지 않았는지 확인
echo.

:end
echo.
echo 💡 추가 도움말:
echo    - README.md 파일을 참조하세요
echo    - 문제 발생 시 브라우저 개발자 도구(F12) 확인
echo    - 최신 Chrome, Edge, Firefox 브라우저 사용 권장
echo.
pause
