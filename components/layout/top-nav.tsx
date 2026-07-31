'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Bell,
  Search,
  Moon,
  Sun,
  ChevronDown,
  LogOut,
} from 'lucide-react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { signOut } from 'next-auth/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TopNavProps {
  user?: {
    name?: string | null;
    email?: string | null;
    role?: string | null;
  };
  workspaceName?: string | null;
}

export function TopNav({ user, workspaceName }: TopNavProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getWorkspaceInitials = (name?: string | null) => {
    if (!name) return 'WS';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.trim().slice(0, 2).toUpperCase();
  };

  const wsName = workspaceName || 'Demo Workspace';
  const wsInitials = getWorkspaceInitials(wsName);
  const wsDomain = `${wsName.toLowerCase().replace(/\s+/g, '')}.com`;

  return (
    <header className="sticky top-0 z-30 w-full bg-background border-b border-border">
      <div className="flex items-center justify-between h-16 px-6 gap-4">
        {/* Search Bar */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search feedback, themes..."
              className="pl-10 bg-muted/50 border-muted"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <Button
            variant="ghost"
            size="sm"
            className="relative"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
          </Button>

          {/* Theme Toggle */}
          {mounted && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </Button>
          )}

          {/* Workspace Switcher / Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium hover:bg-accent transition-colors cursor-pointer">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                    {wsInitials}
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </button>
              }
            />
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs text-muted-foreground font-semibold">
                  WORKSPACES
                </DropdownMenuLabel>
                <DropdownMenuItem>
                  <div className="flex items-center gap-2 w-full">
                    <div className="w-6 h-6 rounded bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                      {wsInitials}
                    </div>
                    <div className="truncate">
                      <div className="text-sm font-medium truncate">{wsName}</div>
                      <div className="text-xs text-muted-foreground truncate">{wsDomain}</div>
                    </div>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs text-muted-foreground font-semibold">
                  ACCOUNT
                </DropdownMenuLabel>
                <div className="px-2 py-1.5 flex flex-col gap-0.5">
                  <div className="text-sm font-medium text-foreground">{user?.name || 'User'}</div>
                  <div className="text-xs text-muted-foreground truncate">{user?.email || ''}</div>
                </div>
                <DropdownMenuSeparator />
                <Link href="/profile">
                  <DropdownMenuItem className="cursor-pointer">Profile</DropdownMenuItem>
                </Link>
                <Link href="/settings">
                  <DropdownMenuItem className="cursor-pointer">Billing</DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-destructive cursor-pointer"
                  onClick={() => signOut({ callbackUrl: '/login' })}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
