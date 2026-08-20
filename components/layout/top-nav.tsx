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
import Image from 'next/image';
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
    <header className="sticky top-0 z-30 w-full bg-card rounded-b-[2rem] border-b-2 border-border/80 shadow-sm">
      <div className="flex items-center justify-between h-20 px-6 gap-4">
        {/* Left Section: Logo */}
        <div className="flex items-center gap-8 flex-1">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-4 ml-12 lg:ml-0">
            <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center">
              <Image src="/loop_logo.png" alt="Logo" width={40} height={40} className="w-full h-full object-contain" />
            </div>
            <div className="h-12 flex items-center">
              <Image src="/loop_text.png" alt="LOOP" width={160} height={48} className="h-full w-auto object-contain" />
            </div>
          </Link>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-1">
          {/* Theme Toggle */}
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </Button>
          )}

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative h-9 w-9">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full border border-card" />
          </Button>

          {/* Divider */}
          <div className="w-px h-6 bg-border mx-2" />

          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button className="group inline-flex items-center justify-center gap-3 px-2 py-1.5 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0 group-hover:bg-background/20 group-hover:border-transparent group-hover:text-accent-foreground">
                    {wsInitials}
                  </div>
                  <div className="flex flex-col items-start leading-tight">
                    <span className="text-sm font-semibold text-foreground group-hover:text-accent-foreground">{user?.name || 'User'}</span>
                    <span className="text-xs text-muted-foreground capitalize group-hover:text-accent-foreground/80">{user?.role?.toLowerCase() || 'Member'}</span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground group-hover:text-accent-foreground/80" />
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
                  onClick={() => signOut({ callbackUrl: '/' })}
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
