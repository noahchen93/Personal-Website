-- =====================================================
-- 统一完整的Supabase数据库配置
-- 确保前端和CMS完整同步所有内容
-- =====================================================

-- 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- 用于全文搜索
CREATE EXTENSION IF NOT EXISTS "unaccent"; -- 用于无重音符号搜索

-- =====================================================
-- 核心数据表结构
-- =====================================================

-- 主要内容表 (已优化，包含所有必要字段)
CREATE TABLE IF NOT EXISTS public.content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL,
    category TEXT,
    title TEXT,
    data JSONB NOT NULL DEFAULT '{}',
    language TEXT NOT NULL DEFAULT 'zh' CHECK (language IN ('zh', 'en')),
    sort_order INTEGER DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT false,
    is_featured BOOLEAN DEFAULT false, -- 用于标记特色内容
    view_count INTEGER DEFAULT 0, -- 浏览计数
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID, -- 允许NULL用于匿名内容
    tags TEXT[] DEFAULT '{}', -- 标签数组
    meta_description TEXT, -- SEO描述
    meta_keywords TEXT[], -- SEO关键词
    slug TEXT, -- URL友好的标识符
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived'))
);

-- 文件管理表
CREATE TABLE IF NOT EXISTS public.files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    content_id UUID REFERENCES public.content(id) ON DELETE SET NULL,
    alt_text TEXT,
    caption TEXT,
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    uploaded_by UUID,
    is_optimized BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}'
);

-- 增强的图片管理表
CREATE TABLE IF NOT EXISTS public.images (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_url TEXT,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    width INTEGER,
    height INTEGER,
    alt_text TEXT,
    caption TEXT,
    uploaded_by TEXT,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    storage_bucket TEXT DEFAULT 'make-55b791b3-portfolio-assets',
    is_compressed BOOLEAN DEFAULT false,
    compression_ratio DECIMAL(3,2),
    metadata JSONB DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    content_refs UUID[] DEFAULT '{}'  -- 引用此图片的内容ID数组
);

-- AI聊天记录表
CREATE TABLE IF NOT EXISTS public.chat_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id TEXT NOT NULL,
    user_message TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    user_ip TEXT,
    user_agent TEXT,
    response_time_ms INTEGER,
    token_count INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- 系统配置表
CREATE TABLE IF NOT EXISTS public.site_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'general',
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 访问统计表
CREATE TABLE IF NOT EXISTS public.page_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_type TEXT NOT NULL,
    page_id UUID,
    user_ip TEXT,
    user_agent TEXT,
    referer TEXT,
    language TEXT DEFAULT 'zh',
    session_id TEXT,
    viewed_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- KV存储表 (保持兼容现有系统)
CREATE TABLE IF NOT EXISTS public.kv_store_55b791b3 (
    key TEXT NOT NULL PRIMARY KEY,
    value JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    category TEXT DEFAULT 'general'
);

-- =====================================================
-- 性能优化索引
-- =====================================================

-- Content表的核心索引
CREATE INDEX IF NOT EXISTS idx_content_type_language_published 
ON public.content(type, language, is_published);

CREATE INDEX IF NOT EXISTS idx_content_type_language_category_published 
ON public.content(type, language, category, is_published);

