-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables
CREATE TABLE IF NOT EXISTS public.content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL,
    category TEXT,
    title TEXT,
    data JSONB NOT NULL DEFAULT '{}',
    is_published BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID -- Allow NULL for anonymous content
);

CREATE TABLE IF NOT EXISTS public.files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    content_id UUID REFERENCES public.content(id) ON DELETE SET NULL,
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    uploaded_by UUID -- Allow NULL for anonymous uploads
);

CREATE TABLE IF NOT EXISTS public.images (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_url TEXT,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    alt_text TEXT,
    caption TEXT,
    uploaded_by TEXT, -- Allow NULL for anonymous uploads
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    storage_bucket TEXT DEFAULT 'make-55b791b3-portfolio-assets',
    -- 添加Storage所需的metadata字段以避免schema冲突
    metadata JSONB DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS public.chat_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id TEXT NOT NULL,
    user_message TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    user_ip TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_content_type ON public.content(type);
CREATE INDEX IF NOT EXISTS idx_content_category ON public.content(category);
CREATE INDEX IF NOT EXISTS idx_content_published ON public.content(is_published);
CREATE INDEX IF NOT EXISTS idx_content_created_at ON public.content(created_at);
CREATE INDEX IF NOT EXISTS idx_files_uploaded_at ON public.files(uploaded_at);
CREATE INDEX IF NOT EXISTS idx_images_uploaded_at ON public.images(uploaded_at);
CREATE INDEX IF NOT EXISTS idx_chat_logs_session ON public.chat_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_logs_created_at ON public.chat_logs(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for content table
-- Allow anyone to read published content
CREATE POLICY "Public content is viewable by everyone" ON public.content
    FOR SELECT USING (is_published = true);

-- Allow authenticated users to view all content
CREATE POLICY "Authenticated users can view all content" ON public.content
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow service role to do everything (for server functions)
CREATE POLICY "Service role can manage all content" ON public.content
    FOR ALL USING (auth.role() = 'service_role');

-- Allow anonymous users to insert content (for development/demo)
CREATE POLICY "Anonymous users can insert content" ON public.content
    FOR INSERT WITH CHECK (auth.role() = 'anon');

-- Allow authenticated users to insert content
CREATE POLICY "Authenticated users can insert content" ON public.content
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow anonymous users to update content they created
CREATE POLICY "Anonymous users can update content" ON public.content
    FOR UPDATE USING (auth.role() = 'anon' OR auth.role() = 'service_role');

-- Allow users to update their own content
CREATE POLICY "Users can update own content" ON public.content
    FOR UPDATE USING (
        auth.role() = 'authenticated' AND 
        (created_by = auth.uid() OR auth.role() = 'service_role')
    );

-- Allow anonymous users to delete content (for development/demo)
CREATE POLICY "Anonymous users can delete content" ON public.content
    FOR DELETE USING (auth.role() = 'anon' OR auth.role() = 'service_role');

-- Allow users to delete their own content
CREATE POLICY "Users can delete own content" ON public.content
    FOR DELETE USING (
        auth.role() = 'authenticated' AND 
        (created_by = auth.uid() OR auth.role() = 'service_role')
    );

-- RLS Policies for files table
-- Allow anyone to view files (since they need signed URLs anyway)
CREATE POLICY "Anyone can view files" ON public.files
    FOR SELECT USING (true);

-- Allow service role to manage all files
CREATE POLICY "Service role can manage all files" ON public.files
    FOR ALL USING (auth.role() = 'service_role');

-- Allow anonymous users to upload files
CREATE POLICY "Anonymous users can upload files" ON public.files
    FOR INSERT WITH CHECK (auth.role() = 'anon');

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload files" ON public.files
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow anonymous users to update files
CREATE POLICY "Anonymous users can update files" ON public.files
    FOR UPDATE USING (auth.role() = 'anon' OR auth.role() = 'service_role');

-- Allow users to update their own files
CREATE POLICY "Users can update own files" ON public.files
    FOR UPDATE USING (
        auth.role() = 'authenticated' AND 
        (uploaded_by = auth.uid() OR auth.role() = 'service_role')
    );

-- Allow anonymous users to delete files
CREATE POLICY "Anonymous users can delete files" ON public.files
    FOR DELETE USING (auth.role() = 'anon' OR auth.role() = 'service_role');

-- Allow users to delete their own files
CREATE POLICY "Users can delete own files" ON public.files
    FOR DELETE USING (
        auth.role() = 'authenticated' AND 
        (uploaded_by = auth.uid() OR auth.role() = 'service_role')
    );

-- RLS Policies for images table
-- Allow anyone to view images
CREATE POLICY "Anyone can view images" ON public.images
    FOR SELECT USING (true);

-- Allow service role to manage all images
CREATE POLICY "Service role can manage all images" ON public.images
    FOR ALL USING (auth.role() = 'service_role');

-- Allow anonymous users to upload images
CREATE POLICY "Anonymous users can upload images" ON public.images
    FOR INSERT WITH CHECK (auth.role() = 'anon');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images" ON public.images
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow anonymous users to update images
CREATE POLICY "Anonymous users can update images" ON public.images
    FOR UPDATE USING (auth.role() = 'anon' OR auth.role() = 'service_role');

-- Allow users to update their own images
CREATE POLICY "Users can update own images" ON public.images
    FOR UPDATE USING (
        auth.role() = 'authenticated' AND 
        (uploaded_by = auth.uid() OR auth.role() = 'service_role')
    );

-- Allow anonymous users to delete images
CREATE POLICY "Anonymous users can delete images" ON public.images
    FOR DELETE USING (auth.role() = 'anon' OR auth.role() = 'service_role');

-- Allow users to delete their own images
CREATE POLICY "Users can delete own images" ON public.images
    FOR DELETE USING (
        auth.role() = 'authenticated' AND 
        (uploaded_by = auth.uid() OR auth.role() = 'service_role')
    );

-- RLS Policies for chat_logs table
-- Allow service role to manage chat logs
CREATE POLICY "Service role can manage chat logs" ON public.chat_logs
    FOR ALL USING (auth.role() = 'service_role');

-- Allow anonymous users to insert chat logs
CREATE POLICY "Anonymous users can insert chat logs" ON public.chat_logs
    FOR INSERT WITH CHECK (auth.role() = 'anon');

-- Allow authenticated users to insert chat logs
CREATE POLICY "Authenticated users can insert chat logs" ON public.chat_logs
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create storage bucket if not exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'make-55b791b3-portfolio-assets',
    'make-55b791b3-portfolio-assets',
    false,
    10485760, -- 10MB
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
) ON CONFLICT (id) DO NOTHING;

-- Storage Object Policies (Allow anonymous access for development)
-- Allow anonymous users to upload images
CREATE POLICY "Anonymous users can upload images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'make-55b791b3-portfolio-assets' AND
        auth.role() = 'anon'
    );

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'make-55b791b3-portfolio-assets' AND
        auth.role() = 'authenticated'
    );

