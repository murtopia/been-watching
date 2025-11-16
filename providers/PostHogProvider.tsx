'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Check for user consent
    const hasConsent = localStorage.getItem('analytics-consent')

    // Only initialize if user has consented or hasn't been asked yet
    if (hasConsent !== 'false' && typeof window !== 'undefined') {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
        person_profiles: 'identified_only', // Only create profiles for logged-in users
        capture_pageview: false, // We'll handle this manually for better control
        capture_pageleave: true,
        autocapture: false, // Explicit tracking only

        // Privacy-first settings
        mask_all_text: false, // We want to see what users interact with
        mask_all_element_attributes: false,

        // Session recording settings (optional - can enable later)
        session_recording: {
          maskAllInputs: true, // Always mask input fields
          maskTextSelector: '[data-sensitive]', // Mask elements with this attribute
        },

        // Performance
        persistence: 'localStorage+cookie',

        // Disable if no consent
        opt_out_capturing_by_default: hasConsent === null, // Opt out until consent given
      })

      // If consent was previously given, ensure we're opted in
      if (hasConsent === 'true') {
        posthog.opt_in_capturing()
      }
    }
  }, [])

  return <PHProvider client={posthog}>{children}</PHProvider>
}

// Hook to track page views
export function PostHogPageView() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (pathname && posthog) {
      let url = window.origin + pathname
      if (searchParams && searchParams.toString()) {
        url = url + `?${searchParams.toString()}`
      }

      posthog.capture('$pageview', {
        $current_url: url,
      })
    }
  }, [pathname, searchParams])

  return null
}
