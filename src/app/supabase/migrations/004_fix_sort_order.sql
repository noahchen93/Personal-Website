-- 修复项目排序功能 - 确保所有逻辑正确工作
-- 这个脚本将彻底修复项目排序问题

-- 1. 确保 sort_order 字段存在且有正确的默认值
ALTER TABLE public.content ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- 2. 重建索引确保查询性能
DROP INDEX IF EXISTS idx_content_sort_order;
CREATE INDEX idx_content_sort_order ON public.content(type, language, sort_order NULLS LAST, created_at DESC);

-- 3. 清理并重新设置现有项目的排序值
-- 首先清空所有现有的 sort_order 值，重新按时间排序
UPDATE public.content 
SET sort_order = NULL 
WHERE type = 'projects';

-- 然后为每个语言的项目重新分配排序值
WITH ranked_projects AS (
    SELECT 
        id,
        ROW_NUMBER() OVER (
            PARTITION BY type, COALESCE(language, 'zh')
            ORDER BY created_at DESC  -- 最新的项目排在前面
        ) * 10 as new_sort_order
    FROM public.content 
    WHERE type = 'projects'
)
UPDATE public.content 
SET sort_order = ranked_projects.new_sort_order
FROM ranked_projects 
WHERE public.content.id = ranked_projects.id;

-- 4. 创建/更新项目重排序函数 - 修复版本
CREATE OR REPLACE FUNCTION reorder_content_items(
    item_ids UUID[],
    content_type TEXT,
    content_language TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    item_id UUID;
    new_order INTEGER := 10;
    affected_count INTEGER := 0;
BEGIN
    -- 记录开始
    RAISE NOTICE 'Starting reorder for % items of type % in language %', 
        array_length(item_ids, 1), content_type, COALESCE(content_language, 'any');
    
    -- 更新每个项目的 sort_order
    FOREACH item_id IN ARRAY item_ids
    LOOP
        UPDATE public.content 
        SET sort_order = new_order, updated_at = NOW()
        WHERE id = item_id 
        AND type = content_type 
        AND (content_language IS NULL OR language = content_language);
        
        GET DIAGNOSTICS affected_count = ROW_COUNT;
        
        IF affected_count > 0 THEN
            RAISE NOTICE 'Updated item % to sort_order %', item_id, new_order;
        ELSE
            RAISE WARNING 'No rows updated for item %', item_id;
        END IF;
        
        new_order := new_order + 10;
    END LOOP;
    
    RAISE NOTICE 'Reorder completed';
END;
$$ LANGUAGE plpgsql;

-- 5. 创建一个测试排序的辅助函数
CREATE OR REPLACE FUNCTION test_project_ordering(content_language TEXT DEFAULT 'zh')
RETURNS TABLE(
    id UUID,
    title TEXT,
    sort_order INTEGER,
    created_at TIMESTAMPTZ,
    expected_order INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.title,
        c.sort_order,
        c.created_at,
        ROW_NUMBER() OVER (ORDER BY c.sort_order NULLS LAST, c.created_at DESC)::INTEGER as expected_order
    FROM public.content c
    WHERE c.type = 'projects'
    AND (content_language IS NULL OR c.language = content_language)
    ORDER BY c.sort_order NULLS LAST, c.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- 6. 授予必要的权限
GRANT EXECUTE ON FUNCTION reorder_content_items TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION test_project_ordering TO anon, authenticated, service_role;

-- 7. 创建触发器确保新项目自动获得正确的排序值
CREATE OR REPLACE FUNCTION auto_assign_sort_order()
RETURNS TRIGGER AS $$
DECLARE
    max_sort_order INTEGER;
BEGIN
    -- 只处理项目类型且没有显式设置 sort_order 的情况
    IF NEW.type = 'projects' AND (NEW.sort_order IS NULL OR NEW.sort_order = 0) THEN
        SELECT COALESCE(MAX(sort_order), 0) + 10
        INTO max_sort_order
        FROM public.content 
        WHERE type = 'projects' 
        AND (NEW.language IS NULL OR language = NEW.language);
        
        NEW.sort_order := max_sort_order;
        
        RAISE NOTICE 'Auto-assigned sort_order % to new project %', max_sort_order, NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 删除现有触发器（如果存在）
DROP TRIGGER IF EXISTS trigger_auto_assign_sort_order ON public.content;

-- 创建新触发器
CREATE TRIGGER trigger_auto_assign_sort_order
    BEFORE INSERT ON public.content
    FOR EACH ROW
    EXECUTE FUNCTION auto_assign_sort_order();

-- 8. 验证修复结果的查询
-- 运行这个查询来检查修复是否成功
DO $$
DECLARE
    project_count INTEGER;
    sorted_count INTEGER;
    zh_count INTEGER;
    en_count INTEGER;
BEGIN
    -- 统计项目总数
    SELECT COUNT(*) INTO project_count FROM public.content WHERE type = 'projects';
    
    -- 统计有排序值的项目数
    SELECT COUNT(*) INTO sorted_count FROM public.content WHERE type = 'projects' AND sort_order IS NOT NULL;
    
    -- 统计各语言项目数
    SELECT COUNT(*) INTO zh_count FROM public.content WHERE type = 'projects' AND language = 'zh';
    SELECT COUNT(*) INTO en_count FROM public.content WHERE type = 'projects' AND language = 'en';
    
    RAISE NOTICE '=== 排序修复验证结果 ===';
    RAISE NOTICE '总项目数: %', project_count;
    RAISE NOTICE '有排序值的项目数: %', sorted_count;
    RAISE NOTICE '中文项目数: %', zh_count;
    RAISE NOTICE '英文项目数: %', en_count;
    
    IF sorted_count = project_count THEN
        RAISE NOTICE '✅ 所有项目都已正确设置排序值';
    ELSE
        RAISE WARNING '⚠️ 还有 % 个项目没有排序值', (project_count - sorted_count);
    END IF;
END $$;

-- 9. 显示当前的项目排序状态（前10个）
SELECT 
    title,
    sort_order,
    language,
    created_at,
    '项目 ' || ROW_NUMBER() OVER (PARTITION BY language ORDER BY sort_order NULLS LAST, created_at DESC) as display_order
FROM public.content 
WHERE type = 'projects'
ORDER BY language, sort_order NULLS LAST, created_at DESC
LIMIT 10;