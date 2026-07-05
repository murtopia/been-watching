-- Platform popularity charts (Netflix Tudum, FlixPatrol, TMDB per-platform)
-- Powers "Top on Netflix this week" feed cards, a future Charts page, and podcast prep exports.

CREATE TABLE IF NOT EXISTS public.platform_charts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    platform TEXT NOT NULL,              -- 'netflix', 'max', 'disney', 'prime', 'paramount', 'hulu', 'apple', 'peacock'
    chart_type TEXT NOT NULL CHECK (chart_type IN ('tv', 'movie')),
    region TEXT NOT NULL DEFAULT 'US',
    period TEXT NOT NULL DEFAULT 'week' CHECK (period IN ('day', 'week')),
    chart_date DATE NOT NULL,            -- week start (weekly) or day (daily)
    rank INTEGER NOT NULL,
    title TEXT NOT NULL,
    metric_label TEXT,                   -- e.g. 'hours viewed', 'views', 'popularity'
    metric_value BIGINT,
    is_new BOOLEAN DEFAULT false,        -- new entry vs previous period
    weeks_on_chart INTEGER,
    tmdb_id INTEGER,
    media_type TEXT CHECK (media_type IN ('tv', 'movie')),
    poster_path TEXT,
    source TEXT NOT NULL,                -- 'netflix_tudum' | 'flixpatrol' | 'tmdb'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(platform, chart_type, region, period, chart_date, rank, source)
);

CREATE INDEX IF NOT EXISTS idx_platform_charts_lookup
    ON public.platform_charts (platform, chart_type, region, source, chart_date DESC);

ALTER TABLE public.platform_charts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Charts are readable by everyone" ON public.platform_charts;
CREATE POLICY "Charts are readable by everyone"
    ON public.platform_charts FOR SELECT
    USING (true);

-- Generic key/value cache used by chart ingestion (FlixPatrol ID lookups, TMDB title matches)
CREATE TABLE IF NOT EXISTS public.chart_ingest_cache (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.chart_ingest_cache ENABLE ROW LEVEL SECURITY;
-- No public policies: service role only.
