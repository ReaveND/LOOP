'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, User, KeyRound, Building, CheckCircle2, AlertCircle, Shield } from 'lucide-react';

export default function ProfilePage() {
  const { data: session, update: updateSession } = useSession();

  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<{
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
    workspace?: { name: string };
  } | null>(null);

  // General profile form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Password change form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (session?.user) {
      if (session.user.name) setName((prev) => prev || session.user.name || '');
      if (session.user.email) setEmail((prev) => prev || session.user.email || '');
    }

    async function loadProfile() {
      try {
        const res = await fetch('/api/user/profile');
        if (res.ok) {
          const data = await res.json();
          setUserProfile(data);
          if (data.name) setName(data.name);
          if (data.email) setEmail(data.email);
        }
      } catch (err) {
        console.error('Failed to load user profile:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [session]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg(null);

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      setUserProfile((prev) => (prev ? { ...prev, name: data.name, email: data.email } : prev));
      await updateSession({ name: data.name, email: data.email });

      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err: any) {
      setProfileMsg({ type: 'error', text: err.message || 'An error occurred' });
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'New password must be at least 6 characters.' });
      return;
    }

    setPasswordSaving(true);

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update password');
      }

      setPasswordMsg({ type: 'success', text: 'Password changed successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordMsg({ type: 'error', text: err.message || 'An error occurred' });
    } finally {
      setPasswordSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground gap-2">
        <Loader2 className="w-5 h-5 animate-spin" /> Loading profile...
      </div>
    );
  }

  const role = userProfile?.role || (session?.user as any)?.role || 'VIEWER';
  const roleColor =
    role === 'ADMIN'
      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300 border-purple-500/20'
      : role === 'ANALYST'
      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border-blue-500/20'
      : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-500/20';

  const displayName = userProfile?.name || session?.user?.name || 'User';
  const displayEmail = userProfile?.email || session?.user?.email || '';

  return (
    <div className="max-w-4xl space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Account Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your account details and security settings</p>
      </div>

      {/* Overview Header Card */}
      <Card className="border-border bg-card/50 backdrop-blur-sm p-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/80 to-accent flex items-center justify-center text-primary-foreground font-bold text-2xl shadow-md">
            {displayName.slice(0, 2).toUpperCase()}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-foreground">{displayName}</h2>
              <Badge variant="outline" className={`capitalize font-semibold ${roleColor}`}>
                <Shield className="w-3 h-3 mr-1" />
                {role.toLowerCase()}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{displayEmail}</p>
            {userProfile?.workspace?.name && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <Building className="w-3.5 h-3.5" /> Workspace: <span className="font-medium text-foreground">{userProfile.workspace.name}</span>
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="general" className="gap-2">
            <User className="w-4 h-4" /> Personal Information
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <KeyRound className="w-4 h-4" /> Security
          </TabsTrigger>
        </TabsList>

        {/* General Details */}
        <TabsContent value="general" className="space-y-6 mt-6">
          <Card className="border-border bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Personal Details</CardTitle>
              <CardDescription>Update your display name and email address</CardDescription>
            </CardHeader>
            <CardContent>
              {profileMsg && (
                <div
                  className={`p-3 mb-6 text-sm rounded-lg flex items-center gap-2 border ${
                    profileMsg.type === 'success'
                      ? 'bg-green-500/10 text-green-500 border-green-500/20'
                      : 'bg-red-500/10 text-red-500 border-red-500/20'
                  }`}
                >
                  {profileMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  {profileMsg.text}
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">Full Name</label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="bg-muted/50 border-muted"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">Email Address</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="bg-muted/50 border-muted"
                    required
                  />
                </div>

                <div className="pt-2">
                  <Button className="bg-primary" type="submit" disabled={profileSaving}>
                    {profileSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Save Profile Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security / Password */}
        <TabsContent value="security" className="space-y-6 mt-6">
          <Card className="border-border bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Ensure your account is using a strong, unique password</CardDescription>
            </CardHeader>
            <CardContent>
              {passwordMsg && (
                <div
                  className={`p-3 mb-6 text-sm rounded-lg flex items-center gap-2 border ${
                    passwordMsg.type === 'success'
                      ? 'bg-green-500/10 text-green-500 border-green-500/20'
                      : 'bg-red-500/10 text-red-500 border-red-500/20'
                  }`}
                >
                  {passwordMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  {passwordMsg.text}
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">Current Password</label>
                  <Input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-muted/50 border-muted"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">New Password</label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-muted/50 border-muted"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">Confirm New Password</label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-muted/50 border-muted"
                    required
                  />
                </div>

                <div className="pt-2">
                  <Button className="bg-primary" type="submit" disabled={passwordSaving}>
                    {passwordSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Update Password
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