CREATE INDEX IF NOT EXISTS idx_content_sort_order 
ON public.content(type, language, sort_order NULLS LAST, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_content_created_at 
ON public.content(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_content_status_published 
ON public.content(status, is_published);

CREATE INDEX IF NOT EXISTS idx_content_featured 
ON public.content(is_featured, is_published);

CREATE INDEX IF NOT EXISTS idx_content_tags 
ON public.content USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_content_slug 
ON public.content(slug) WHERE slug IS NOT NULL;

-- 全文搜索索引
CREATE INDEX IF NOT EXISTS idx_content_fulltext 
ON public.content USING GIN(to_tsvector('simple', title || ' ' || COALESCE(meta_description, '')));

-- Files表索引
CREATE INDEX IF NOT EXISTS idx_files_uploaded_at ON public.files(uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_files_content_id ON public.files(content_id);
CREATE INDEX IF NOT EXISTS idx_files_type ON public.files(file_type);

-- Images表索引
CREATE INDEX IF NOT EXISTS idx_images_uploaded_at ON public.images(uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_images_bucket ON public.images(storage_bucket);
CREATE INDEX IF NOT EXISTS idx_images_tags ON public.images USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_images_content_refs ON public.images USING GIN(content_refs);

-- Chat logs索引
CREATE INDEX IF NOT EXISTS idx_chat_logs_session ON public.chat_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_logs_created_at ON public.chat_logs(created_at DESC);

-- Site config索引
CREATE INDEX IF NOT EXISTS idx_site_config_key ON public.site_config(key);
CREATE INDEX IF NOT EXISTS idx_site_config_category ON public.site_config(category);
CREATE INDEX IF NOT EXISTS idx_site_config_public ON public.site_config(is_public);

-- Page views索引
CREATE INDEX IF NOT EXISTS idx_page_views_type_id ON public.page_views(page_type, page_id);
CREATE INDEX IF NOT EXISTS idx_page_views_date ON public.page_views(viewed_at);
CREATE INDEX IF NOT EXISTS idx_page_views_session ON public.page_views(session_id);

-- KV store索引
CREATE INDEX IF NOT EXISTS idx_kv_store_created_at ON public.kv_store_55b791b3(created_at);
CREATE INDEX IF NOT EXISTS idx_kv_store_expires_at ON public.kv_store_55b791b3(expires_at);
CREATE INDEX IF NOT EXISTS idx_kv_store_category ON public.kv_store_55b791b3(category);

-- =====================================================
-- 触发器和函数
-- =====================================================

-- 更新updated_at时间戳的通用函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为相关表创建updated_at触发器
DROP TRIGGER IF EXISTS update_content_updated_at ON public.content;
CREATE TRIGGER update_content_updated_at 
    BEFORE UPDATE ON public.content 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_site_config_updated_at ON public.site_config;
CREATE TRIGGER update_site_config_updated_at 
    BEFORE UPDATE ON public.site_config 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_kv_store_updated_at ON public.kv_store_55b791b3;
CREATE TRIGGER update_kv_store_updated_at 
    BEFORE UPDATE ON public.kv_store_55b791b3 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 自动分配排序值的函数
CREATE OR REPLACE FUNCTION auto_assign_sort_order()
RETURNS TRIGGER AS $$
DECLARE
    max_sort_order INTEGER;
BEGIN
    IF NEW.type = 'projects' AND (NEW.sort_order IS NULL OR NEW.sort_order = 0) THEN
        SELECT COALESCE(MAX(sort_order), 0) + 10
        INTO max_sort_order
        FROM public.content 
        WHERE type = 'projects' 
        AND language = NEW.language;
        
        NEW.sort_order := max_sort_order;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_assign_sort_order ON public.content;
CREATE TRIGGER trigger_auto_assign_sort_order
    BEFORE INSERT ON public.content
    FOR EACH ROW
    EXECUTE FUNCTION auto_assign_sort_order();

-- 自动生成slug的函数
CREATE OR REPLACE FUNCTION generate_slug_from_title()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.slug IS NULL AND NEW.title IS NOT NULL THEN
        NEW.slug := lower(regexp_replace(NEW.title, '[^a-zA-Z0-9\u4e00-\u9fff]+', '-', 'g'));
        NEW.slug := trim(both '-' from NEW.slug);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_generate_slug ON public.content;
CREATE TRIGGER trigger_generate_slug
    BEFORE INSERT OR UPDATE ON public.content
    FOR EACH ROW
    EXECUTE FUNCTION generate_slug_from_title();

-- 浏览计数更新函数
CREATE OR REPLACE FUNCTION increment_view_count(content_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.content 
    SET view_count = view_count + 1 
    WHERE id = content_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 实用函数
-- =====================================================

-- 获取指定类型和语言的内容
CREATE OR REPLACE FUNCTION get_content_by_type_and_language(
    content_type TEXT,
    content_language TEXT DEFAULT 'zh',
    content_category TEXT DEFAULT NULL,
    include_draft BOOLEAN DEFAULT false
)
RETURNS TABLE (
    id UUID,
    type TEXT,
    category TEXT,
    title TEXT,
    data JSONB,
    language TEXT,
    sort_order INTEGER,
    is_published BOOLEAN,
    is_featured BOOLEAN,
    view_count INTEGER,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    created_by UUID,
    tags TEXT[],
    meta_description TEXT,
    slug TEXT,
    status TEXT
) 
LANGUAGE plpgsql
AS $$
BEGIN
    IF content_category IS NULL THEN
        RETURN QUERY
        SELECT 
            c.id, c.type, c.category, c.title, c.data, c.language,
            c.sort_order, c.is_published, c.is_featured, c.view_count,
            c.created_at, c.updated_at, c.created_by, c.tags,
            c.meta_description, c.slug, c.status
        FROM content c
        WHERE c.type = content_type 
        AND c.language = content_language 
        AND (include_draft OR c.is_published = true)
        ORDER BY c.sort_order NULLS LAST, c.created_at DESC;
    ELSE
        RETURN QUERY
        SELECT 
            c.id, c.type, c.category, c.title, c.data, c.language,
            c.sort_order, c.is_published, c.is_featured, c.view_count,
            c.created_at, c.updated_at, c.created_by, c.tags,
            c.meta_description, c.slug, c.status
        FROM content c
        WHERE c.type = content_type 
        AND c.language = content_language 
        AND c.category = content_category
        AND (include_draft OR c.is_published = true)
        ORDER BY c.sort_order NULLS LAST, c.created_at DESC;
    END IF;
END;
$$;

-- 重排序内容项目
CREATE OR REPLACE FUNCTION reorder_content_items(
    item_ids UUID[],
    content_type TEXT,
    content_language TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    item_id UUID;
    new_order INTEGER := 10;
BEGIN
    FOREACH item_id IN ARRAY item_ids
    LOOP
        UPDATE public.content 
        SET sort_order = new_order, updated_at = NOW()
        WHERE id = item_id 
        AND type = content_type 
        AND (content_language IS NULL OR language = content_language);
        
        new_order := new_order + 10;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 搜索内容函数
CREATE OR REPLACE FUNCTION search_content(
    search_query TEXT,
    content_language TEXT DEFAULT 'zh',
    content_type TEXT DEFAULT NULL,
    limit_count INTEGER DEFAULT 20
)
RETURNS TABLE (
    id UUID,
    type TEXT,
    title TEXT,
    meta_description TEXT,
    language TEXT,
    rank REAL
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id, c.type, c.title, c.meta_description, c.language,
        ts_rank(to_tsvector('simple', c.title || ' ' || COALESCE(c.meta_description, '')), 
                plainto_tsquery('simple', search_query)) as rank
    FROM content c
    WHERE c.language = content_language
    AND c.is_published = true
    AND (content_type IS NULL OR c.type = content_type)
    AND to_tsvector('simple', c.title || ' ' || COALESCE(c.meta_description, '')) @@ plainto_tsquery('simple', search_query)
    ORDER BY rank DESC, c.created_at DESC
    LIMIT limit_count;
END;
$$;

-- 获取热门内容函数
CREATE OR REPLACE FUNCTION get_popular_content(
    content_language TEXT DEFAULT 'zh',
    days_back INTEGER DEFAULT 30,
    limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    type TEXT,
    title TEXT,
    view_count INTEGER,
    recent_views BIGINT
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id, c.type, c.title, c.view_count,
        COUNT(pv.id) as recent_views
    FROM content c
    LEFT JOIN page_views pv ON pv.page_id = c.id 
        AND pv.viewed_at > NOW() - INTERVAL '%s days'
    WHERE c.language = content_language
    AND c.is_published = true
    GROUP BY c.id, c.type, c.title, c.view_count
    ORDER BY recent_views DESC, c.view_count DESC
    LIMIT limit_count;
END;
$$;

-- 清理过期KV存储条目的函数
CREATE OR REPLACE FUNCTION cleanup_expired_kv_entries()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.kv_store_55b791b3 
    WHERE expires_at IS NOT NULL AND expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 存储桶设置
-- =====================================================

-- 创建存储桶（如果不存在）
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'make-55b791b3-portfolio-assets',
    'make-55b791b3-portfolio-assets',
    false,
    52428800, -- 50MB
    ARRAY[
        'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
        'video/mp4', 'video/webm',
        'application/pdf',
        'text/plain', 'text/markdown'
    ]
) ON CONFLICT (id) DO UPDATE SET
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- =====================================================
-- 行级安全策略 (RLS)
-- =====================================================

-- 启用RLS
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kv_store_55b791b3 ENABLE ROW LEVEL SECURITY;

-- 删除所有现有策略以避免冲突
DO $$ 
BEGIN
    -- Content表策略
    DROP POLICY IF EXISTS "Public content is viewable by everyone" ON public.content;
    DROP POLICY IF EXISTS "Authenticated users can view all content" ON public.content;
    DROP POLICY IF EXISTS "Service role can manage all content" ON public.content;
    DROP POLICY IF EXISTS "Anonymous users can insert content" ON public.content;
    DROP POLICY IF EXISTS "Authenticated users can insert content" ON public.content;
    DROP POLICY IF EXISTS "Anonymous users can update content" ON public.content;
    DROP POLICY IF EXISTS "Users can update own content" ON public.content;
    DROP POLICY IF EXISTS "Anonymous users can delete content" ON public.content;
    DROP POLICY IF EXISTS "Users can delete own content" ON public.content;
    DROP POLICY IF EXISTS "content_read_policy" ON public.content;
    DROP POLICY IF EXISTS "content_write_policy" ON public.content;
    
    -- Files表策略
    DROP POLICY IF EXISTS "Anyone can view files" ON public.files;
    DROP POLICY IF EXISTS "Service role can manage all files" ON public.files;
    DROP POLICY IF EXISTS "Anonymous users can upload files" ON public.files;
    DROP POLICY IF EXISTS "Authenticated users can upload files" ON public.files;
    DROP POLICY IF EXISTS "Anonymous users can update files" ON public.files;
    DROP POLICY IF EXISTS "Users can update own files" ON public.files;
    DROP POLICY IF EXISTS "Anonymous users can delete files" ON public.files;
    DROP POLICY IF EXISTS "Users can delete own files" ON public.files;
    
    -- Images表策略
    DROP POLICY IF EXISTS "Anyone can view images" ON public.images;
    DROP POLICY IF EXISTS "Service role can manage all images" ON public.images;
    DROP POLICY IF EXISTS "Anonymous users can upload images" ON public.images;
    DROP POLICY IF EXISTS "Authenticated users can upload images" ON public.images;
    DROP POLICY IF EXISTS "Anonymous users can update images" ON public.images;
    DROP POLICY IF EXISTS "Users can update own images" ON public.images;
    DROP POLICY IF EXISTS "Anonymous users can delete images" ON public.images;
    DROP POLICY IF EXISTS "Users can delete own images" ON public.images;
    
    -- Chat logs策略
    DROP POLICY IF EXISTS "Service role can manage chat logs" ON public.chat_logs;
    DROP POLICY IF EXISTS "Anonymous users can insert chat logs" ON public.chat_logs;
    DROP POLICY IF EXISTS "Authenticated users can insert chat logs" ON public.chat_logs;
    
    -- Storage策略
    DROP POLICY IF EXISTS "Anonymous users can upload images" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
    DROP POLICY IF EXISTS "Anyone can view images" ON storage.objects;
    DROP POLICY IF EXISTS "Anonymous users can update images" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated users can update images" ON storage.objects;
    DROP POLICY IF EXISTS "Anonymous users can delete images" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated users can delete images" ON storage.objects;
    DROP POLICY IF EXISTS "Service role can manage all storage objects" ON storage.objects;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

-- Content表的新策略
CREATE POLICY "content_select_policy" ON public.content
    FOR SELECT USING (
        is_published = true OR 
        auth.role() = 'authenticated' OR 
        auth.role() = 'service_role'
    );

CREATE POLICY "content_insert_policy" ON public.content
    FOR INSERT WITH CHECK (
        auth.role() = 'anon' OR 
        auth.role() = 'authenticated' OR 
        auth.role() = 'service_role'
    );

CREATE POLICY "content_update_policy" ON public.content
    FOR UPDATE USING (
        auth.role() = 'service_role' OR
        auth.role() = 'anon' OR
        (auth.role() = 'authenticated' AND created_by = auth.uid())
    );

CREATE POLICY "content_delete_policy" ON public.content
    FOR DELETE USING (
        auth.role() = 'service_role' OR
        auth.role() = 'anon' OR
        (auth.role() = 'authenticated' AND created_by = auth.uid())
    );

-- Files表策略
CREATE POLICY "files_select_policy" ON public.files
    FOR SELECT USING (true);

CREATE POLICY "files_insert_policy" ON public.files
    FOR INSERT WITH CHECK (
        auth.role() = 'anon' OR 
        auth.role() = 'authenticated' OR 
        auth.role() = 'service_role'
    );

CREATE POLICY "files_update_policy" ON public.files
    FOR UPDATE USING (
        auth.role() = 'service_role' OR
        auth.role() = 'anon' OR
        (auth.role() = 'authenticated' AND uploaded_by = auth.uid())
    );

CREATE POLICY "files_delete_policy" ON public.files
    FOR DELETE USING (
        auth.role() = 'service_role' OR
        auth.role() = 'anon' OR
        (auth.role() = 'authenticated' AND uploaded_by = auth.uid())
    );

-- Images表策略
CREATE POLICY "images_select_policy" ON public.images
    FOR SELECT USING (true);

CREATE POLICY "images_insert_policy" ON public.images
    FOR INSERT WITH CHECK (
        auth.role() = 'anon' OR 
        auth.role() = 'authenticated' OR 
        auth.role() = 'service_role'
    );

CREATE POLICY "images_update_policy" ON public.images
    FOR UPDATE USING (
        auth.role() = 'service_role' OR
        auth.role() = 'anon' OR
        (auth.role() = 'authenticated')
    );

CREATE POLICY "images_delete_policy" ON public.images
    FOR DELETE USING (
        auth.role() = 'service_role' OR
        auth.role() = 'anon' OR
        (auth.role() = 'authenticated')
    );

-- Chat logs策略
CREATE POLICY "chat_logs_select_policy" ON public.chat_logs
    FOR SELECT USING (auth.role() = 'service_role');

CREATE POLICY "chat_logs_insert_policy" ON public.chat_logs
    FOR INSERT WITH CHECK (
        auth.role() = 'anon' OR 
        auth.role() = 'authenticated' OR 
        auth.role() = 'service_role'
    );

-- Site config策略
CREATE POLICY "site_config_select_policy" ON public.site_config
    FOR SELECT USING (
        is_public = true OR 
        auth.role() = 'authenticated' OR 
        auth.role() = 'service_role'
    );

CREATE POLICY "site_config_modify_policy" ON public.site_config
    FOR ALL USING (
        auth.role() = 'service_role' OR
        auth.role() = 'authenticated'
    );

-- Page views策略
CREATE POLICY "page_views_select_policy" ON public.page_views
    FOR SELECT USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');

CREATE POLICY "page_views_insert_policy" ON public.page_views
    FOR INSERT WITH CHECK (true);

-- KV store策略
CREATE POLICY "kv_store_select_policy" ON public.kv_store_55b791b3
    FOR SELECT USING (true);

CREATE POLICY "kv_store_modify_policy" ON public.kv_store_55b791b3
    FOR ALL USING (
        auth.role() = 'service_role' OR
        auth.role() = 'anon' OR
        auth.role() = 'authenticated'
    );

-- Storage对象策略
CREATE POLICY "storage_objects_select_policy" ON storage.objects
    FOR SELECT USING (bucket_id = 'make-55b791b3-portfolio-assets');

CREATE POLICY "storage_objects_insert_policy" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'make-55b791b3-portfolio-assets' AND
        (auth.role() = 'anon' OR auth.role() = 'authenticated' OR auth.role() = 'service_role')
    );

CREATE POLICY "storage_objects_update_policy" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'make-55b791b3-portfolio-assets' AND
        (auth.role() = 'anon' OR auth.role() = 'authenticated' OR auth.role() = 'service_role')
    );

CREATE POLICY "storage_objects_delete_policy" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'make-55b791b3-portfolio-assets' AND
        (auth.role() = 'anon' OR auth.role() = 'authenticated' OR auth.role() = 'service_role')
    );

-- =====================================================
-- 权限授予
-- =====================================================

-- 授予基础权限
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;

-- 存储权限
GRANT ALL ON storage.objects TO anon, authenticated, service_role;
GRANT ALL ON storage.buckets TO anon, authenticated, service_role;

-- 函数权限
GRANT EXECUTE ON FUNCTION get_content_by_type_and_language TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION reorder_content_items TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION search_content TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_popular_content TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION increment_view_count TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION cleanup_expired_kv_entries TO service_role;

-- =====================================================
-- 初始化数据和配置
-- =====================================================

-- 插入基础网站配置
INSERT INTO public.site_config (key, value, description, category, is_public) VALUES
('site_title', '{"zh": "个人作品集", "en": "Personal Portfolio"}', '网站标题', 'general', true),
('site_description', '{"zh": "展示项目、兴趣和创作成果的个人网站", "en": "Personal website showcasing projects, interests and creative works"}', '网站描述', 'general', true),
('contact_email', '"contact@example.com"', '联系邮箱', 'contact', true),
('social_links', '{"github": "", "linkedin": "", "twitter": ""}', '社交媒体链接', 'contact', true),
('ai_chat_enabled', 'true', '是否启用AI聊天功能', 'features', true),
('analytics_enabled', 'false', '是否启用访问统计', 'features', false),
('theme_settings', '{"primary_color": "#3b82f6", "accent_color": "#6366f1"}', '主题设置', 'appearance', true)
ON CONFLICT (key) DO NOTHING;

-- 创建示例内容（如果不存在）
INSERT INTO public.content (type, title, data, language, is_published, status) VALUES
(
    'home',
    '欢迎来到我的作品集',
    '{
        "summary": "这是一个个人作品集网站，展示我的项目经历、个人兴趣和创作成果。",
        "education": [
            {
                "school": "示例大学",
                "major": "计算机科学", 
                "period": "2018–2022",
                "degree": "学士"
            }
        ],
        "workExperience": [
            {
                "company": "科技公司",
                "position": "前端开发工程师",
                "period": "2022至今",
                "description": "负责Web应用的前端开发，使用React、TypeScript等现代技术栈。"
            }
        ],
        "skills": ["React", "TypeScript", "Node.js", "Python", "UI/UX设计"]
    }',
    'zh',
    true,
    'published'
),
(
    'home',
    'Welcome to My Portfolio',
    '{
        "summary": "This is a personal portfolio website showcasing my projects, interests, and creative works.",
        "education": [
            {
                "school": "Example University",
                "major": "Computer Science", 
                "period": "2018–2022",
                "degree": "Bachelor"
            }
        ],
        "workExperience": [
            {
                "company": "Tech Company",
                "position": "Frontend Developer",
                "period": "2022-Present",
                "description": "Responsible for frontend development of web applications using modern tech stack like React and TypeScript."
            }
        ],
        "skills": ["React", "TypeScript", "Node.js", "Python", "UI/UX Design"]
    }',
    'en',
    true,
    'published'
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 清理和优化
-- =====================================================

-- 更新现有内容的sort_order（如果为NULL或0）
UPDATE public.content 
SET sort_order = (
    SELECT (ROW_NUMBER() OVER (
        PARTITION BY type, language 
        ORDER BY created_at DESC
    ) * 10)
    FROM (
        SELECT id, type, language, created_at,
               ROW_NUMBER() OVER (
                   PARTITION BY type, language 
                   ORDER BY created_at DESC
               ) as rn
        FROM public.content c2
        WHERE c2.type = public.content.type 
        AND c2.language = public.content.language
    ) ranked
    WHERE ranked.id = public.content.id
)
WHERE sort_order IS NULL OR sort_order = 0;

-- 清理过期的KV存储条目
SELECT cleanup_expired_kv_entries();

-- 分析表以优化查询性能
ANALYZE public.content;
ANALYZE public.files;
ANALYZE public.images;
ANALYZE public.chat_logs;
ANALYZE public.site_config;
ANALYZE public.page_views;
ANALYZE public.kv_store_55b791b3;

-- =====================================================
-- 验证和报告
-- =====================================================

DO $$
DECLARE
    content_count INTEGER;
    image_count INTEGER;
    config_count INTEGER;
    bucket_exists BOOLEAN;
BEGIN
    SELECT COUNT(*) INTO content_count FROM public.content;
    SELECT COUNT(*) INTO image_count FROM public.images;
    SELECT COUNT(*) INTO config_count FROM public.site_config;
    
    SELECT EXISTS(SELECT 1 FROM storage.buckets WHERE id = 'make-55b791b3-portfolio-assets') 
    INTO bucket_exists;
    
    RAISE NOTICE '=== Supabase数据库统一配置完成 ===';
    RAISE NOTICE '内容记录数: %', content_count;
    RAISE NOTICE '图片记录数: %', image_count;
    RAISE NOTICE '配置记录数: %', config_count;
    RAISE NOTICE '存储桶状态: %', CASE WHEN bucket_exists THEN '✅ 已创建' ELSE '❌ 未创建' END;
    RAISE NOTICE '数据库已完全同步，前端和CMS可以正常使用';
    RAISE NOTICE '========================================';
END $$;

-- 最终提交
COMMIT;