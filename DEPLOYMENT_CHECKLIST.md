# Deployment Checklist

## Required (must have before deploying)

### 1. Database (PostgreSQL)
- [ ] Create PostgreSQL database (Vercel Postgres, Neon, Supabase, Railway, or self-hosted)
- [ ] Get `DATABASE_URL` connection string

### 2. NextAuth
- [ ] Generate `NEXTAUTH_SECRET`: `openssl rand -base64 32`
- [ ] Set `NEXTAUTH_URL` to your production domain (e.g., `https://yourdomain.com`)

### 3. OAuth Providers (at least one recommended)
**Google:**
- [ ] Go to https://console.cloud.google.com/
- [ ] Create OAuth 2.0 credentials
- [ ] Add authorized redirect URI: `https://yourdomain.com/api/auth/callback/google`
- [ ] Get `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`

**GitHub:**
- [ ] Go to https://github.com/settings/developers
- [ ] Create OAuth App
- [ ] Add callback URL: `https://yourdomain.com/api/auth/callback/github`
- [ ] Get `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`

### 4. Stripe
- [ ] Create Stripe account at https://dashboard.stripe.com/
- [ ] Get `STRIPE_SECRET_KEY` and `STRIPE_PUBLISHABLE_KEY` from Developers > API Keys
- [ ] Create two prices (Monthly Pro, Yearly Pro) in Products
- [ ] Get `STRIPE_PRICE_ID_MONTHLY` and `STRIPE_PRICE_ID_YEARLY`
- [ ] Create webhook endpoint: `https://yourdomain.com/api/stripe/webhook`
- [ ] Subscribe to events: `customer.subscription.*`, `invoice.payment_failed`
- [ ] Get `STRIPE_WEBHOOK_SECRET` from webhook details

### 5. Email (Resend - optional but recommended)
- [ ] Create account at https://resend.com/
- [ ] Verify domain or use `onboarding@resend.dev` for testing
- [ ] Get `RESEND_API_KEY`
- [ ] Set `EMAIL_FROM`

### 6. App Config
- [ ] Set `NEXT_PUBLIC_APP_URL` to production domain
- [ ] Set `NEXT_PUBLIC_APP_NAME`

---

## Deployment Steps (after env vars ready)

```bash
# 1. Push to GitHub
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/saas-boilerplate.git
git push -u origin main

# 2. In Vercel:
# - Import project from GitHub
# - Add all env vars from .env.local
# - Deploy

# 3. After first deploy:
# - Copy production URL
# - Update NEXTAUTH_URL in Vercel env vars
# - Update OAuth redirect URIs with production URL
# - Update Stripe webhook URL with production URL
# - Redeploy

# 4. Run database migration in production:
# In Vercel dashboard > Functions > run: npx prisma db push
# Or add to build command: "prisma db push && next build"
```

---

## Post-Deploy Verification
- [ ] Sign up with test email
- [ ] Verify email received (if Resend configured)
- [ ] Test Stripe checkout flow (use test card 4242 4242 4242 4242)
- [ ] Verify webhook receives events
- [ ] Check dashboard shows subscription status
