#!/bin/bash

echo "⚡ 快速CLI兼容性状态检查"
echo "========================="

# 获取项目信息
if ! supabase status &>/dev/null; then
    echo "❌ 项目未链接"
    echo "请运行: npm run fix:now"
    exit 1
fi

PROJECT_REF=$(supabase status 2>/dev/null | grep "Project ID" | cut -d: -f2 | tr -d ' ')

if [ -z "$PROJECT_REF" ]; then
    echo "❌ 无法获取项目ID"
    exit 1
fi

echo "📋 项目: $PROJECT_REF"

# 测试健康检查
HEALTH_URL="https://${PROJECT_REF}.supabase.co/functions/v1/server/make-server-55b791b3/health"
response=$(curl -s "$HEALTH_URL" -m 10 2>/dev/null || echo "ERROR")
http_code=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_URL" -m 10 2>/dev/null || echo "000")

echo "🌐 状态: HTTP $http_code"

if [ "$http_code" = "200" ]; then
    if echo "$response" | grep -q '"cli_compatible":true' 2>/dev/null; then
        echo "✅ CLI兼容性: 已修复"
    else
        echo "❌ CLI兼容性: 需要修复"
        echo ""
        echo "🔧 立即修复: npm run fix:now"
        exit 1
    fi
    
    if echo "$response" | grep -q '"version":"4.0.0"' 2>/dev/null; then
        echo "✅ 版本: 4.0.0 (最新)"
    fi
    
    echo "✅ Edge Function正常运行"
    echo ""
    echo "🎉 CLI兼容性问题已解决!"
    
else
    echo "❌ Edge Function响应异常"
    echo ""
    echo "🔧 立即修复: npm run fix:now"
    exit 1
fi