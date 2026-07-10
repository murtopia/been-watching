# Supabase Auth email templates

Branded, friendly versions of the Supabase Auth transactional emails.
Supabase auth emails are configured in the dashboard, not deployed with the
app, so these files are the source of truth — paste them into the dashboard
whenever they change.

**Status: installed** (Jul 10, 2026). All four templates are live in the
dashboard, custom SMTP is enabled via Resend with sender
`Been Watching <hello@boxoffice.beenwatching.com>`, and the auth email rate
limit is raised to 100/hour.

## How to install

Dashboard → project **been-watching** → **Authentication → Emails** (Email Templates):

| Dashboard template  | File                  | Suggested subject                              |
| ------------------- | --------------------- | ---------------------------------------------- |
| Confirm sign up     | `confirm-signup.html` | Confirm your email for Been Watching 🍿        |
| Reset password      | `reset-password.html` | Reset your Been Watching password              |
| Magic link          | `magic-link.html`     | Your Been Watching sign-in link                |
| Change email address| `change-email.html`   | Confirm your new email for Been Watching       |

For each template: paste the file contents into **Message body (HTML)** and set
the subject line. The `{{ .ConfirmationURL }}` / `{{ .Email }}` / `{{ .NewEmail }}`
placeholders are Supabase template variables and must be kept as-is.

## Custom SMTP (recommended before marketing push)

By default these emails are sent from `noreply@mail.app.supabase.io` with a very
low hourly rate limit that will drop signups during traffic spikes. We already
have Resend configured for app emails, so point Supabase at it:

Dashboard → **Project Settings → Authentication → SMTP Settings**:

- Host: `smtp.resend.com`
- Port: `465`
- Username: `resend`
- Password: the Resend API key (same one as `RESEND_API_KEY`)
- Sender email: `hello@boxoffice.beenwatching.com` (already a verified Resend domain)
- Sender name: `Been Watching`

After enabling custom SMTP, raise the rate limit under
**Authentication → Rate Limits** (e.g. 100+ emails/hour).
