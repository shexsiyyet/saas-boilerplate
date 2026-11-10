'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableFooter } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from '@/hooks/use-toast'
import { Users, Plus, Mail, Shield, Loader2, MoreHorizontal, Trash2, Edit } from 'lucide-react'

const inviteSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['MEMBER', 'ADMIN']),
})

type InviteData = z.infer<typeof inviteSchema>

interface TeamMember {
  id: string
  name: string
  email: string
  role: 'OWNER' | 'ADMIN' | 'MEMBER'
  status: 'ACTIVE' | 'PENDING'
  joinedAt: string
}

const mockMembers: TeamMember[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', role: 'OWNER', status: 'ACTIVE', joinedAt: '2024-01-15' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'ADMIN', status: 'ACTIVE', joinedAt: '2024-02-20' },
  { id: '3', name: 'Bob Wilson', email: 'bob@example.com', role: 'MEMBER', status: 'ACTIVE', joinedAt: '2024-03-10' },
  { id: '4', name: 'Alice Brown', email: 'alice@example.com', role: 'MEMBER', status: 'PENDING', joinedAt: '2024-04-01' },
]

export default function TeamPage() {
  const [members, setMembers] = React.useState<TeamMember[]>(mockMembers)
  const [inviteDialogOpen, setInviteDialogOpen] = React.useState(false)
  const [editingMember, setEditingMember] = React.useState<TeamMember | null>(null)
  const [loading, setLoading] = React.useState<string | null>(null)

  const inviteForm = useForm<InviteData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { email: '', role: 'MEMBER' },
  })

  const onInviteSubmit = async (data: InviteData) => {
    setLoading('invite')
    try {
      await new Promise(r => setTimeout(r, 1000))
      const newMember: TeamMember = {
        id: Date.now().toString(),
        name: data.email.split('@')[0],
        email: data.email,
        role: data.role === 'ADMIN' ? 'ADMIN' : 'MEMBER',
        status: 'PENDING',
        joinedAt: new Date().toISOString().split('T')[0],
      }
      setMembers(prev => [...prev, newMember])
      toast({ title: 'Success', description: `Invitation sent to ${data.email}` })
      setInviteDialogOpen(false)
      inviteForm.reset()
    } catch {
      toast({ title: 'Error', description: 'Failed to send invitation', variant: 'destructive' })
    } finally {
      setLoading(null)
    }
  }

  const handleRoleChange = async (memberId: string, newRole: 'ADMIN' | 'MEMBER') => {
    setLoading(`role-${memberId}`)
    try {
      await new Promise(r => setTimeout(r, 500))
      setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role: newRole } : m))
      toast({ title: 'Success', description: 'Role updated' })
    } catch {
      toast({ title: 'Error', description: 'Failed to update role', variant: 'destructive' })
    } finally {
      setLoading(null)
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return
    setLoading(`remove-${memberId}`)
    try {
      await new Promise(r => setTimeout(r, 500))
      setMembers(prev => prev.filter(m => m.id !== memberId))
      toast({ title: 'Success', description: 'Member removed' })
    } catch {
      toast({ title: 'Error', description: 'Failed to remove member', variant: 'destructive' })
    } finally {
      setLoading(null)
    }
  }

  const handleResendInvite = async (member: TeamMember) => {
    setLoading(`resend-${member.id}`)
    try {
      await new Promise(r => setTimeout(r, 500))
      toast({ title: 'Success', description: `Invitation resent to ${member.email}` })
    } catch {
      toast({ title: 'Error', description: 'Failed to resend invitation', variant: 'destructive' })
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team</h1>
          <p className="text-muted-foreground mt-1">Manage team members and permissions</p>
        </div>
        <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Invite Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Team Member</DialogTitle>
              <DialogDescription>Enter their email address to send an invitation</DialogDescription>
            </DialogHeader>
            <form onSubmit={inviteForm.handleSubmit(onInviteSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="colleague@company.com"
                  {...inviteForm.register('email')}
                  disabled={loading === 'invite'}
                />
                {inviteForm.formState.errors.email && (
                  <p className="text-sm text-destructive">{inviteForm.formState.errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer hover:bg-accent">
                    <Input type="radio" value="MEMBER" {...inviteForm.register('role')} />
                    <span className="text-sm">Member</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer hover:bg-accent">
                    <Input type="radio" value="ADMIN" {...inviteForm.register('role')} />
                    <span className="text-sm">Admin</span>
                  </label>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setInviteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading === 'invite'}>
                  {loading === 'invite' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send Invitation'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Members
          </CardTitle>
          <CardDescription>{members.length} member{members.length !== 1 ? 's' : ''}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <select
                        value={member.role}
                        onChange={(e) => handleRoleChange(member.id, e.target.value as 'ADMIN' | 'MEMBER')}
                        disabled={member.role === 'OWNER' || loading === `role-${member.id}`}
                        className="px-2 py-1 border rounded text-sm bg-background"
                      >
                        <option value="MEMBER">Member</option>
                        <option value="ADMIN">Admin</option>
                        <option value="OWNER" disabled>Owner</option>
                      </select>
                    </TableCell>
                    <TableCell>
                      <Badge variant={member.status === 'ACTIVE' ? 'default' : 'secondary'}>
                        {member.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{member.joinedAt}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {member.status === 'PENDING' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleResendInvite(member)}
                            disabled={loading === `resend-${member.id}`}
                          >
                            {loading === `resend-${member.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Resend'}
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMember(member.id)}
                          disabled={member.role === 'OWNER' || loading === `remove-${member.id}`}
                        >
                          {loading === `remove-${member.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Roles & Permissions</CardTitle>
          <CardDescription>Understanding team roles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { name: 'Owner', description: 'Full access to all settings, billing, and team management', permissions: ['All permissions', 'Manage billing', 'Delete account', 'Transfer ownership'] },
              { name: 'Admin', description: 'Can manage team members and most settings', permissions: ['Invite/remove members', 'Change roles', 'View analytics', 'Manage API keys'] },
              { name: 'Member', description: 'Standard access for day-to-day work', permissions: ['View dashboard', 'Use API', 'View own usage', 'Manage profile'] },
            ].map((role) => (
              <div key={role.name} className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">{role.name}</h4>
                <p className="text-sm text-muted-foreground mb-3">{role.description}</p>
                <ul className="space-y-1 text-sm">
                  {role.permissions.map((perm) => (
                    <li key={perm} className="flex items-center gap-2">
                      <Shield className="h-3 w-3 text-primary" />
                      {perm}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}