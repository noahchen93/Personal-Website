@echo off
setlocal enabledelayedexpansion
set PORT=3000
set RETRIES=20
set WAIT=2

:loop
powershell -Command "try { $tcp = New-Object Net.Sockets.TcpClient('localhost', %PORT%); $tcp.Close(); exit 0 } catch { exit 1 }"
if !errorlevel! == 0 (
    start http://localhost:%PORT%
    exit /b
) else (
    set /a RETRIES-=1
    if !RETRIES! LEQ 0 (
        echo 端口 %PORT% 未开放，自动打开失败。
        exit /b
    )
    timeout /t %WAIT% >nul
    goto loop
)
