-- Remove the unique constraint on (tmdb_id, media_type) to allow season-specific entries
-- This is necessary because we now track individual TV seasons with IDs like tv-{tmdb_id}-s{season_number}
-- Multiple seasons of the same show will have the same tmdb_id and media_type='tv'

ALTER TABLE public.media
DROP CONSTRAINT IF EXISTS media_tmdb_id_media_type_key;

-- The 'id' column is already the PRIMARY KEY and remains unique
-- Season-specific IDs like 'tv-110492-s1', 'tv-110492-s2' will be unique by ID
