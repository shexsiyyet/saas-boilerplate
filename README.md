# SaaS Boilerplate

Production-ready SaaS starter kit built with Next.js 14, TypeScript, Tailwind CSS, Prisma, NextAuth.js v5, and Stripe.

## Features

- 🚀 **Next.js 14 App Router** - Latest React features with Server Components
- 🔐 **Authentication** - NextAuth.js v5 with credentials, Google, GitHub OAuth
- 💳 **Billing** - Stripe Subscriptions with Checkout, Portal, Webhooks
- 🗄️ **Database** - PostgreSQL with Prisma ORM (type-safe)
- 🎨 **UI Components** - Radix UI + Tailwind CSS (shadcn/ui style)
- 📊 **Dashboard** - Analytics, billing, team, settings pages
- 👥 **Team Management** - Roles, invitations, permissions
- 🌙 **Dark Mode** - System-aware with manual toggle
- 📝 **Forms** - React Hook Form + Zod validation
- 🔔 **Toasts** - Sonner for notifications
- ✅ **TypeScript** - Strict mode, full type safety
- 🧪 **Testing** - Vitest + React Testing Library
- 🔧 **ESLint + Prettier** - Code quality enforced

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 3 |
| Database | PostgreSQL + Prisma 5 |
| Auth | NextAuth.js 5 (Beta) |
| Payments | Stripe |
| Email | Resend |
| UI | Radix UI + Lucide Icons |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Testing | Vitest |

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- pnpm (recommended) or npm/yarn

### Installation

```bash
# Clone the repo
git clone <your-repo>
cd saas-boilerplate

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local

# Edit .env.local with your values
# Required: DATABASE_URL, NEXTAUTH_SECRET
# Optional: OAuth keys, Stripe keys, Resend key

# Set up database
pnpm db:generate
pnpm db:push
pnpm db:seed

# Start development server
pnpm dev
```

Visit `http://localhost:3000`

### Demo Accounts

After seeding:
- **Admin**: `admin@example.com` / `admin123`
- **Demo**: `demo@example.com` / `demo123`

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `NEXTAUTH_URL` | Your app URL (e.g. http://localhost:3000) | Yes |
| `NEXTAUTH_SECRET` | Random 32+ char string (`openssl rand -base64 32`) | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | No |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | No |
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID | No |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth client secret | No |
| `STRIPE_SECRET_KEY` | Stripe secret key | No |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | No |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | No |
| `STRIPE_PRICE_ID_MONTHLY` | Monthly Pro price ID | No |
| `STRIPE_PRICE_ID_YEARLY` | Yearly Pro price ID | No |
| `RESEND_API_KEY` | Resend API key for emails | No |
| `EMAIL_FROM` | Sender email address | No |

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── auth/          # Auth endpoints
│   │   ├── stripe/        # Stripe endpoints
│   │   └── user/          # User endpoints
│   ├── auth/              # Auth pages (signin, signup, etc.)
│   ├── dashboard/         # Protected dashboard pages
│   │   ├── billing/       # Subscription management
│   │   ├── analytics/     # Usage analytics
│   │   ├── settings/      # Account settings
│   │   └── team/          # Team management
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Landing page
│   └── globals.css        # Global styles
├── components/
│   ├── ui/                # Reusable UI components
│   ├── auth/              # Auth forms
│   └── layout/            # Layout components
├── lib/
│   ├── auth.ts            # NextAuth configuration
│   ├── prisma.ts          # Prisma client
│   ├── stripe.ts          # Stripe helpers
│   └── utils.ts           # Utility functions
├── hooks/
│   └── use-toast.ts       # Toast hook
└── middleware.ts          # Auth middleware
```

## Database Schema

Key models:
- **User** - Accounts with roles (USER/ADMIN)
- **Account** - OAuth accounts (NextAuth)
- **Session** - User sessions
- **Subscription** - Stripe subscription data
- **Usage** - API usage tracking

## Stripe Setup

1. Create products/prices in Stripe Dashboard
2. Add price IDs to `.env.local`
3. Set up webhook endpoint: `https://yourdomain.com/api/stripe/webhook`
4. Subscribe to events: `customer.subscription.*`, `invoice.payment_failed`

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import in Vercel
3. Add environment variables
4. Deploy

### Docker

```bash
docker build -t saas-boilerplate .
docker run -p 3000:3000 --env-file .env.local saas-boilerplate
```

## Commands

```bash
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm db:generate  # Generate Prisma client
pnpm db:push      # Push schema to database
pnpm db:studio    # Open Prisma Studio
pnpm db:seed      # Seed database
pnpm test         # Run tests
pnpm test:ui      # Run tests with UI
```

## License

MIT - Use this boilerplate for your own projects, commercial or personal.

## Support

- Documentation: `/docs` (when added)
- Issues: GitHub Issues
- Discussions: GitHub Discussions