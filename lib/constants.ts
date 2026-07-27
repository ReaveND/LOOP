export const SIDEBAR_ITEMS = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: 'LayoutDashboard',
  },
  {
    name: 'Feedback Inbox',
    href: '/inbox',
    icon: 'Inbox',
  },
  {
    name: 'Theme Trends',
    href: '/trends',
    icon: 'TrendingUp',
  },
  {
    name: 'Ask LOOP',
    href: '/ask',
    icon: 'MessageSquare',
  },
  {
    name: 'Voice of Customer',
    href: '/reports',
    icon: 'FileText',
  },
  {
    name: 'Members',
    href: '/members',
    icon: 'Users',
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: 'Settings',
  },
];

export const STAT_CARDS = [
  {
    title: 'Total Feedback',
    value: '2,847',
    change: '+12.5%',
    icon: 'MessageCircle',
  },
  {
    title: 'Positive',
    value: '1,240',
    change: '+8.2%',
    icon: 'ThumbsUp',
  },
  {
    title: 'Neutral',
    value: '987',
    change: '+3.1%',
    icon: 'Minus',
  },
  {
    title: 'Negative',
    value: '620',
    change: '-5.4%',
    icon: 'ThumbsDown',
  },
];

export const RECENT_FEEDBACK = [
  {
    id: 1,
    content: 'The new dashboard UI is incredibly intuitive and responsive.',
    customer: 'Sarah Chen',
    channel: 'Email',
    sentiment: 'Positive',
    themes: ['UI/UX', 'Performance'],
    status: 'Reviewed',
    date: '2 hours ago',
  },
  {
    id: 2,
    content: 'Would love to see dark mode support for the application.',
    customer: 'Marcus Johnson',
    channel: 'In-app',
    sentiment: 'Neutral',
    themes: ['Feature Request', 'Accessibility'],
    status: 'Open',
    date: '4 hours ago',
  },
  {
    id: 3,
    content: 'The onboarding process was confusing. Too many steps.',
    customer: 'Emily Rodriguez',
    channel: 'Chat',
    sentiment: 'Negative',
    themes: ['Onboarding', 'UX'],
    status: 'In Progress',
    date: '6 hours ago',
  },
  {
    id: 4,
    content: 'Integration with Slack has saved us so much time!',
    customer: 'Alex Thompson',
    channel: 'Survey',
    sentiment: 'Positive',
    themes: ['Integration', 'Productivity'],
    status: 'Reviewed',
    date: '8 hours ago',
  },
  {
    id: 5,
    content: 'API documentation could use more examples.',
    customer: 'Jordan Lee',
    channel: 'GitHub Issue',
    sentiment: 'Neutral',
    themes: ['Documentation', 'Developer Experience'],
    status: 'Open',
    date: '12 hours ago',
  },
];

export const THEMES = [
  {
    id: 1,
    name: 'Performance',
    growth: 12.5,
    count: 342,
    severity: 'High',
    color: 'bg-red-500',
  },
  {
    id: 2,
    name: 'UI/UX',
    growth: 8.3,
    count: 298,
    severity: 'High',
    color: 'bg-orange-500',
  },
  {
    id: 3,
    name: 'Feature Requests',
    growth: 5.2,
    count: 267,
    severity: 'Medium',
    color: 'bg-yellow-500',
  },
  {
    id: 4,
    name: 'Documentation',
    growth: 3.1,
    count: 145,
    severity: 'Low',
    color: 'bg-blue-500',
  },
  {
    id: 5,
    name: 'Integrations',
    growth: 2.8,
    count: 98,
    severity: 'Low',
    color: 'bg-green-500',
  },
];

export const TEAM_MEMBERS = [
  {
    id: 1,
    name: 'Alex Chen',
    email: 'alex.chen@company.com',
    role: 'Admin',
    status: 'Active',
    avatar: 'AC',
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    email: 'sarah.johnson@company.com',
    role: 'Editor',
    status: 'Active',
    avatar: 'SJ',
  },
  {
    id: 3,
    name: 'Marcus Williams',
    email: 'marcus.williams@company.com',
    role: 'Viewer',
    status: 'Inactive',
    avatar: 'MW',
  },
  {
    id: 4,
    name: 'Emily Brown',
    email: 'emily.brown@company.com',
    role: 'Editor',
    status: 'Active',
    avatar: 'EB',
  },
];
