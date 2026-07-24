@echo off
chcp 65001 >nul
echo.
echo 🚀 开始设置个人作品集网站...
echo 🚀 Starting Portfolio Website Setup...
echo.

REM 检查Node.js版本
echo 📋 检查Node.js版本...
node -v >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误: 请先安装Node.js ^(^>= 18.0.0^)
    echo ❌ Error: Please install Node.js ^(^>= 18.0.0^) first
    echo    下载地址/Download: https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=2 delims=v." %%i in ('node -v') do set NODE_MAJOR=%%i
if %NODE_MAJOR% lss 18 (
    echo ❌ 错误: Node.js版本过低，需要 ^>= 18.0.0
    echo ❌ Error: Node.js version too old, requires ^>= 18.0.0
    for /f "tokens=*" %%i in ('node -v') do echo    当前版本/Current: %%i
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do echo ✅ Node.js版本检查通过: %%i

REM 检查npm版本
echo 📋 检查npm版本...
for /f "tokens=*" %%i in ('npm -v') do (
    echo ✅ npm版本: %%i
    set NPM_VERSION=%%i
)

REM 安装依赖
echo.
echo 📦 安装项目依赖...
echo 📦 Installing project dependencies...
call npm install
if errorlevel 1 (
    echo ❌ 依赖安装失败
    echo ❌ Dependencies installation failed
    pause
    exit /b 1
)
echo ✅ 依赖安装完成

REM 创建环境变量文件
if not exist .env (
    echo.
    echo ⚙️  创建环境变量文件...
    echo ⚙️  Creating environment variables file...
    copy .env.example .env >nul
    echo ✅ 已创建 .env 文件，请填入你的Supabase配置
    echo ✅ Created .env file, please fill in your Supabase configuration
    echo.
    echo 📝 需要填写的配置项:
    echo 📝 Required configuration:
    echo    - VITE_SUPABASE_URL: https://your-project.supabase.co
    echo    - VITE_SUPABASE_ANON_KEY: your-anon-key
    echo    - VITE_SUPABASE_SERVICE_ROLE_KEY: your-service-role-key
    echo.
    echo 📖 获取方式: 登录 https://supabase.com/dashboard
    echo 📖 How to get: Login to https://supabase.com/dashboard
) else (
    echo ✅ 环境变量文件已存在
    echo ✅ Environment variables file already exists
)

REM 运行类型检查
echo.
echo 🔍 运行TypeScript类型检查...
echo 🔍 Running TypeScript type checking...
call npm run type-check
if errorlevel 1 (
    echo ⚠️  类型检查发现问题，但不影响运行
    echo ⚠️  Type checking found issues, but won't prevent running
)

REM 设置完成
echo.
echo 🎉 设置完成！
echo 🎉 Setup completed!
echo.
echo 📋 下一步操作:
echo 📋 Next steps:
echo.
echo 1. 配置Supabase ^(必需^):
echo    编辑 .env 文件，填入你的Supabase配置
echo    Edit .env file and fill in your Supabase configuration
echo.
echo 2. 启动开发服务器:
echo    npm run dev
echo.
echo 3. 构建生产版本:
echo    npm run build
echo.
echo 4. 部署到Vercel:
echo    - 推送代码到GitHub
echo    - 访问 https://vercel.com/new
echo    - 导入你的仓库
echo.
echo 📚 更多信息请查看 README.local.md
echo 📚 For more information, see README.local.md
echo.
pause