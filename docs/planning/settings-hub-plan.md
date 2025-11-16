# 📋 **Been Watching - User Settings Hub Design Document**
**Version 2.0 - Approved for Implementation**

---

## 📧📱 **Service Providers Recommendation**

### **Email Service: Resend** ⭐ **RECOMMENDED** ✅ **CONFIRMED**
**Why Resend (vs Loops):**
- **Full control with React Email** - Build custom, personalized 1:1 emails using React components
- **Perfect for customized content** - Each user gets personalized friend activity, not just templates
- **Developer-first** - Built for modern SaaS apps, Next.js/React optimized
- **Pay for what you use** - $20/month for 50k emails vs Loops $49/month for unlimited
- **Both transactional + marketing** - Password resets AND weekly recaps in one system
- **Modern DX** - Clean API, excellent docs, fast integration
- **Good deliverability** - Rapidly improving inbox placement

**Pricing tiers:**
- **Free:** 3,000 emails/month (perfect for testing/development)
- **Pro:** $20/month for 50,000 emails
- **Scale:** $80/month for 300,000 emails

**Why NOT Loops:**
- Loops is built for simple transactional/campaign emails (templates only)
- Been Watching needs **personalized 1:1 emails** (friend-specific activity)
- React Email gives us unlimited customization for future features
- 59% cheaper at our scale ($20 vs $49/month)

**Alternatives considered:**
- **Loops** - $49/month, great for campaigns but limited customization
- **Postmark** - $15/month for 10k emails (better deliverability but less flexibility)

### **SMS Service: Plivo** ⭐ **RECOMMENDED** ✅ **CONFIRMED**
**Why Plivo (vs Surge):**
- **50% cheaper** - $0.0055/SMS vs Surge's $0.0129/SMS (with carrier fees)
- **True pay-as-you-go** - No $20/month minimum like Surge
- **Better for low volume** - Perfect for occasional announcements
- **Built-in Verify API** - Purpose-built for 2FA/OTP verification
- **Fraud Shield** - Prevents SMS pumping attacks (important for invite-only platform)
- **Proven & reliable** - 14+ years, 220+ countries
- **Cheaper phone numbers** - $0.50/month vs Surge's $3/month

**Pricing:**
- **Outbound SMS:** $0.0045-$0.0055 per message
- **Inbound SMS:** $0-$0.0055 per message
- **Phone numbers:** $0.50/month (long code), $1/month (toll-free)
- **No monthly minimums** - Only pay for what you use

**Cost Examples:**
- 500 SMS/month: **~$3** (vs Surge $20 minimum)
- 5,000 SMS/month: **~$28** (vs Surge $100 plan)
- 1,000 users: **~$75/month** estimated

