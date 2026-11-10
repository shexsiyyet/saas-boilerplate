export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  CheckCircle2,
  Zap,
  Shield,
  Database,
  CreditCard,
  Users,
  Code2,
  Globe,
  ArrowRight,
} from 'lucide-react'

const features = [
  { icon: Zap, title: 'Next.js 14 App Router', desc: 'Latest React features with Server Components' },
  { icon: Shield, title: 'NextAuth v5 (Beta)', desc: 'Secure authentication with OAuth & credentials' },
  { icon: Database, title: 'Prisma + PostgreSQL', desc: 'Type-safe database with migrations' },
  { icon: CreditCard, title: 'Stripe Subscriptions', desc: 'Billing portal, webhooks, checkout' },
  { icon: Users, title: 'Team & Roles', desc: 'Multi-tenant ready with RBAC' },
  { icon: Code2, title: 'TypeScript + Tailwind', desc: 'Full type safety, modern styling' },
  { icon: Globe, title: 'SEO & Analytics Ready', desc: 'Metadata, sitemap, OpenGraph' },
  { icon: CheckCircle2, title: 'Production Hardened', desc: 'Error boundaries, logging, tests' },
]

const pricing = [
  {
    name: 'Starter',
    price: 0,
    description: 'Perfect for side projects',
    features: ['Up to 100 API calls/month', 'Community support', 'Basic analytics', '1 team member'],
    cta: 'Start Free',
    variant: 'outline' as const,
  },
  {
    name: 'Pro',
    price: 29,
    description: 'For growing businesses',
    features: ['Up to 10,000 API calls/month', 'Priority email support', 'Advanced analytics', '5 team members', 'Custom domains'],
    cta: 'Get Started',
    variant: 'default' as const,
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 99,
    description: 'For large teams',
    features: ['Unlimited API calls', '24/7 dedicated support', 'Custom integrations', 'Unlimited team members', 'SLA & compliance', 'SSO/SAML'],
    cta: 'Contact Sales',
    variant: 'outline' as const,
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm text-muted-foreground mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            Now with Next.js 14 & App Router
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            Ship your SaaS in
            <span className="text-primary"> days, not months</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            A production-ready boilerplate with authentication, billing, database, and dashboard.
            Focus on your product, not the plumbing.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="w-full sm:w-auto gap-2" asChild>
              <Link href="/auth/signup">Start building free</Link>
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto" asChild>
              <Link href="#features">View features</Link>
            </Button>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 lg:py-32 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to launch</h2>
            <p className="text-muted-foreground text-lg">Built-in features that save weeks of development time</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="h-full">
                <CardHeader>
                  <feature.icon className="h-10 w-10 text-primary mb-3" />
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, transparent pricing</h2>
            <p className="text-muted-foreground text-lg">Choose the plan that fits your needs</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {pricing.map((plan) => (
              <Card key={plan.name} className={`relative h-full flex flex-col ${plan.popular ? 'border-primary ring-2 ring-primary' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                <CardHeader className="flex flex-col items-center text-center">
                  <CardTitle>{plan.name}</CardTitle>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-4xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <p className="text-muted-foreground text-sm mt-2">{plan.description}</p>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full" variant={plan.variant} asChild>
                    <Link href="/auth/signup">{plan.cta}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-32 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Ready to start building?
          </h2>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto mb-8">
            Join thousands of developers who ship faster with our boilerplate.
          </p>
          <Button size="lg" variant="secondary" className="gap-2" asChild>
            <Link href="/auth/signup">Create free account</Link>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#features" className="hover:text-foreground">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-foreground">Pricing</Link></li>
                <li><Link href="/docs" className="hover:text-foreground">Documentation</Link></li>
                <li><Link href="/changelog" className="hover:text-foreground">Changelog</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-foreground">About</Link></li>
                <li><Link href="/blog" className="hover:text-foreground">Blog</Link></li>
                <li><Link href="/careers" className="hover:text-foreground">Careers</Link></li>
                <li><Link href="/contact" className="hover:text-foreground">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-foreground">Terms of Service</Link></li>
                <li><Link href="/cookies" className="hover:text-foreground">Cookie Policy</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Connect</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="https://twitter.com" target="_blank" rel="noopener" className="hover:text-foreground">Twitter</a></li>
                <li><a href="https://github.com" target="_blank" rel="noopener" className="hover:text-foreground">GitHub</a></li>
                <li><a href="https://discord.com" target="_blank" rel="noopener" className="hover:text-foreground">Discord</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} SaaS Boilerplate. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}