-- Allow anyone to view images (they need signed URLs anyway)
CREATE POLICY "Anyone can view images" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'make-55b791b3-portfolio-assets'
    );

-- Allow anonymous users to update/replace their uploads
CREATE POLICY "Anonymous users can update images" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'make-55b791b3-portfolio-assets' AND
        auth.role() = 'anon'
    );

-- Allow users to update/replace their uploads
CREATE POLICY "Authenticated users can update images" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'make-55b791b3-portfolio-assets' AND
        auth.role() = 'authenticated'
    );

-- Allow anonymous users to delete their uploads
CREATE POLICY "Anonymous users can delete images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'make-55b791b3-portfolio-assets' AND
        auth.role() = 'anon'
    );

-- Allow users to delete their uploads
CREATE POLICY "Authenticated users can delete images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'make-55b791b3-portfolio-assets' AND
        auth.role() = 'authenticated'
    );

-- Allow service role to do everything on storage
CREATE POLICY "Service role can manage all storage objects" ON storage.objects
    FOR ALL USING (
        bucket_id = 'make-55b791b3-portfolio-assets' AND
        auth.role() = 'service_role'
    );

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_content_updated_at 
    BEFORE UPDATE ON public.content 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions for anonymous and authenticated users
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;

-- Grant storage permissions
GRANT ALL ON storage.objects TO anon, authenticated, service_role;
GRANT ALL ON storage.buckets TO anon, authenticated, service_role;

-- Additional storage bucket configuration
UPDATE storage.buckets 
SET 
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
WHERE id = 'make-55b791b3-portfolio-assets';

-- Create some sample content for development
INSERT INTO public.content (type, title, data, is_published) VALUES
(
    'home',
    'Home Content',
    '{
        "summary": "这是一个个人作品集网站，展示我的项目经历、个人兴趣和创作成果。",
        "education": [
            {
                "school": "清华大学",
                "major": "公共艺术与艺术传播", 
                "period": "2015–2018",
                "degree": "硕士"
            }
        ],
        "workExperience": [
            {
                "company": "字节跳动",
                "position": "前端开发工程师",
                "period": "2023.06至今",
                "description": "负责抖音创作者工具的前端开发，使用React、TypeScript等现代技术栈。"
            }
        ],
        "skills": ["React", "TypeScript", "Node.js", "Python", "UI/UX设计", "Three.js"]
    }',
    true
) ON CONFLICT (id) DO NOTHING;