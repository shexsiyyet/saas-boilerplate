import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { redirect } from 'next/navigation'
import { DashboardProviders } from '@/components/auth/dashboard-providers'

export default async function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user) {
    redirect('/auth/signin')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, image: true },
  })

  return (
    <DashboardProviders>
      <DashboardLayout user={user!}>{children}</DashboardLayout>
    </DashboardProviders>
  )
}