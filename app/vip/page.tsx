import { redirect } from 'next/navigation'

// Registration is open - VIP codes are no longer required.
export default function VipPage() {
  redirect('/auth?signup=true')
}
