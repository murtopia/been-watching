import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 0.1,

  // Note: if you want to override the automatic release value, do not set a
  // `release` value here - use the environment variable `SENTRY_RELEASE`, so
  // that it will also get attached to your source maps

  enabled: process.env.NODE_ENV === 'production',

  // Filter out known non-breaking errors
  beforeSend(event, hint) {
    const error = hint.originalException as Error;

    // Ignore Supabase "Cannot coerce to single JSON object" errors
    if (error?.message?.includes('Cannot coerce the result to a single JSON object')) {
      return null;
    }

    return event;
  },
});
