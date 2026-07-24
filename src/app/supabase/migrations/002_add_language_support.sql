-- Add language support to the content table
-- This migration adds the language field and creates indexes for better performance

-- Add language column to content table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'content' 
        AND column_name = 'language'
    ) THEN
        ALTER TABLE content ADD COLUMN language TEXT NOT NULL DEFAULT 'zh';
        
        -- Add check constraint to ensure valid language codes
        ALTER TABLE content ADD CONSTRAINT content_language_check 
        CHECK (language IN ('zh', 'en'));
        
        -- Create index for efficient language-based queries
        CREATE INDEX idx_content_type_language_published 
        ON content(type, language, is_published);
        
        -- Create index for content queries with category
        CREATE INDEX idx_content_type_language_category_published 
        ON content(type, language, category, is_published);
        
        -- Create index for ordering by creation date within language
        CREATE INDEX idx_content_language_created_at 
        ON content(language, created_at DESC);
        
        RAISE NOTICE 'Language column and indexes added to content table';
    ELSE
        RAISE NOTICE 'Language column already exists in content table';
    END IF;
END $$;

-- Update existing content records to have language = 'zh' (Chinese) if they don't have a language set
UPDATE content 
SET language = 'zh' 
WHERE language IS NULL OR language = '';

-- Ensure the NOT NULL constraint is enforced
ALTER TABLE content ALTER COLUMN language SET NOT NULL;

-- Add helpful comments
COMMENT ON COLUMN content.language IS 'Language code for the content (zh for Chinese, en for English)';
COMMENT ON INDEX idx_content_type_language_published IS 'Efficient queries for content by type, language and publication status';
COMMENT ON INDEX idx_content_type_language_category_published IS 'Efficient queries for content by type, language, category and publication status';
COMMENT ON INDEX idx_content_language_created_at IS 'Efficient ordering of content by creation date within each language';

-- Create a view for easy language-specific content queries
CREATE OR REPLACE VIEW content_by_language AS
SELECT 
    id,
    type,
    category,
    title,
    data,
    language,
    is_published,
    created_at,
    updated_at,
    created_by,
    CASE 
        WHEN language = 'zh' THEN '中文'
        WHEN language = 'en' THEN 'English'
        ELSE language
    END as language_display
FROM content
WHERE is_published = true
ORDER BY language, type, created_at DESC;

COMMENT ON VIEW content_by_language IS 'View for easily querying published content by language with display names';

-- Create a function to get content by type and language
CREATE OR REPLACE FUNCTION get_content_by_type_and_language(
    content_type TEXT,
    content_language TEXT DEFAULT 'zh',
    content_category TEXT DEFAULT NULL
)
RETURNS TABLE (
    id TEXT,
    type TEXT,
    category TEXT,
    title TEXT,
    data JSONB,
    language TEXT,
    is_published BOOLEAN,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    created_by TEXT
) 
LANGUAGE plpgsql
AS $$
BEGIN
    IF content_category IS NULL THEN
        RETURN QUERY
        SELECT 
            c.id,
            c.type,
            c.category,
            c.title,
            c.data,
            c.language,
            c.is_published,
            c.created_at,
            c.updated_at,
            c.created_by
        FROM content c
        WHERE c.type = content_type 
        AND c.language = content_language 
        AND c.is_published = true
        ORDER BY c.created_at DESC;
    ELSE
        RETURN QUERY
        SELECT 
            c.id,
            c.type,
            c.category,
            c.title,
            c.data,
            c.language,
            c.is_published,
            c.created_at,
            c.updated_at,
            c.created_by
        FROM content c
        WHERE c.type = content_type 
        AND c.language = content_language 
        AND c.category = content_category
        AND c.is_published = true
        ORDER BY c.created_at DESC;
    END IF;
END;
$$;

COMMENT ON FUNCTION get_content_by_type_and_language IS 'Function to efficiently retrieve content by type and language, optionally filtered by category';

-- Create a function to check if content exists in multiple languages
CREATE OR REPLACE FUNCTION get_content_language_status(content_type TEXT, content_category TEXT DEFAULT NULL)
RETURNS TABLE (
    language TEXT,
    language_display TEXT,
    content_count BIGINT,
    latest_update TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF content_category IS NULL THEN
        RETURN QUERY
        SELECT 
            c.language,
            CASE 
                WHEN c.language = 'zh' THEN '中文'
                WHEN c.language = 'en' THEN 'English'
                ELSE c.language
            END as language_display,
            COUNT(*) as content_count,
            MAX(c.updated_at) as latest_update
        FROM content c
        WHERE c.type = content_type 
        AND c.is_published = true
        GROUP BY c.language
        ORDER BY c.language;
    ELSE
        RETURN QUERY
        SELECT 
            c.language,
            CASE 
                WHEN c.language = 'zh' THEN '中文'
                WHEN c.language = 'en' THEN 'English'
                ELSE c.language
            END as language_display,
            COUNT(*) as content_count,
            MAX(c.updated_at) as latest_update
        FROM content c
        WHERE c.type = content_type 
        AND c.category = content_category
        AND c.is_published = true
        GROUP BY c.language
        ORDER BY c.language;
    END IF;
END;
$$;

COMMENT ON FUNCTION get_content_language_status IS 'Function to check content availability across languages for a given type and optional category';

-- Create Row Level Security (RLS) policies if they don't exist
-- This ensures proper access control while allowing language-based filtering

-- Enable RLS on content table if not already enabled
ALTER TABLE content ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "content_read_policy" ON content;
DROP POLICY IF EXISTS "content_write_policy" ON content;

-- Create read policy for content (allow all users to read published content)
CREATE POLICY "content_read_policy" ON content
    FOR SELECT
    USING (is_published = true OR auth.uid() IS NOT NULL);

-- Create write policy for content (allow authenticated users to create/update/delete)
CREATE POLICY "content_write_policy" ON content
    FOR ALL
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- Grant necessary permissions
GRANT SELECT ON content_by_language TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_content_by_type_and_language TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_content_language_status TO anon, authenticated;

-- Create a trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_content_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_update_content_updated_at ON content;

-- Create the trigger
CREATE TRIGGER trigger_update_content_updated_at
    BEFORE UPDATE ON content
    FOR EACH ROW
    EXECUTE FUNCTION update_content_updated_at();

COMMENT ON TRIGGER trigger_update_content_updated_at ON content IS 'Automatically update updated_at timestamp when content is modified';

-- Final verification and summary
DO $$
DECLARE
    zh_count INTEGER;
    en_count INTEGER;
    total_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO zh_count FROM content WHERE language = 'zh';
    SELECT COUNT(*) INTO en_count FROM content WHERE language = 'en';
    SELECT COUNT(*) INTO total_count FROM content;
    
    RAISE NOTICE '=== Language Support Migration Complete ===';
    RAISE NOTICE 'Total content records: %', total_count;
    RAISE NOTICE 'Chinese (zh) records: %', zh_count;
    RAISE NOTICE 'English (en) records: %', en_count;
    RAISE NOTICE 'Database is ready for multilingual content management';
END $$;