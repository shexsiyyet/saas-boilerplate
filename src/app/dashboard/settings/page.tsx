'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { toast } from '@/hooks/use-toast'
import { Loader2, User, Lock, Bell, Shield, Trash2 } from 'lucide-react'

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

const notificationSchema = z.object({
  emailNotifications: z.boolean(),
  marketingEmails: z.boolean(),
  securityAlerts: z.boolean(),
  weeklyDigest: z.boolean(),
})

type ProfileData = z.infer<typeof profileSchema>
type PasswordData = z.infer<typeof passwordSchema>
type NotificationData = z.infer<typeof notificationSchema>

export default function SettingsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = React.useState('profile')
  const [loading, setLoading] = React.useState<string | null>(null)

  const profileForm = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: '', email: '' },
  })

  const passwordForm = useForm<PasswordData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  })

  const notificationForm = useForm<NotificationData>({
    resolver: zodResolver(notificationSchema),
    defaultValues: { emailNotifications: true, marketingEmails: false, securityAlerts: true, weeklyDigest: true },
  })

  React.useEffect(() => {
    profileForm.reset({ name: 'Current User', email: 'user@example.com' })
  }, [profileForm])

  const onProfileSubmit = async (data: ProfileData) => {
    setLoading('profile')
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Failed to update profile')
      toast({ title: 'Success', description: 'Profile updated' })
    } catch {
      toast({ title: 'Error', description: 'Failed to update profile', variant: 'destructive' })
    } finally {
      setLoading(null)
    }
  }

  const onPasswordSubmit = async (data: PasswordData) => {
    setLoading('password')
    try {
      const response = await fetch('/api/user/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: data.currentPassword, newPassword: data.newPassword }),
      })
      if (!response.ok) throw new Error('Failed to update password')
      toast({ title: 'Success', description: 'Password updated' })
      passwordForm.reset()
    } catch {
      toast({ title: 'Error', description: 'Failed to update password', variant: 'destructive' })
    } finally {
      setLoading(null)
    }
  }

  const onNotificationSubmit = async (data: NotificationData) => {
    setLoading('notifications')
    try {
      const response = await fetch('/api/user/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Failed to update notifications')
      toast({ title: 'Success', description: 'Preferences saved' })
    } catch {
      toast({ title: 'Error', description: 'Failed to save preferences', variant: 'destructive' })
    } finally {
      setLoading(null)
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirm('This will permanently delete your account and all data. This cannot be undone.')) return
    if (!confirm('Are you absolutely sure? Type "DELETE" to confirm.')) return
    setLoading('delete')
    try {
      const response = await fetch('/api/user/account', { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete account')
      toast({ title: 'Account deleted', description: 'Your account has been permanently deleted' })
      router.push('/')
    } catch {
      toast({ title: 'Error', description: 'Failed to delete account', variant: 'destructive' })
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account settings and preferences</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="danger">Danger Zone</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    {...profileForm.register('name')}
                    disabled={loading === 'profile'}
                  />
                  {profileForm.formState.errors.name && (
                    <p className="text-sm text-destructive">{profileForm.formState.errors.name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...profileForm.register('email')}
                    disabled={loading === 'profile'}
                  />
                  {profileForm.formState.errors.email && (
                    <p className="text-sm text-destructive">{profileForm.formState.errors.email.message}</p>
                  )}
                </div>
                <Button type="submit" disabled={loading === 'profile'}>
                  {loading === 'profile' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Changes'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Change Password
              </CardTitle>
              <CardDescription>Update your password</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    {...passwordForm.register('currentPassword')}
                    disabled={loading === 'password'}
                  />
                  {passwordForm.formState.errors.currentPassword && (
                    <p className="text-sm text-destructive">{passwordForm.formState.errors.currentPassword.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    {...passwordForm.register('newPassword')}
                    disabled={loading === 'password'}
                  />
                  {passwordForm.formState.errors.newPassword && (
                    <p className="text-sm text-destructive">{passwordForm.formState.errors.newPassword.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    {...passwordForm.register('confirmPassword')}
                    disabled={loading === 'password'}
                  />
                  {passwordForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-destructive">{passwordForm.formState.errors.confirmPassword.message}</p>
                  )}
                </div>
                <Button type="submit" disabled={loading === 'password'}>
                  {loading === 'password' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Update Password'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>Choose what emails you want to receive</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <label className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-muted-foreground">Receive important account notifications</p>
                    </div>
                    <Input
                      type="checkbox"
                      checked={notificationForm.watch('emailNotifications')}
                      onChange={(e) => notificationForm.setValue('emailNotifications', e.target.checked)}
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Marketing Emails</p>
                      <p className="text-sm text-muted-foreground">Receive product updates and tips</p>
                    </div>
                    <Input
                      type="checkbox"
                      checked={notificationForm.watch('marketingEmails')}
                      onChange={(e) => notificationForm.setValue('marketingEmails', e.target.checked)}
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Security Alerts</p>
                      <p className="text-sm text-muted-foreground">Get notified about suspicious activity</p>
                    </div>
                    <Input
                      type="checkbox"
                      checked={notificationForm.watch('securityAlerts')}
                      onChange={(e) => notificationForm.setValue('securityAlerts', e.target.checked)}
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Weekly Digest</p>
                      <p className="text-sm text-muted-foreground">Weekly summary of your usage</p>
                    </div>
                    <Input
                      type="checkbox"
                      checked={notificationForm.watch('weeklyDigest')}
                      onChange={(e) => notificationForm.setValue('weeklyDigest', e.target.checked)}
                    />
                  </label>
                </div>
                <Button type="submit" disabled={loading === 'notifications'}>
                  {loading === 'notifications' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Preferences'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="danger">
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Shield className="h-5 w-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>Irreversible actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="p-4 border border-destructive/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Delete Account</p>
                      <p className="text-sm text-muted-foreground">
                        Permanently delete your account and all associated data. This action cannot be undone.
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      onClick={handleDeleteAccount}
                      disabled={loading === 'delete'}
                    >
                      {loading === 'delete' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}Delete Account
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}