-- Add genre subcategory support to platform charts ('overall' = the main Top 10)
ALTER TABLE public.platform_charts
    ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'overall';

-- Rebuild the uniqueness constraint to include category so genre charts
-- don't collide with the overall chart for the same platform/day/rank.
DO $$
DECLARE
    con_name TEXT;
BEGIN
    SELECT conname INTO con_name
    FROM pg_constraint
    WHERE conrelid = 'public.platform_charts'::regclass
      AND contype = 'u';
    IF con_name IS NOT NULL THEN
        EXECUTE format('ALTER TABLE public.platform_charts DROP CONSTRAINT %I', con_name);
    END IF;
END $$;

ALTER TABLE public.platform_charts
    ADD CONSTRAINT platform_charts_unique_entry
    UNIQUE (platform, chart_type, category, region, period, chart_date, rank, source);