**Trade-off:** Carrier registration takes 1-2 weeks (vs Surge's 72 hours), but we can start the process during Phase 2 implementation.

**Alternatives considered:**
- **Surge** - Faster registration (72hr) but 2x price + $20/month minimum
- **Twilio** - $0.0079/SMS (~44% more expensive than Plivo)
- **Telnyx** - Cheaper ($0.0025/SMS) but less proven

---

## 🎯 **Settings Architecture**

### **Route Structure**
```
/profile                      → Public-facing profile (stays same)
/profile/settings             → Settings hub (new)
  ├── /account                → Email, username, password, delete
  ├── /contact                → Phone number, email preferences
  ├── /notifications          → Email, SMS, push settings
  ├── /privacy                → Private account, data controls, 2FA
  └── /preferences            → Theme, appearance
```

---

## 📱 **1. Settings Hub** (`/profile/settings`)

**Layout: Card-based navigation**

```
┌─────────────────────────────────────┐
│ ⬅️  Settings                        │
├─────────────────────────────────────┤
│ 👤  ACCOUNT                          │
│ Email, username, password            │
│                                   →  │
├─────────────────────────────────────┤
│ 📱  CONTACT INFORMATION              │
│ Phone number, verification           │
│                                   →  │
├─────────────────────────────────────┤
│ 🔔  NOTIFICATIONS                    │
│ Email, SMS, push preferences         │
│                                   →  │
├─────────────────────────────────────┤
│ 🔒  PRIVACY & SECURITY               │
│ Private account, 2FA, sessions       │
│                                   →  │
├─────────────────────────────────────┤
│ 🎨  APPEARANCE                       │
│ Theme, display options               │
│                                   →  │
├─────────────────────────────────────┤
│ ℹ️  HELP & SUPPORT                   │
│ FAQ, contact us, about               │
│                                   →  │
├─────────────────────────────────────┤
│                                      │
│ [ 🚪 Log Out ]                       │
│                                      │
└─────────────────────────────────────┘
```

---

## 📧 **2. Notifications** (`/profile/settings/notifications`)

```
┌─────────────────────────────────────┐
│ ⬅️  Notifications                    │
├─────────────────────────────────────┤
│ 📧 EMAIL NOTIFICATIONS                │
│ ┌───────────────────────────────┐   │
│ │ [✓] Weekly Recap               │   │
│ │     Every Friday morning       │   │
│ │     • Friend activity          │   │
│ │     • New followers            │   │
│ │     • Ratings from friends     │   │
│ │     • Trending shows           │   │
│ │                                │   │
│ │ [✓] Monthly Recap              │   │
│ │     First day of each month    │   │
│ │     • Your watch history       │   │
│ │     • Stats & achievements     │   │
│ │     • Platform announcements   │   │
│ │     • New features             │   │
│ └───────────────────────────────┘   │
├─────────────────────────────────────┤
│ 📱 SMS NOTIFICATIONS (Optional)      │
│ ┌───────────────────────────────┐   │
│ │ [!] Add phone number to enable │   │
│ │     [ + Add Phone → ]          │   │
│ │                                │   │
│ │ After adding phone:            │   │
│ │ [ ] Urgent Announcements       │   │
│ │     Platform updates & alerts  │   │
│ │                                │   │
│ │ [ ] Weekly Highlights          │   │
│ │     Your week in shows         │   │
│ │                                │   │
│ │ ⚠️  TCPA Notice                 │   │
│ │ Message & data rates may apply.│   │
│ │ Text STOP to opt out anytime.  │   │
│ │ Max 4-6 messages per month.    │   │
│ └───────────────────────────────┘   │
├─────────────────────────────────────┤
│ 🔔 PUSH NOTIFICATIONS (In-App)       │
│ ┌───────────────────────────────┐   │
│ │ [✓] Friend Activity            │   │
│ │     New followers, ratings     │   │
│ │                                │   │
│ │ [✓] Announcements              │   │
│ │     New features & updates     │   │
│ │                                │   │
│ │ [✓] Recommendations            │   │
│ │     Personalized suggestions   │   │
│ └───────────────────────────────┘   │
│                                      │
│ [ Save All Settings ]                │
└─────────────────────────────────────┘
```

**Key Details:**
- ✅ **Weekly Recap:** Every **Friday morning**
- ✅ **Monthly Recap:** First day of each month
- ✅ **SMS is optional** and requires phone number first
- ✅ **Clear frequency:** "Max 4-6 messages per month"

---

## 📱 **3. Contact Information** (`/profile/settings/contact`)

```
┌─────────────────────────────────────┐
│ ⬅️  Contact Information              │
├─────────────────────────────────────┤
│ EMAIL ADDRESS                        │
│ [ nick@example.com        ] ✓       │
│ Verified • Used for login            │
│                                      │
│ [Change Email →]                     │
├─────────────────────────────────────┤
│ PHONE NUMBER (Optional)              │
│ [ +1 (___) ___-____      ]  Add      │
│                                      │
│ ℹ️  Why add a phone number?          │
│ • Faster account recovery            │
│ • Two-factor authentication          │
│ • SMS notifications (opt-in)         │
│                                      │
│ 🔒 We'll never share your number     │
└─────────────────────────────────────┘
```

---

## 🔒 **4. Privacy & Security** (`/profile/settings/privacy`)

```
┌─────────────────────────────────────┐
│ ⬅️  Privacy & Security               │
├─────────────────────────────────────┤
│ PROFILE VISIBILITY                   │
│ [ Toggle ] Private Account           │
│ Only approved followers can see      │
│ your activity and ratings            │
├─────────────────────────────────────┤
│ TWO-FACTOR AUTHENTICATION            │
│ [ ] Disabled  [Enable 2FA →]         │
│ Requires phone number                │
│ Add extra security to your account   │
├─────────────────────────────────────┤
│ ACTIVE SESSIONS                      │
│ 🖥️  MacBook Pro • San Francisco     │
│ Active now                           │
│                                      │
│ 📱  iPhone 15 • San Francisco        │
│ 2 hours ago                          │
│                                      │
│ [ Log Out All Other Sessions ]      │
├─────────────────────────────────────┤
│ DATA & PRIVACY                       │
│ Download My Data →                   │
│ Get a copy of your data              │
│                                      │
│ Privacy Policy →                     │
│ Terms of Service →                   │
└─────────────────────────────────────┘
```

---

## 🎨 **5. Appearance** (`/profile/settings/preferences`)

```
┌─────────────────────────────────────┐
│ ⬅️  Appearance                       │
├─────────────────────────────────────┤
│ THEME                                │
│ ( ) Light                            │
│ (•) Dark                             │
│ ( ) Auto (system preference)         │
│                                      │
│ [Live preview of theme above]        │
├─────────────────────────────────────┤
│ DISPLAY OPTIONS                      │
│ [ ] Show spoilers in descriptions    │
│ [✓] Auto-play trailers               │
├─────────────────────────────────────┤
│ ADVANCED                             │
│ Clear cache →                        │
│ Free up 12.4 MB                      │
│                                      │
│ Reset all settings →                 │
│ Restore default preferences          │
└─────────────────────────────────────┘
```

---

## 👤 **6. Account Settings** (`/profile/settings/account`)

```
┌─────────────────────────────────────┐
│ ⬅️  Account                          │
├─────────────────────────────────────┤
│ EMAIL ADDRESS                        │
│ [ nick@example.com        ] ✓       │
│ Verified • Used for login            │
├─────────────────────────────────────┤
│ USERNAME                             │
│ [ nickmurto                ]         │
│ beenwatching.com/nickmurto           │
├─────────────────────────────────────┤
│ DISPLAY NAME                         │
│ [ Nick Murto                ]        │
├─────────────────────────────────────┤
│ BIO                                  │
│ [ What have you been      ]         │
│ [ watching?               ]         │
├─────────────────────────────────────┤
│ PASSWORD                             │
│ [ ••••••••••• ] Change Password →    │
│ Last changed 30 days ago             │
├─────────────────────────────────────┤
│ ⚠️  DANGER ZONE                      │
│ Delete Account →                     │
│ This action cannot be undone         │
└─────────────────────────────────────┘
```

---

## 💾 **Database Schema**

```sql
-- Add to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS
  -- Contact & Verification
  phone_number TEXT,
  phone_verified BOOLEAN DEFAULT FALSE,
  phone_verified_at TIMESTAMP,

  -- Email Notification Preferences
  notify_email_weekly_recap BOOLEAN DEFAULT TRUE,
  notify_email_monthly_recap BOOLEAN DEFAULT TRUE,

  -- SMS Notification Preferences
  notify_sms_announcements BOOLEAN DEFAULT FALSE,
  notify_sms_weekly_highlights BOOLEAN DEFAULT FALSE,
  sms_opt_in BOOLEAN DEFAULT FALSE,
  sms_opt_in_date TIMESTAMP,
  sms_opt_out_date TIMESTAMP,

  -- Push Notification Preferences
  notify_push_friend_activity BOOLEAN DEFAULT TRUE,
  notify_push_announcements BOOLEAN DEFAULT TRUE,
  notify_push_recommendations BOOLEAN DEFAULT TRUE,

  -- Security
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  two_factor_method TEXT, -- 'sms' | 'totp'

  -- Preferences
  show_spoilers BOOLEAN DEFAULT FALSE,
  auto_play_trailers BOOLEAN DEFAULT TRUE;

-- Create sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  device_name TEXT,
  device_type TEXT, -- 'mobile' | 'desktop' | 'tablet'
  ip_address TEXT,
  location TEXT,
  user_agent TEXT,
  last_active TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_user_sessions_user_id (user_id),
  INDEX idx_user_sessions_last_active (last_active)
);
```

---

## 📋 **Implementation Phases**

### **Phase 1: Foundation** ✅ **COMPLETED**
- [x] Create `/profile/settings` hub page with navigation
- [x] Build Account settings page (email, username, password, bio)
- [x] Move privacy toggle from profile to settings
- [x] Add logout button to settings hub
- [x] Update profile page to link to settings (gear icon)
- [x] Remove Edit button from profile (now redundant with settings)

### **Phase 2: Contact & Notifications** ✅ **COMPLETED**
- [x] Build Contact Information page
- [x] Add phone number field with verification flow (placeholder for SMS verification)
- [x] Build Notifications page (email, SMS, push toggles)
- [x] Create database migration for all notification/contact columns
- [x] Email preference save functionality (weekly/monthly recaps, announcements)
- [x] SMS opt-in with TCPA compliance tracking
- [ ] Integrate Resend for email service (Phase 3)
- [ ] Build phone verification SMS flow (Phase 3/4)

### **Phase 3: Email Campaigns** ⬅️ **READY TO START**
- [x] Resend API key added to `.env.local` ✅
- [ ] Install Resend SDK (`npm install resend`)
- [ ] Install React Email (`npm install react-email @react-email/components`)
- [ ] Create `/api/email/send` endpoint
- [ ] Design Weekly Recap email template (Friday delivery)
- [ ] Design Monthly Recap email template
- [ ] Build scheduled email jobs (cron/queue)
- [ ] Test email deliverability

**API Key:** Stored securely in `.env.local` as `RESEND_API_KEY`

### **Phase 4: SMS (After Email Success)**
- [ ] Integrate Plivo for SMS service
- [ ] Build TCPA-compliant SMS opt-in flow
- [ ] Create SMS templates
- [ ] Build SMS notification system
- [ ] Test SMS delivery

### **Phase 5: Security & Polish**
- [ ] Build 2FA setup flow (SMS-based)
- [ ] Add active sessions display
- [ ] Add "Download My Data" functionality
- [ ] Add Help & Support section
- [ ] User testing & refinements

---

## 💰 **Estimated Monthly Costs**

**Email (Resend):**
- 0-3,000 emails: **FREE**
- 3,000-50,000 emails: **$20/month**
- Estimated for 100 users: ~2,000 emails/month = **$0**
- Estimated for 1,000 users: ~20,000 emails/month = **$20**

**SMS (Plivo):** ✅ **Confirmed over Surge**
- Pay-as-you-go: **$0.0045-$0.0055 per SMS**
- Phone number: **$0.50-$1/month**
- Estimated for 100 users (50% opt-in, 2 SMS/month): **~$6/month**
- Estimated for 500 users (50% opt-in, 2 SMS/month): **~$28/month**
- Estimated for 1,000 users (50% opt-in, 2 SMS/month): **~$56/month**

**Why Plivo over Surge:**
- 50% cheaper per SMS ($0.0055 vs $0.0129)
- No monthly minimums (vs Surge's $20/month)
- Better for low-volume use case
- Built-in 2FA/OTP verification API
- Fraud protection included

**Total estimated for 1,000 users: ~$76/month**
*(vs ~$120/month with Surge)*

---

## ✅ **Approved Changes**

1. ✅ **Email frequency:** Weekly (Friday mornings) + Monthly recaps only
2. ✅ **SMS usage:** Opt-in only, max 4-6 per month
3. ✅ **Service providers:** Resend (email) + Plivo (SMS) - **CONFIRMED**
4. ✅ **Resend choice rationale:** React Email for personalized 1:1 content, not just templates
5. ✅ **Settings location:** `/profile/settings` as separate hub
6. ✅ **Removed features:** Default media type preference
7. ✅ **Implementation order:** Account → Contact → Notifications → Email → SMS
