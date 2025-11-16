# 🚀 Been Watching - Deployment Guide

## Current Status
- ✅ Running locally on `localhost:3000`
- ✅ Git repository initialized
- ✅ Supabase database configured
- ⏳ Not yet deployed (friends can't access)

## 🎯 Recommended: Deploy to Vercel

Vercel is the easiest option since it's made by the creators of Next.js.

### Step 1: Push Code to GitHub

1. **Create a new GitHub repository**
   - Go to https://github.com/new
   - Name it: `been-watching` (or whatever you prefer)
   - Make it **Private** (recommended for now)
   - Don't initialize with README (you already have code)

2. **Push your local code to GitHub**
   ```bash
   cd /Users/Nick/Desktop/Been\ Watching\ Cursor/been-watching-v2
   git remote add origin https://github.com/YOUR_USERNAME/been-watching.git
   git branch -M main
   git add .
   git commit -m "Initial deployment setup"
   git push -u origin main
   ```

### Step 2: Deploy to Vercel

1. **Sign up for Vercel** (if you don't have an account)
   - Go to https://vercel.com/signup
   - Sign up with GitHub (easiest)

2. **Import your project**
   - Click "Add New..." → "Project"
   - Select your `been-watching` repository
   - Click "Import"

3. **Configure the build**
   - Framework Preset: **Next.js** (should auto-detect)
   - Build Command: `npm run build` (should be default)
   - Output Directory: `.next` (should be default)

4. **Add Environment Variables** (CRITICAL!)
   Click "Environment Variables" and add:

   ```
   NEXT_PUBLIC_SUPABASE_URL = https://udfhqiipppybkuxpycay.supabase.co

   NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkZmhxaWlwcHB5Ymt1eHB5Y2F5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3MTY3MjUsImV4cCI6MjA3NDI5MjcyNX0.bDBIOaAQ2EuSkpMfrCfCmA_-1T-SIMfn59OK3Qqy0BY

   SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkZmhxaWlwcHB5Ymt1eHB5Y2F5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODcxNjcyNSwiZXhwIjoyMDc0MjkyNzI1fQ.-QFqZ6Xw17NLZjwDABVxTFzbhNH2iSDsZCE5PDXMiRQ

   TMDB_API_KEY = 99b89037cac7fea56692934b534ea26a

   NEXT_PUBLIC_APP_URL = https://YOUR-PROJECT-NAME.vercel.app
   ```

   **Note**: You'll update `NEXT_PUBLIC_APP_URL` after deployment with your actual Vercel URL

5. **Click "Deploy"**
   - Vercel will build and deploy your app
   - Takes 2-3 minutes
   - You'll get a URL like: `https://been-watching-xyz123.vercel.app`

### Step 3: Update Supabase OAuth Settings

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **Authentication** → **URL Configuration**
4. Under **Redirect URLs**, add your Vercel URL:
   ```
   https://YOUR-PROJECT-NAME.vercel.app/api/auth/callback
   ```
5. Update **Site URL** to:
   ```
   https://YOUR-PROJECT-NAME.vercel.app
   ```

### Step 4: Update Environment Variable

1. Go back to Vercel
2. Your Project → Settings → Environment Variables
3. Update `NEXT_PUBLIC_APP_URL` to your actual Vercel URL
4. Redeploy (Deployments → Three dots → Redeploy)

### Step 5: Test It!

1. Visit your Vercel URL
2. Try logging in with Google OAuth
3. Test adding a show
4. Everything should work!

## 🎁 Share with Friends

Once deployed, send your friends:
1. **The URL**: `https://your-app.vercel.app`
2. **The invite code**: `BOOZEHOUND`
3. They sign up with Google OAuth
4. You run the migration script to import their shows!

## 🔒 Security Notes

### What to NEVER commit to GitHub:
- `.env.local` file ❌ (already in `.gitignore`)
- `SUPABASE_SERVICE_ROLE_KEY` ❌
- Any other secret keys ❌

### What's safe to expose:
- `NEXT_PUBLIC_SUPABASE_URL` ✅ (public by design)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✅ (public, protected by RLS)
- `TMDB_API_KEY` ⚠️ (should be private but low risk)

### Current .gitignore status:
```bash
# Check what's ignored
cat .gitignore
```

Should include:
```
.env.local
.env*.local
node_modules/
.next/
```

## 🔄 Future Updates

After initial deployment, any time you make changes:

```bash
git add .
git commit -m "Description of changes"
git push
```

Vercel will automatically:
- Detect the push
- Build your app
- Deploy the new version
- Give you a preview URL for each commit

## 🌐 Custom Domain (Optional)

If you want `beenwatching.com` instead of `your-app.vercel.app`:

1. Buy a domain (Namecheap, Google Domains, etc.)
2. In Vercel: Settings → Domains → Add Domain
3. Follow Vercel's DNS instructions
4. Update Supabase redirect URLs to use your custom domain

## 📊 Monitoring

Vercel provides:
- **Analytics**: See visitor stats
- **Logs**: Debug errors
- **Speed Insights**: Performance metrics

All available in your Vercel dashboard.

## 🆘 Troubleshooting

### Build fails on Vercel
- Check the build logs in Vercel
- Make sure all dependencies are in `package.json`
- Test locally: `npm run build`

### OAuth not working
- Verify redirect URLs in Supabase match exactly
- Check that `NEXT_PUBLIC_APP_URL` is correct
- Look for errors in browser console

### Environment variables not working
- Make sure they're added in Vercel settings
- Redeploy after adding/changing variables
- Check they start with `NEXT_PUBLIC_` if used in client-side code

## 🎯 Next Steps After Deployment

1. ✅ Deploy to Vercel
2. ✅ Test OAuth login
3. ✅ Invite friends to sign up
4. 🚧 Run migration script to import their shows
5. 🎉 Everyone enjoys Been Watching!

---

**Last Updated**: October 18, 2025
**Status**: Ready for deployment
