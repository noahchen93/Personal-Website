@echo off
cd /d "%~dp0"
echo 正在安装依赖...
npm install

echo 启动本地开发服务器...
start "dev-server" cmd /c "npm run dev"

REM 等待服务器启动
ping 127.0.0.1 -n 6 >nul
start http://localhost:3000
