#!/bin/bash

# 运行存储桶修复脚本
echo "开始运行存储桶修复脚本..."
echo "================================"

# 确保脚本有执行权限
chmod +x fix-storage-comprehensive.sh

# 执行修复脚本
./fix-storage-comprehensive.sh

echo ""
echo "修复脚本执行完成!"
echo "================================"
echo ""
echo "后续步骤:"
echo "1. 请到Supabase Dashboard确认存储桶已创建"
echo "2. 验证RLS策略已正确设置"
echo "3. 测试图片上传功能"
echo "4. 如遇问题请检查Dashboard中的错误日志"