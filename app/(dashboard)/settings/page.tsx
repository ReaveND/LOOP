import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Copy,
  AlertTriangle,
  Bell,
  Lock,
  Globe,
} from 'lucide-react';

export const metadata = {
  title: 'Settings | LOOP',
  description: 'Manage workspace settings',
};

export default async function SettingsPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  if (session.user.role === 'VIEWER') {
    redirect('/dashboard');
  }

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your workspace preferences</p>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="workspace" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="workspace">Workspace</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="api">API Keys</TabsTrigger>
          <TabsTrigger value="danger">Danger Zone</TabsTrigger>
        </TabsList>

        {/* Workspace Settings */}
        <TabsContent value="workspace" className="space-y-6 mt-6">
          <Card className="border-border bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Workspace Information</CardTitle>
              <CardDescription>Basic settings for your workspace</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Workspace Name
                </label>
                <Input
                  value="Acme Corp"
                  className="bg-muted/50 border-muted"
                  readOnly
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Workspace URL
                </label>
                <Input
                  value="loop.acme.com"
                  className="bg-muted/50 border-muted"
                  readOnly
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Language
                </label>
                <Select defaultValue="english">
                  <SelectTrigger className="w-full bg-muted/50 border-muted">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="spanish">Spanish</SelectItem>
                    <SelectItem value="french">French</SelectItem>
                    <SelectItem value="german">German</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Time Zone
                </label>
                <Select defaultValue="utc">
                  <SelectTrigger className="w-full bg-muted/50 border-muted">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="utc">UTC</SelectItem>
                    <SelectItem value="pst">Pacific Time (PST)</SelectItem>
                    <SelectItem value="est">Eastern Time (EST)</SelectItem>
                    <SelectItem value="cet">Central European Time (CET)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="bg-primary">Save Changes</Button>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Data & Privacy</CardTitle>
              <CardDescription>Control how your data is handled</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div>
                  <p className="font-medium text-foreground">Data Retention</p>
                  <p className="text-sm text-muted-foreground">Automatically delete feedback after</p>
                </div>
                <Select defaultValue="90days">
                  <SelectTrigger className="w-32 bg-muted/50 border-muted">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30days">30 days</SelectItem>
                    <SelectItem value="90days">90 days</SelectItem>
                    <SelectItem value="1year">1 year</SelectItem>
                    <SelectItem value="never">Never</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div>
                  <p className="font-medium text-foreground">Anonymous Mode</p>
                  <p className="text-sm text-muted-foreground">Hide customer names in feedback</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6 mt-6">
          <Card className="border-border bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose how you want to be notified</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">Feedback Alerts</p>
                    <p className="text-sm text-muted-foreground">Get notified of new feedback</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">Sentiment Alerts</p>
                    <p className="text-sm text-muted-foreground">Notify on spike in negative feedback</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">Theme Alerts</p>
                    <p className="text-sm text-muted-foreground">Notify on new theme detection</p>
                  </div>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">Weekly Digest</p>
                    <p className="text-sm text-muted-foreground">Receive weekly summary emails</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Keys */}
        <TabsContent value="api" className="space-y-6 mt-6">
          <Card className="border-border bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                API Keys
              </CardTitle>
              <CardDescription>Manage your API keys for integrations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted/30 rounded-lg border border-muted">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium text-foreground text-sm">Production Key</p>
                    <p className="text-xs text-muted-foreground">Created 2 months ago</p>
                  </div>
                  <Badge variant="secondary">Active</Badge>
                </div>
                <div className="flex items-center gap-2 bg-background p-2 rounded text-xs font-mono text-muted-foreground">
                  <span>loop_prod_••••••••••••••••••••••••</span>
                  <Copy className="w-4 h-4 cursor-pointer hover:text-foreground" />
                </div>
              </div>

              <div className="p-4 bg-muted/30 rounded-lg border border-muted">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium text-foreground text-sm">Development Key</p>
                    <p className="text-xs text-muted-foreground">Created 1 week ago</p>
                  </div>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                    Limited
                  </Badge>
                </div>
                <div className="flex items-center gap-2 bg-background p-2 rounded text-xs font-mono text-muted-foreground">
                  <span>loop_dev_••••••••••••••••••••••••</span>
                  <Copy className="w-4 h-4 cursor-pointer hover:text-foreground" />
                </div>
              </div>

              <Button variant="outline" className="w-full gap-2">
                Generate New Key
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Danger Zone */}
        <TabsContent value="danger" className="space-y-6 mt-6">
          <Card className="border-destructive/50 bg-destructive/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-5 h-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>Irreversible actions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border border-destructive/30 rounded-lg bg-background">
                <h3 className="font-medium text-foreground mb-2">Delete All Feedback</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  This will permanently delete all feedback data. This action cannot be undone.
                </p>
                <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive/10">
                  Delete All Data
                </Button>
              </div>

              <div className="p-4 border border-destructive/30 rounded-lg bg-background">
                <h3 className="font-medium text-foreground mb-2">Delete Workspace</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Permanently delete this workspace and all associated data. This action cannot be undone.
                </p>
                <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive/10">
                  Delete Workspace
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
