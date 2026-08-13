@echo off
chcp 65001 > nul
title EduMath AI 伺服器
echo.
echo ============================================
echo   EduMath AI 本地伺服器
echo   網址：http://localhost:8888
echo   關閉此視窗即停止伺服器
echo ============================================
echo.
cd /d "%~dp0"
start "" "http://localhost:8888/index.html"
"C:\Users\USER\AppData\Local\Programs\Python\Python312\python.exe" -m http.server 8888
pause
