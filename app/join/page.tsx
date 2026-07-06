import { redirect } from 'next/navigation'

// Registration is open - invite links are no longer required.
export default function JoinPage() {
  redirect('/auth?signup=true')
}
