#!/bin/bash

# 存储桶图片同步工具
# 适用于 Linux 和 macOS

# 设置颜色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 使脚本可执行
chmod +x "$0"

# 清屏
clear

echo -e "${BLUE}📸 存储桶图片同步工具${NC}"
echo "==========================="
echo

echo -e "${YELLOW}🎯 这个工具将立即同步您现有存储桶中的图片到前端${NC}"
echo

echo -e "${CYAN}⚡ 操作步骤：${NC}"
echo "   1. 修复存储桶权限设置"
echo "   2. 重新连接前端API接口"
echo "   3. 同步所有现有图片文件"
echo "   4. 验证同步结果"
echo

read -p "按Enter键继续..."

echo
echo -e "${PURPLE}📋 请按以下步骤操作：${NC}"
echo "================================"
echo

echo -e "${CYAN}🔧 第1步：打开Supabase控制台${NC}"
echo "   在浏览器中打开：https://supabase.com/dashboard/project/[您的项目ID]"
echo
read -p "按Enter键继续..."

echo -e "${CYAN}📝 第2步：执行快速同步脚本${NC}"
echo "   1. 点击左侧菜单的 'SQL Editor'"
echo "   2. 复制以下文件内容并粘贴到编辑器："
echo "      📄 QUICK_SYNC_IMAGES.sql"
echo "   3. 点击右上角的 'RUN' 按钮执行"
echo "   4. 等待出现 '🎉 快速同步完成！' 消息"
echo
read -p "按Enter键继续..."

echo -e "${CYAN}🧪 第3步：测试图片管理功能${NC}"
echo "   1. 打开您的网站"
echo "   2. 按 Ctrl+Alt+A 打开管理面板"
echo "   3. 点击 '图片管理' 按钮"
echo "   4. 查看是否能看到所有现有图片"
echo

echo -e "${GREEN}✅ 预期结果：${NC}"
echo "   • 能看到存储桶中的所有现有图片"
echo "   • 图片缩略图正常显示"
echo "   • 可以点击查看大图"
echo "   • 可以复制图片引用和URL"
echo "   • 可以上传新图片"
echo
read -p "按Enter键继续..."

echo
echo -e "${YELLOW}🔍 如果需要详细诊断，请执行：${NC}"
echo "================================"
echo

echo -e "${BLUE}📋 可选：执行完整诊断脚本${NC}"
echo "   在SQL Editor中执行 SYNC_EXISTING_IMAGES.sql"
echo "   这将提供详细的诊断信息和文件统计"
echo

echo -e "${RED}🆘 故障排除：${NC}"
echo "   • 如果图片仍无法显示，检查浏览器控制台(F12)"
echo "   • 确认Supabase环境变量设置正确"
echo "   • 使用图片管理中的'修复图片URL'功能"
echo "   • 查看 STORAGE_FIX_INSTRUCTIONS.md 获取详细指南"
echo

echo -e "${BLUE}📁 相关文件：${NC}"
echo "   • QUICK_SYNC_IMAGES.sql       - 快速同步脚本"
echo "   • SYNC_EXISTING_IMAGES.sql    - 完整诊断脚本"
echo "   • STORAGE_FIX_INSTRUCTIONS.md - 详细修复指南"
echo

# 检查文件是否存在
echo -e "${YELLOW}📋 检查必要文件：${NC}"
files=("QUICK_SYNC_IMAGES.sql" "SYNC_EXISTING_IMAGES.sql" "STORAGE_FIX_INSTRUCTIONS.md")

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "   ✅ $file - ${GREEN}存在${NC}"
    else
        echo -e "   ❌ $file - ${RED}缺失${NC}"
    fi
done

echo

# 提供快速复制命令
echo -e "${CYAN}💡 快速操作提示：${NC}"
echo

echo "在macOS上复制同步脚本到剪贴板："
echo -e "${YELLOW}pbcopy < QUICK_SYNC_IMAGES.sql${NC}"
echo

echo "在Linux上复制同步脚本到剪贴板（需要xclip）："
echo -e "${YELLOW}xclip -selection clipboard < QUICK_SYNC_IMAGES.sql${NC}"
echo

echo "或者直接查看同步脚本内容："
echo -e "${YELLOW}cat QUICK_SYNC_IMAGES.sql${NC}"
echo

echo -e "${GREEN}🎉 同步完成！${NC}"
echo "现在您的所有现有图片都应该在前端正常显示了。"
echo

read -p "按Enter键退出..."