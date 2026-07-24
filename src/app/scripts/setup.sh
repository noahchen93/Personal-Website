#!/bin/bash

# 个人作品集网站快速设置脚本
# Portfolio Website Quick Setup Script

echo "🚀 开始设置个人作品集网站..."
echo "🚀 Starting Portfolio Website Setup..."

# 检查Node.js版本
echo "📋 检查Node.js版本..."
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 请先安装Node.js (>= 18.0.0)"
    echo "❌ Error: Please install Node.js (>= 18.0.0) first"
    echo "   下载地址/Download: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ 错误: Node.js版本过低，需要 >= 18.0.0，当前版本: $(node -v)"
    echo "❌ Error: Node.js version too old, requires >= 18.0.0, current: $(node -v)"
    exit 1
fi

echo "✅ Node.js版本检查通过: $(node -v)"

# 检查npm版本
echo "📋 检查npm版本..."
NPM_VERSION=$(npm -v | cut -d'.' -f1)
if [ "$NPM_VERSION" -lt 8 ]; then
    echo "⚠️  警告: npm版本较低，建议升级到最新版本"
    echo "⚠️  Warning: npm version is old, consider upgrading"
    echo "   升级命令/Upgrade: npm install -g npm@latest"
fi

echo "✅ npm版本: $(npm -v)"

# 安装依赖
echo "📦 安装项目依赖..."
echo "📦 Installing project dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ 依赖安装失败"
    echo "❌ Dependencies installation failed"
    exit 1
fi

echo "✅ 依赖安装完成"

# 创建环境变量文件
if [ ! -f .env ]; then
    echo "⚙️  创建环境变量文件..."
    echo "⚙️  Creating environment variables file..."
    cp .env.example .env
    echo "✅ 已创建 .env 文件，请填入你的Supabase配置"
    echo "✅ Created .env file, please fill in your Supabase configuration"
    echo ""
    echo "📝 需要填写的配置项:"
    echo "📝 Required configuration:"
    echo "   - VITE_SUPABASE_URL: https://your-project.supabase.co"
    echo "   - VITE_SUPABASE_ANON_KEY: your-anon-key"
    echo "   - VITE_SUPABASE_SERVICE_ROLE_KEY: your-service-role-key"
    echo ""
    echo "📖 获取方式: 登录 https://supabase.com/dashboard"
    echo "📖 How to get: Login to https://supabase.com/dashboard"
else
    echo "✅ 环境变量文件已存在"
    echo "✅ Environment variables file already exists"
fi

# 运行类型检查
echo "🔍 运行TypeScript类型检查..."
echo "🔍 Running TypeScript type checking..."
npm run type-check

if [ $? -ne 0 ]; then
    echo "⚠️  类型检查发现问题，但不影响运行"
    echo "⚠️  Type checking found issues, but won't prevent running"
fi

# 设置完成
echo ""
echo "🎉 设置完成！"
echo "🎉 Setup completed!"
echo ""
echo "📋 下一步操作:"
echo "📋 Next steps:"
echo ""
echo "1. 配置Supabase (必需):"
echo "   编辑 .env 文件，填入你的Supabase配置"
echo "   Edit .env file and fill in your Supabase configuration"
echo ""
echo "2. 启动开发服务器:"
echo "   npm run dev"
echo ""
echo "3. 构建生产版本:"
echo "   npm run build"
echo ""
echo "4. 部署到Vercel:"
echo "   - 推送代码到GitHub"
echo "   - 访问 https://vercel.com/new"
echo "   - 导入你的仓库"
echo ""
echo "📚 更多信息请查看 README.local.md"
echo "📚 For more information, see README.local.md"