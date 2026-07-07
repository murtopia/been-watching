-- Security advisor fixes (2026-07-07)
-- 1. Enable RLS on public.media (critical: policies existed but RLS was off)
-- 2. Drop invite-era SECURITY DEFINER views and functions (invite system retired)
-- 3. Revoke anon EXECUTE on surviving SECURITY DEFINER functions
-- 4. Pin search_path on surviving flagged functions
-- 5. Tighten leftover invite-era policies and avatars bucket listing

-- ============================================================
-- 1. media: enable RLS + allow authenticated upserts
-- ============================================================

ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

-- Client code upserts media rows (shared metadata cache), so authenticated
-- users need UPDATE in addition to the existing INSERT/SELECT policies.
DROP POLICY IF EXISTS "Authenticated users can update media" ON public.media;
CREATE POLICY "Authenticated users can update media"
    ON public.media FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);
-- No DELETE policy: client deletes stay blocked.

-- ============================================================
-- 2. Drop invite-era SECURITY DEFINER views
-- ============================================================

DROP VIEW IF EXISTS public.admin_user_list;
DROP VIEW IF EXISTS public.user_invite_history;
DROP VIEW IF EXISTS public.admin_master_code_stats;

-- ============================================================
-- 3. Drop invite-era functions (and dependent triggers)
-- ============================================================

DROP TRIGGER IF EXISTS set_waitlist_position ON public.waitlist;

DROP FUNCTION IF EXISTS public.award_profile_completion_invite(uuid);
DROP FUNCTION IF EXISTS public.check_profile_completion(uuid);
DROP FUNCTION IF EXISTS public.check_watchlist_invite_milestone(uuid);
DROP FUNCTION IF EXISTS public.trigger_check_watchlist_milestone();
DROP FUNCTION IF EXISTS public.cleanup_expired_invite_tokens();
DROP FUNCTION IF EXISTS public.create_user_invite_token(uuid);
DROP FUNCTION IF EXISTS public.redeem_invite(text, uuid);
DROP FUNCTION IF EXISTS public.redeem_invite_token(text, uuid);
DROP FUNCTION IF EXISTS public.revoke_user_invite_token(uuid);
DROP FUNCTION IF EXISTS public.validate_invite_token(text);
DROP FUNCTION IF EXISTS public.get_invite_progress(uuid);
DROP FUNCTION IF EXISTS public.use_master_code(text, uuid);
DROP FUNCTION IF EXISTS public.is_master_code_valid(text);
DROP FUNCTION IF EXISTS public.create_bwalpha_code();
DROP FUNCTION IF EXISTS public.deactivate_master_code(text);
DROP FUNCTION IF EXISTS public.assign_waitlist_position();
DROP FUNCTION IF EXISTS public.generate_random_code(integer);
DROP FUNCTION IF EXISTS public.generate_random_token(integer);

-- ============================================================
-- 4. Surviving SECURITY DEFINER functions: no anon EXECUTE
-- ============================================================
-- EXECUTE was granted via PUBLIC (Postgres default), so revoke from PUBLIC
-- and re-grant only to the roles that need each function.

REVOKE EXECUTE ON FUNCTION public.grant_admin_access(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.grant_admin_access(uuid) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.revoke_admin_access(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.revoke_admin_access(uuid) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.is_current_user_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_current_user_admin() TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.send_global_announcement(text, text, text, text, text, text, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.send_global_announcement(text, text, text, text, text, text, text, text) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.get_announcement_stats() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_announcement_stats() TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.mark_announcement_read(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.mark_announcement_read(uuid) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.track_announcement_click(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.track_announcement_click(uuid) TO authenticated, service_role;

-- Trigger functions: nothing should call these via the API at all
REVOKE EXECUTE ON FUNCTION public.update_last_active() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- ============================================================
-- 5. Pin search_path on surviving flagged functions
-- ============================================================

ALTER FUNCTION public.grant_admin_access(uuid) SET search_path = public, pg_temp;
ALTER FUNCTION public.revoke_admin_access(uuid) SET search_path = public, pg_temp;
ALTER FUNCTION public.is_current_user_admin() SET search_path = public, pg_temp;
ALTER FUNCTION public.send_global_announcement(text, text, text, text, text, text, text, text) SET search_path = public, pg_temp;
ALTER FUNCTION public.get_announcement_stats() SET search_path = public, pg_temp;
ALTER FUNCTION public.mark_announcement_read(uuid) SET search_path = public, pg_temp;
ALTER FUNCTION public.track_announcement_click(uuid) SET search_path = public, pg_temp;
ALTER FUNCTION public.update_last_active() SET search_path = public, pg_temp;
ALTER FUNCTION public.handle_rating_activity() SET search_path = public, pg_temp;
ALTER FUNCTION public.handle_watch_status_activity() SET search_path = public, pg_temp;
ALTER FUNCTION public.update_show_comments_updated_at() SET search_path = public, pg_temp;

-- ============================================================
-- 6. Tighten leftover invite-era policies + avatars listing
-- ============================================================

-- Nothing writes master codes or joins the waitlist anymore.
DROP POLICY IF EXISTS "Allow RPC to update master codes" ON public.master_codes;
DROP POLICY IF EXISTS "Anyone can join waitlist" ON public.waitlist;

-- Public buckets serve object URLs without a SELECT policy; this only
-- removes the ability to enumerate every file in the bucket.
DROP POLICY IF EXISTS "Public avatars are viewable by everyone" ON storage.objects;

-- Users can still read their own avatar objects (upload upsert/remove flows);
-- everyone else uses the public object URL, which bypasses RLS.
DROP POLICY IF EXISTS "Users can view their own avatar" ON storage.objects;
CREATE POLICY "Users can view their own avatar"
    ON storage.objects FOR SELECT
    TO authenticated
    USING ((bucket_id = 'avatars'::text) AND ((auth.uid())::text = (storage.foldername(name))[1]));
