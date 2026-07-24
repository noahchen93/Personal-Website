#!/bin/bash

chmod +x "$0"

echo "🔧 运行所有修复脚本"
echo "=================="
echo "时间戳: $(date)"
echo ""

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[信息]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[成功]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[警告]${NC} $1"
}

print_error() {
    echo -e "${RED}[错误]${NC} $1"
}

# 1. 检查 DialogContent 无障碍问题已修复
print_status "步骤 1: 检查 DialogContent 无障碍问题修复"
if grep -q "DialogDescription" components/admin/markdown/ColumnDialog.tsx; then
    print_success "ColumnDialog 已包含 DialogDescription - 无障碍问题已修复"
else
    print_error "ColumnDialog 缺少 DialogDescription"
fi

# 2. 运行存储修复脚本
print_status "步骤 2: 运行存储修复脚本"
if [ -f "./fix-storage-comprehensive.sh" ]; then
    chmod +x ./fix-storage-comprehensive.sh
    print_status "正在执行存储修复脚本..."
    ./fix-storage-comprehensive.sh
else
    print_error "存储修复脚本不存在"
fi

echo ""
print_status "修复脚本执行完成"
echo ""
echo "📋 下一步操作："
echo "1. 查看 IMMEDIATE_FIXES.md 文件了解详细修复说明"
echo "2. 在 Supabase Dashboard 中手动创建存储桶（如果自动创建失败）"
echo "3. 运行存储桶 SQL 脚本"
echo "4. 重新部署 Edge Functions"
echo "5. 测试应用功能"
echo ""
echo "🔗 有用的链接："
echo "- Supabase Dashboard: https://supabase.com/dashboard"
echo "- 存储桶管理: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/storage/buckets"
echo "- SQL 编辑器: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql"
echo ""
echo "如果问题持续存在，请检查："
echo "- 环境变量配置"
echo "- 项目账单状态"
echo "- Storage 服务是否启用"
echo "- RLS 策略配置"