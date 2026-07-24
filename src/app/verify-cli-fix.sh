#!/bin/bash

echo "🔍 验证Supabase CLI兼容性修复"
echo "=============================="

# 获取项目ID
PROJECT_REF=$(supabase status 2>/dev/null | grep "Project ID" | cut -d: -f2 | tr -d ' ')

if [ -z "$PROJECT_REF" ]; then
    echo "❌ 无法获取项目ID，请确保已链接到Supabase项目"
    exit 1
fi

echo "📋 项目ID: $PROJECT_REF"
echo ""

# 测试健康检查端点
HEALTH_URL="https://${PROJECT_REF}.supabase.co/functions/v1/server/make-server-55b791b3/health"
echo "🧪 测试健康检查端点..."
echo "URL: $HEALTH_URL"
echo ""

# 执行请求并保存响应
response=$(curl -s "$HEALTH_URL" 2>/dev/null)
http_code=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_URL" 2>/dev/null)

echo "HTTP状态码: $http_code"

if [ "$http_code" = "200" ]; then
    echo "✅ 函数响应正常"
    echo ""
    echo "📊 响应内容:"
    echo "$response" | jq '.' 2>/dev/null || echo "$response"
    echo ""
    
    # 检查CLI兼容性标识
    if echo "$response" | grep -q '"cli_compatible":true' 2>/dev/null; then
        echo "✅ CLI兼容性标识: 已修复"
    else
        echo "⚠️ CLI兼容性标识: 未找到"
    fi
    
    # 检查版本
    if echo "$response" | grep -q '"version":"4.0.0"' 2>/dev/null; then
        echo "✅ 版本: 4.0.0 (最新)"
    else
        echo "⚠️ 版本: 可能需要更新"
    fi
    
    # 检查时间戳
    deployment_time=$(echo "$response" | jq -r '.deployment.updated_at // .timestamp' 2>/dev/null)
    if [ "$deployment_time" != "null" ] && [ -n "$deployment_time" ]; then
        echo "✅ 部署时间: $deployment_time"
    fi
    
else
    echo "❌ 函数响应异常 (HTTP $http_code)"
    if [ -n "$response" ]; then
        echo "响应内容: $response"
    fi
    echo ""
    echo "🔧 故障排除建议:"
    echo "1. 运行修复脚本: npm run fix:cli-quick"
    echo "2. 查看函数日志: supabase functions logs server"
    echo "3. 重新部署: supabase functions deploy server --no-verify-jwt"
fi

echo ""
echo "📋 其他有用的测试:"
echo "• 内容端点: https://${PROJECT_REF}.supabase.co/functions/v1/server/make-server-55b791b3/content/test"
echo "• 图片端点: https://${PROJECT_REF}.supabase.co/functions/v1/server/make-server-55b791b3/images"
echo ""