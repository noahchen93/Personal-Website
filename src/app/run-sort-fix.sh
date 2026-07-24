#!/bin/bash

echo "🔧 修复项目排序功能..."

# 检查是否安装了 Supabase CLI
if ! command -v supabase &> /dev/null; then
    echo "❌ 请先安装 Supabase CLI：npm install -g supabase"
    exit 1
fi

# 检查是否已链接项目
if [ ! -f "supabase/config.toml" ]; then
    echo "❌ 项目未链接，请先运行: supabase link --project-ref YOUR_PROJECT_ID"
    exit 1
fi

echo "📊 运行数据库迁移 - 修复排序功能..."

# 运行数据库迁移
if supabase db reset; then
    echo "✅ 数据库迁移完成！"
else
    echo "❌ 数据库迁移失败，尝试手动运行迁移..."
    
    # 尝试单独运行排序修复脚本
    if supabase db push; then
        echo "✅ 数据库推送完成！"
    else
        echo "❌ 数据库推送失败"
        echo "请手动在 Supabase SQL Editor 中运行 supabase/migrations/004_fix_sort_order.sql"
        exit 1
    fi
fi

echo ""
echo "🚀 重新部署 Edge Function..."

# 重新部署 Edge Function
if supabase functions deploy server --no-verify-jwt; then
    echo "✅ Edge Function 部署成功！"
    
    # 获取项目ID
    PROJECT_REF=$(grep 'project_id' supabase/config.toml | cut -d'"' -f2 2>/dev/null)
    
    if [ ! -z "$PROJECT_REF" ]; then
        echo ""
        echo "🧪 测试端点："
        echo "健康检查: https://$PROJECT_REF.supabase.co/functions/v1/make-server-55b791b3/health"
        echo "项目列表: https://$PROJECT_REF.supabase.co/functions/v1/make-server-55b791b3/content/projects?language=zh"
        echo ""
    fi
    
    echo "✅ 项目排序功能已修复！"
    echo ""
    echo "📝 现在可以测试："
    echo "1. 打开管理员面板的项目管理页面"
    echo "2. 尝试拖拽项目进行重新排序"
    echo "3. 使用键盘上下键调整项目顺序"
    echo "4. 保存更改并刷新页面验证排序是否保持"
    echo "5. 检查前端显示的项目顺序是否正确"
    
else
    echo "❌ Edge Function 部署失败"
    exit 1
fi