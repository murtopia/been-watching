import { redirect } from 'next/navigation'

// Registration is open - the waitlist is retired.
export default function WaitlistPage() {
  redirect('/auth?signup=true')
}
