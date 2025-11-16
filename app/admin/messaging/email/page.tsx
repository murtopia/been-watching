import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { checkAdminAccess } from '@/utils/admin/permissions'
import EmailDashboard from './EmailDashboard'

export default async function AdminEmailPage() {
  // Check if user has admin access
  const { hasAccess } = await checkAdminAccess()

  if (!hasAccess) {
    redirect('/auth')
  }

  const supabase = await createClient()

  // Get email settings
  const { data: settings } = await supabase
    .from('admin_email_settings')
    .select('*')
    .eq('id', 1)
    .single()

  // Get recent campaigns
  const { data: campaigns } = await supabase
    .from('email_campaigns')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10)

  return <EmailDashboard settings={settings} campaigns={campaigns || []} />
}
