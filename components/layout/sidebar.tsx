'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SIDEBAR_ITEMS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Inbox,
  TrendingUp,
  MessageSquare,
  FileText,
  Users,
  Settings,
  ChevronLeft,
  Menu,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard className="w-5 h-5" />,
  Inbox: <Inbox className="w-5 h-5" />,
  TrendingUp: <TrendingUp className="w-5 h-5" />,
  MessageSquare: <MessageSquare className="w-5 h-5" />,
  FileText: <FileText className="w-5 h-5" />,
  Users: <Users className="w-5 h-5" />,
  Settings: <Settings className="w-5 h-5" />,
};

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by not rendering state-dependent content on first render
  if (!mounted) {
    return (
      <div className="hidden lg:flex flex-col h-screen bg-sidebar border-r border-sidebar-border fixed left-0 top-0 w-64 z-40" />
    );
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className={`hidden lg:flex flex-col h-screen bg-sidebar border-r border-sidebar-border fixed left-0 top-0 transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
        } z-40`}
      >
        {/* Logo Area */}
        <div className="flex items-center justify-between p-6 border-b border-sidebar-border">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm">
                L
              </div>
              <span className="text-lg font-bold text-sidebar-foreground">LOOP</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <ChevronLeft className={`w-4 h-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
          </Button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
          {SIDEBAR_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start gap-3 ${
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                  }`}
                  title={item.name}
                >
                  {ICON_MAP[item.icon]}
                  {!isCollapsed && <span>{item.name}</span>}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-6 border-t border-sidebar-border">
          {!isCollapsed && (
            <div className="text-xs text-sidebar-foreground/60">
              © 2024 LOOP. All rights reserved.
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu Button - shown at top */}
      <div className="lg:hidden fixed top-4 left-4 z-40">
        <Button variant="outline" size="sm" className="bg-background">
          <Menu className="w-5 h-5" />
        </Button>
      </div>

      {/* Main content offset */}
      <div className={`hidden lg:block ${isCollapsed ? 'ml-20' : 'ml-64'} transition-all duration-300`} />
    </>
  );
}
