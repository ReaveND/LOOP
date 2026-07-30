'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  MoreHorizontal,
  Plus,
  Search,
  Mail,
  Trash2,
  Loader2,
} from 'lucide-react';

export interface MemberItem {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  avatar: string;
}

interface MembersClientProps {
  initialMembers: MemberItem[];
  currentUserId: string;
}

function getStatusColor(status: string) {
  return status === 'Active'
    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
}

function formatRoleToDb(role: string) {
  if (role === 'Editor') return 'ANALYST';
  return role.toUpperCase();
}

function formatRoleFromDb(role: string) {
  if (role === 'ANALYST') return 'Editor';
  if (role === 'ADMIN') return 'Admin';
  if (role === 'VIEWER') return 'Viewer';
  return role;
}

export function MembersClient({ initialMembers, currentUserId }: MembersClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('Editor');
  const [members, setMembers] = useState<MemberItem[]>(
    initialMembers.map((m) => ({ ...m, role: formatRoleFromDb(m.role) }))
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const filteredMembers = members.filter(
    (member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInviteMember = async () => {
    if (!newMemberEmail) return;
    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newMemberEmail,
          name: newMemberName || undefined,
          role: formatRoleToDb(newMemberRole),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to invite member');
      }

      const newMemberItem: MemberItem = {
        id: data.id,
        name: data.name,
        email: data.email,
        role: formatRoleFromDb(data.role),
        status: 'Active',
        avatar: data.name
          .split(' ')
          .map((n: string) => n[0])
          .join('')
          .substring(0, 2)
          .toUpperCase(),
      };

      setMembers((prev) => [...prev, newMemberItem]);
      setShowInviteDialog(false);
      setNewMemberEmail('');
      setNewMemberName('');
      setNewMemberRole('Editor');
    } catch (err: any) {
      setErrorMessage(err.message || 'Error sending invitation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async (id: string) => {
    if (id === currentUserId) return;

    try {
      const res = await fetch(`/api/members/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.message || 'Failed to remove member');
        return;
      }

      setMembers((prev) => prev.filter((member) => member.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleChangeRole = async (id: string, displayRole: string) => {
    const dbRole = formatRoleToDb(displayRole);

    try {
      const res = await fetch(`/api/members/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: dbRole }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.message || 'Failed to update role');
        return;
      }

      setMembers((prev) =>
        prev.map((member) =>
          member.id === id ? { ...member, role: displayRole } : member
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Team Members</h1>
          <p className="text-muted-foreground mt-1">Manage your team and permissions</p>
        </div>
        <Button
          className="bg-primary hover:bg-primary/90 gap-2"
          onClick={() => {
            setErrorMessage('');
            setShowInviteDialog(true);
          }}
        >
          <Plus className="w-4 h-4" />
          Invite Member
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border bg-card/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground font-medium">Total Members</p>
            <p className="text-3xl font-bold text-foreground mt-2">{members.length}</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground font-medium">Active</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
              {members.filter((m) => m.status === 'Active').length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground font-medium">Admins</p>
            <p className="text-3xl font-bold text-primary mt-2">
              {members.filter((m) => m.role === 'Admin').length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="border-border bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search members by name or email..."
              className="pl-10 bg-muted/50 border-muted"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
      </Card>

      {/* Members Table */}
      <Card className="border-border bg-card/50 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Member</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Email</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Role</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground"></th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member) => (
                  <tr
                    key={member.id}
                    className="border-b border-border hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                          {member.avatar}
                        </div>
                        <span className="font-medium text-foreground">{member.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Mail className="w-4 h-4 opacity-50" />
                        {member.email}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Select
                        value={member.role}
                        onValueChange={(newRole) => newRole && handleChangeRole(member.id, newRole)}
                      >
                        <SelectTrigger className="w-32 bg-muted/50 border-muted text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Admin">Admin</SelectItem>
                          <SelectItem value="Editor">Editor</SelectItem>
                          <SelectItem value="Viewer">Viewer</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="py-4 px-4">
                      <Badge className={getStatusColor(member.status)}>
                        {member.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          }
                        />
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Send Reminder</DropdownMenuItem>
                          {member.id !== currentUserId && (
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleRemoveMember(member.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Remove Member
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Invite Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              Add a new member to your LOOP workspace
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {errorMessage && (
              <div className="p-3 text-sm rounded bg-red-500/10 text-red-500 border border-red-500/20">
                {errorMessage}
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">
                Name (Optional)
              </label>
              <Input
                type="text"
                placeholder="Full Name"
                className="bg-muted/50 border-muted"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">
                Email Address
              </label>
              <Input
                type="email"
                placeholder="colleague@company.com"
                className="bg-muted/50 border-muted"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">
                Role
              </label>
              <Select value={newMemberRole} onValueChange={(value) => value && setNewMemberRole(value)}>
                <SelectTrigger className="bg-muted/50 border-muted">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Editor">Editor</SelectItem>
                  <SelectItem value="Viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
              {newMemberRole === 'Admin' && '• Can manage members and all settings'}
              {newMemberRole === 'Editor' && '• Can view and edit feedback and themes'}
              {newMemberRole === 'Viewer' && '• Can only view reports and dashboards'}
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowInviteDialog(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-primary"
                onClick={handleInviteMember}
                disabled={!newMemberEmail || isLoading}
              >
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Add Member
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
