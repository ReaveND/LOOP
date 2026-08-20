'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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

interface SidebarProps {
  userRole?: string | null;
  workspaceName?: string;
}

export function Sidebar({ userRole, workspaceName = "Workspace" }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const visibleItems = SIDEBAR_ITEMS.filter((item) => {
    if (!item.roles) return true;
    if (!userRole) return false;
    return item.roles.includes(userRole);
  });

  // Prevent hydration mismatch by not rendering state-dependent content on first render
  if (!mounted) {
    return (
      <div className="hidden lg:flex flex-col h-[calc(100vh-7rem)] bg-sidebar/80 backdrop-blur-xl border border-sidebar-border/40 fixed left-4 top-24 w-64 rounded-[2rem] z-40 shadow-2xl" />
    );
  }

  return (
    <>
      {/* Sidebar Container */}
      <div
        className={`${
          isMobileOpen ? 'flex' : 'hidden'
        } lg:flex flex-col h-[calc(100vh-7rem)] bg-sidebar/95 lg:bg-sidebar/70 backdrop-blur-2xl border border-white/10 dark:border-white/5 fixed left-4 top-24 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isCollapsed ? 'w-[5.5rem]' : 'w-72'
        } max-w-[calc(100vw-2rem)] rounded-[2rem] z-40 shadow-[0_8px_32px_0_rgba(0,0,0,0.2)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] overflow-visible`}
      >
        {/* Navigation Items */}
        <nav className="flex-1 px-3 pt-4 pb-0 space-y-0.5 overflow-y-auto scrollbar-none">
          {visibleItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} onClick={() => setIsMobileOpen(false)}>
                <div
                  className={`group relative flex items-center p-3 my-1 rounded-2xl cursor-pointer transition-all duration-300 ease-out border ${
                    isActive
                      ? 'bg-gradient-to-r from-primary/10 to-transparent border-primary/20 text-primary shadow-[inset_4px_0_0_0_hsl(var(--primary))]'
                      : 'border-transparent text-sidebar-foreground hover:bg-sidebar-accent/50 hover:border-sidebar-border/50'
                  }`}
                  title={isCollapsed ? undefined : item.name}
                >
                  <div className={`flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-300 ${
                    isActive 
                      ? 'bg-primary text-primary-foreground shadow-md scale-110' 
                      : 'bg-sidebar-accent/50 group-hover:bg-sidebar-accent group-hover:scale-110 group-hover:shadow-sm'
                  } ${isCollapsed ? 'mx-auto' : ''}`}>
                    {ICON_MAP[item.icon]}
                  </div>
                  
                  {!isCollapsed && (
                    <span className={`ml-4 font-semibold tracking-wide text-sm whitespace-nowrap transition-all duration-300 ${
                      isActive ? 'text-primary' : 'group-hover:text-sidebar-foreground'
                    }`}>
                      {item.name}
                    </span>
                  )}
                  
                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <div className="absolute left-[calc(100%+1rem)] px-4 py-2.5 bg-popover text-popover-foreground font-medium text-sm rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 whitespace-nowrap shadow-xl border border-border z-50 transform translate-x-2 group-hover:translate-x-0">
                      {item.name}
                      {/* Tooltip arrow */}
                      <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-3 bg-popover border-l border-b border-border rotate-45"></div>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 pt-2 mt-auto shrink-0">
          <div className={`transition-all duration-300 ${isCollapsed ? 'opacity-0 h-0 hidden' : 'opacity-100'}`}>
            <div className="p-4 rounded-2xl bg-gradient-to-br from-sidebar-accent/50 to-transparent border border-sidebar-border/50">
              <div className="text-[11px] uppercase tracking-widest font-bold text-sidebar-foreground/50 mb-1">
                Workspace
              </div>
              <div className="text-sm font-medium text-sidebar-foreground truncate">
                {workspaceName}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Button - shown at top */}
      <div className="lg:hidden fixed top-5 left-6 z-50">
        <Button 
          variant="outline" 
          size="icon" 
          className="bg-background/95 backdrop-blur-md rounded-xl shadow-lg border-sidebar-border/50 w-10 h-10"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
        >
          <Menu className="w-5 h-5 text-foreground" />
        </Button>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-[2px] z-30" 
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Main content offset */}
      <div className={`hidden lg:block ${isCollapsed ? 'ml-[6.5rem]' : 'ml-[19rem]'} transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]`} />
    </>
  );
}
