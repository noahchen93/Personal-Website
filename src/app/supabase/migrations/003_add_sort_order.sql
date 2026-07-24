-- Add sort_order column to content table for custom ordering
ALTER TABLE public.content ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- Create index for sort_order
CREATE INDEX IF NOT EXISTS idx_content_sort_order ON public.content(sort_order, created_at);

-- Update existing projects with initial sort order based on creation time
-- Earlier created projects get lower sort_order values (appear first)
WITH ranked_projects AS (
    SELECT 
        id,
        ROW_NUMBER() OVER (
            PARTITION BY type, language 
            ORDER BY created_at ASC
        ) as row_num
    FROM public.content 
    WHERE type = 'projects'
)
UPDATE public.content 
SET sort_order = ranked_projects.row_num * 10
FROM ranked_projects 
WHERE public.content.id = ranked_projects.id;

-- Create a function to get the next available sort order for a content type
CREATE OR REPLACE FUNCTION get_next_sort_order(content_type TEXT, content_language TEXT DEFAULT NULL)
RETURNS INTEGER AS $$
DECLARE
    max_order INTEGER;
BEGIN
    SELECT COALESCE(MAX(sort_order), 0) + 10 
    INTO max_order
    FROM public.content 
    WHERE type = content_type 
    AND (content_language IS NULL OR language = content_language);
    
    RETURN max_order;
END;
$$ LANGUAGE plpgsql;

-- Create a function to reorder content items
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
    -- Update sort_order for each item in the provided order
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

-- Grant permissions for the new functions
GRANT EXECUTE ON FUNCTION get_next_sort_order TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION reorder_content_items TO anon, authenticated, service_role;