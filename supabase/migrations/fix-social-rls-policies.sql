-- Fix social RLS policies (public beta hardening)
--
-- 1. activities: the deployed SELECT policy compared profiles.id to
--    profiles.user_id (an unqualified reference that bound to the inner
--    table), making the privacy check effectively always-true. Recreate it
--    with an explicit reference to activities.user_id so private accounts'
--    activities are only visible to themselves and accepted followers.
--
-- 2. follows: consolidate duplicate policies. Accepted follows stay publicly
--    readable (powers friends-of-friends suggestions and mutual badges);
--    pending/blocked rows are only visible to the two parties involved.
--    DELETE now also allows the followed user, so denying a follow request
--    or removing a follower works (previously blocked by follower-only RLS).

-- === activities ===

DROP POLICY IF EXISTS "Activities are viewable by everyone" ON public.activities;

CREATE POLICY "Activities are viewable by everyone" ON public.activities
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = activities.user_id
            AND (
                p.is_private = false
                OR p.id = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM public.follows f
                    WHERE f.follower_id = auth.uid()
                    AND f.following_id = p.id
                    AND f.status = 'accepted'
                )
            )
        )
    );

-- === follows ===

DROP POLICY IF EXISTS "Anyone can view follows" ON public.follows;
DROP POLICY IF EXISTS "Users can view follows" ON public.follows;
DROP POLICY IF EXISTS "Users can follow others" ON public.follows;
DROP POLICY IF EXISTS "Users can insert follows" ON public.follows;
DROP POLICY IF EXISTS "Users can delete own follows" ON public.follows;
DROP POLICY IF EXISTS "Users can unfollow" ON public.follows;
DROP POLICY IF EXISTS "Users can update follows they're involved in" ON public.follows;

CREATE POLICY "Accepted follows are viewable, pending only by parties" ON public.follows
    FOR SELECT USING (
        status = 'accepted'
        OR follower_id = auth.uid()
        OR following_id = auth.uid()
    );

CREATE POLICY "Users can insert own follows" ON public.follows
    FOR INSERT WITH CHECK (follower_id = auth.uid());

CREATE POLICY "Parties can delete follows" ON public.follows
    FOR DELETE USING (
        follower_id = auth.uid()
        OR following_id = auth.uid()
    );

CREATE POLICY "Parties can update follows" ON public.follows
    FOR UPDATE USING (
        follower_id = auth.uid()
        OR following_id = auth.uid()
    );

-- === retire the legacy all-users feed toggle ===

DELETE FROM public.admin_settings WHERE setting_key = 'feed_show_all_users';

-- === allow follow_request notifications ===
-- The original CHECK constraint omitted 'follow_request', so follow-request
-- notifications for private accounts were silently rejected on insert.

ALTER TABLE public.notifications DROP CONSTRAINT notifications_type_check;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_type_check
    CHECK (type = ANY (ARRAY[
        'follow'::text,
        'follow_request'::text,
        'like_activity'::text,
        'comment'::text,
        'mentioned'::text,
        'note_liked'::text,
        'note_commented'::text,
        'invite_earned'::text,
        'welcome'::text,
        'feature_release'::text,
        'announcement'::text,
        'maintenance'::text
    ]));
