'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const FEEDBACK_ITEMS = [
  { id: 1, text: '"The search filters are incredible — saved us hours."', sentiment: 'positive', theme: 'Search UX', score: 0.94 },
  { id: 2, text: '"Onboarding flow is confusing for new users."', sentiment: 'negative', theme: 'Onboarding', score: 0.21 },
  { id: 3, text: '"API response times are consistently under 50ms."', sentiment: 'positive', theme: 'Performance', score: 0.91 },
  { id: 4, text: '"Mobile layout breaks on iPad landscape view."', sentiment: 'negative', theme: 'Mobile UX', score: 0.18 },
  { id: 5, text: '"Love the dark mode — my eyes thank you."', sentiment: 'positive', theme: 'Accessibility', score: 0.88 },
  { id: 6, text: '"Pricing page needs more clarity on tiers."', sentiment: 'neutral', theme: 'Pricing', score: 0.50 },
  { id: 7, text: '"Export to PDF is flawless every time."', sentiment: 'positive', theme: 'Reporting', score: 0.96 },
];

const MARQUEE_ITEMS = [
  { text: 'Next.js 16', icon: '⚡' },
  { text: 'Groq AI', icon: '🤖' },
  { text: 'pgvector', icon: '🧬' },
  { text: 'Prisma v7', icon: '🔗' },
  { text: 'Neon Postgres', icon: '🗄️' },
  { text: 'NextAuth v5', icon: '🔐' },
  { text: 'Tailwind CSS v4', icon: '🎨' },
  { text: 'Recharts', icon: '📊' },
  { text: 'Zod v4', icon: '✅' },
  { text: 'Vercel Edge', icon: '🚀' },
  { text: 'RAG Search', icon: '💡' },
  { text: 'TypeScript', icon: '🔷' },
];

const AI_PRESET_TESTS = [
  { label: '🚀 API Latency', text: 'API speed is blazingly fast under 30ms but documentation for pagination is missing.' },
  { label: '💳 Billing Confusion', text: 'Pricing tiers are super confusing, I was double charged for additional seats.' },
  { label: '🎨 Dark Theme', text: 'The dark mode color palette is clean, sleek and extremely pleasant for high contrast.' },
];

export default function LandingPage() {
  const [filter, setFilter] = useState<'all' | 'positive' | 'negative' | 'neutral'>('all');
  const [sandboxInput, setSandboxInput] = useState('Search filters are super fast but missing a date range selector.');
  const [isClassifying, setIsClassifying] = useState(false);
  const [classifiedResult, setClassifiedResult] = useState<{
    sentiment: 'positive' | 'negative' | 'neutral';
    score: number;
    theme: string;
    action: string;
    vectorId: string;
  }>({
    sentiment: 'positive',
    score: 0.88,
    theme: 'Search UX & Filters',
    action: 'Add date range parameter to filter API',
    vectorId: 'vec_7f81a9',
  });
  const [copiedRole, setCopiedRole] = useState<string | null>(null);

  const filteredItems = FEEDBACK_ITEMS.filter((item) => {
    if (filter === 'all') return true;
    return item.sentiment === filter;
  });

  const handleRunSandbox = (textToTest?: string) => {
    const input = textToTest || sandboxInput;
    if (!input.trim()) return;

    if (textToTest) setSandboxInput(textToTest);
    setIsClassifying(true);

    setTimeout(() => {
      const lower = input.toLowerCase();
      let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
      let score = 0.5;
      let theme = 'General UX';
      let action = 'Log feedback for product team review';

      if (lower.includes('fast') || lower.includes('clean') || lower.includes('sleek') || lower.includes('love') || lower.includes('flawless')) {
        sentiment = 'positive';
        score = 0.92;
        theme = lower.includes('api') || lower.includes('speed') ? 'Performance' : 'User Experience';
        action = 'Highlight positive sentiment in weekly VoC report';
      } else if (lower.includes('confusing') || lower.includes('charge') || lower.includes('missing') || lower.includes('breaks') || lower.includes('fail')) {
        sentiment = 'negative';
        score = 0.24;
        theme = lower.includes('price') || lower.includes('billing') || lower.includes('tier') ? 'Pricing & Billing' : 'Feature Request / Bug';
        action = 'Escalate ticket to product manager backlog';
      }

      setClassifiedResult({
        sentiment,
        score,
        theme,
        action,
        vectorId: `vec_${Math.random().toString(36).substring(2, 8)}`,
      });
      setIsClassifying(false);
    }, 600);
  };

  const handleCopyCreds = (role: string, email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedRole(role);
    setTimeout(() => setCopiedRole(null), 2000);
  };

  return (
    <div className="lr">
      {/* SVG noise texture filter */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <filter id="noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
          <feBlend in="SourceGraphic" mode="overlay" result="blend" />
          <feComposite in="blend" in2="SourceGraphic" operator="in" />
        </filter>
      </svg>

      {/* Dynamic Glow Mesh background */}
      <div className="mesh-bg" aria-hidden="true">
        <div className="mesh-layer mesh-a" />
        <div className="mesh-layer mesh-b" />
        <div className="mesh-layer mesh-c" />
        <div className="mesh-layer mesh-d" />
        <div className="grid-lines" />
      </div>

      {/* NAVBAR */}
      <nav className="nav">
        <div className="nav-inner">
          <div className="nav-brand">
            <Image src="/loop_logo.png" alt="LOOP" width={32} height={32} className="nav-logo-img" />
            <span className="nav-wordmark">LOOP</span>
          </div>

          <div className="nav-center">
            <a href="#visualizer" className="nav-link">AI Sandbox</a>
            <a href="#features" className="nav-link">Platform</a>
            <a href="#ai" className="nav-link">AI Suite</a>
            <a href="#process" className="nav-link">Process</a>
            <a href="#demo" className="nav-link">Demo</a>
          </div>

          <div className="nav-end">
            <Link href="/login" className="nav-signin">Sign in</Link>
            <Link href="/signup" className="nav-cta">
              <span>Get started</span>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 7h8M7.5 3.5L11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-left">
          {/* Status pill */}
          <div className="status-pill">
            <span className="status-dot" />
            <span className="status-sparkle">✨</span>
            <span>Live AI Customer Signal Engine</span>
          </div>

          {/* Headline */}
          <h1 className="hero-h1">
            <span className="h1-line h1-line-1">Customer feedback,</span>
            <span className="h1-line h1-line-2">
              <span className="h1-accent">instantly</span> decoded into
            </span>
            <span className="h1-line h1-line-3">action.</span>
          </h1>

          <p className="hero-desc">
            LOOP turns chaotic customer signals into ranked, vector-embedded decisions.
            Multi-tenant security · Groq AI classification · Built for speed.
          </p>

          <div className="hero-btns">
            <Link href="/signup" className="hbtn hbtn-primary">
              Start free trial
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M8.5 3.5L13 8l-4.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <Link href="/login" className="hbtn hbtn-ghost">
              <span className="play-icon">▶</span>
              Explore live demo
            </Link>
          </div>

          {/* Micro stats */}
          <div className="hero-stats">
            {[
              { value: '120+', label: 'Seeded signals' },
              { value: '4', label: 'AI vector engines' },
              { value: '3', label: 'RBAC roles' },
              { value: '<50ms', label: 'pgvector query' },
            ].map((s) => (
              <div className="hstat" key={s.label}>
                <span className="hstat-value">{s.value}</span>
                <span className="hstat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* HERO RIGHT: Interactive Signal Stream Visualizer */}
        <div className="hero-right">
          {/* Central ring */}
          <div className="ring-wrap">
            <div className="ring ring-outer" />
            <div className="ring ring-mid" />
            <div className="ring ring-inner" />
            <div className="ring-core">
              <Image src="/loop_logo.png" alt="LOOP" width={52} height={52} />
            </div>
            {/* Orbiting dots */}
            <div className="orbit orbit-1"><div className="orbit-dot" style={{ background: '#7c6ef5' }} /></div>
            <div className="orbit orbit-2"><div className="orbit-dot" style={{ background: '#38b2ac' }} /></div>
            <div className="orbit orbit-3"><div className="orbit-dot" style={{ background: '#f6ad55' }} /></div>
          </div>

          {/* Live feedback feed with interactive filter */}
          <div className="feed-panel">
            <div className="feed-header">
              <div className="feed-title-wrap">
                <span className="feed-title">Live Signal Stream</span>
                <span className="feed-live"><span className="feed-live-dot" />Streaming</span>
              </div>
              <div className="feed-filter-tabs">
                {(['all', 'positive', 'negative', 'neutral'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setFilter(tab)}
                    className={`feed-filter-btn ${filter === tab ? 'active' : ''}`}
                  >
                    {tab === 'all' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="feed-scroll">
              {filteredItems.map((item, i) => (
                <div className="feed-row" key={item.id} style={{ animationDelay: `${i * 0.1}s` }}>
                  <div
                    className="sentiment-bar"
                    style={{
                      background: item.sentiment === 'positive' ? '#38b2ac'
                        : item.sentiment === 'negative' ? '#fc8181' : '#f6ad55',
                    }}
                  />
                  <div className="feed-row-body">
                    <p className="feed-text">{item.text}</p>
                    <div className="feed-tags">
                      <span
                        className="feed-tag"
                        style={{
                          background: item.sentiment === 'positive' ? 'rgba(56,178,172,0.14)'
                            : item.sentiment === 'negative' ? 'rgba(252,129,129,0.14)' : 'rgba(246,173,85,0.14)',
                          color: item.sentiment === 'positive' ? '#38b2ac'
                            : item.sentiment === 'negative' ? '#fc8181' : '#f6ad55',
                        }}
                      >
                        {item.sentiment}
                      </span>
                      <span className="feed-tag feed-tag-theme">{item.theme}</span>
                      <span className="feed-score">{(item.score * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE TECH STACK */}
      <div className="marquee-wrap">
        <div className="marquee-track">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <div className="marquee-item" key={i}>
              <span className="marquee-icon">{item.icon}</span>
              <span className="marquee-text">{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* INTERACTIVE AI SANDBOX VISUALIZER */}
      <section id="visualizer" className="sandbox-section">
        <div className="sandbox-container">
          <div className="sandbox-header">
            <span className="eyebrow-badge">Interactive Demo</span>
            <h2 className="section-h2">Test the AI Signal Classification Engine</h2>
            <p className="section-sub">Type any feedback snippet or try a preset below to watch Groq AI & pgvector analyze signals in real time.</p>
          </div>

          {/* Preset Buttons */}
          <div className="preset-row">
            <span className="preset-label">Try Preset:</span>
            {AI_PRESET_TESTS.map((preset) => (
              <button
                key={preset.label}
                className="preset-btn"
                onClick={() => handleRunSandbox(preset.text)}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="sandbox-card">
            <div className="sandbox-input-group">
              <label htmlFor="sandbox-input" className="sandbox-label">Feedback Input</label>
              <div className="sandbox-input-wrapper">
                <input
                  id="sandbox-input"
                  type="text"
                  value={sandboxInput}
                  onChange={(e) => setSandboxInput(e.target.value)}
                  placeholder="e.g. Onboarding flow takes too long and billing page lacks receipt export..."
                  className="sandbox-input"
                  onKeyDown={(e) => e.key === 'Enter' && handleRunSandbox()}
                />
                <button
                  onClick={() => handleRunSandbox()}
                  disabled={isClassifying}
                  className="sandbox-submit-btn"
                >
                  {isClassifying ? (
                    <span className="sandbox-spinner" />
                  ) : (
                    <>
                      <span>Analyze Signal</span>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M3 7h8M7.5 3.5L11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.9" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Classification Output Card */}
            <div className="sandbox-output">
              <div className="output-header">
                <span className="output-title">Groq AI Realtime Output</span>
                <span className="vector-tag">{classifiedResult.vectorId}</span>
              </div>
              <div className="output-grid">
                <div className="output-stat">
                  <span className="stat-name">Sentiment</span>
                  <div className="sentiment-result-badge" style={{
                    color: classifiedResult.sentiment === 'positive' ? '#38b2ac' : classifiedResult.sentiment === 'negative' ? '#fc8181' : '#f6ad55',
                    borderColor: classifiedResult.sentiment === 'positive' ? 'rgba(56,178,172,0.3)' : classifiedResult.sentiment === 'negative' ? 'rgba(252,129,129,0.3)' : 'rgba(246,173,85,0.3)',
                    background: classifiedResult.sentiment === 'positive' ? 'rgba(56,178,172,0.1)' : classifiedResult.sentiment === 'negative' ? 'rgba(252,129,129,0.1)' : 'rgba(246,173,85,0.1)',
                  }}>
                    <span className="dot" style={{
                      background: classifiedResult.sentiment === 'positive' ? '#38b2ac' : classifiedResult.sentiment === 'negative' ? '#fc8181' : '#f6ad55'
                    }} />
                    {classifiedResult.sentiment.toUpperCase()}
                  </div>
                </div>

                <div className="output-stat">
                  <span className="stat-name">Action Confidence</span>
                  <div className="score-bar-wrap">
                    <div className="score-bar-fill" style={{
                      width: `${classifiedResult.score * 100}%`,
                      background: classifiedResult.score > 0.6 ? 'linear-gradient(90deg, #38b2ac, #7c6ef5)' : 'linear-gradient(90deg, #f6ad55, #fc8181)'
                    }} />
                    <span className="score-num">{(classifiedResult.score * 100).toFixed(0)}%</span>
                  </div>
                </div>

                <div className="output-stat">
                  <span className="stat-name">PGVector Cluster</span>
                  <span className="theme-pill">{classifiedResult.theme}</span>
                </div>
              </div>

              <div className="output-action">
                <span className="action-label">Recommended Action:</span>
                <span className="action-val">{classifiedResult.action}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BENTO FEATURES SECTION */}
      <section id="features" className="bento-section">
        <div className="bento-header">
          <p className="eyebrow">Core Architecture</p>
          <h2 className="section-h2">Everything connected in one unified loop.</h2>
        </div>

        <div className="bento-grid">
          {/* Multi-Tenant Card */}
          <div className="bcard bcard-lg bcard-purple">
            <div className="bcard-glow" />
            <div className="bcard-no">01</div>
            <div className="bcard-icon-xl">🏢</div>
            <h3 className="bcard-title">Multi-Tenant<br />Workspaces</h3>
            <p className="bcard-desc">
              Every workspace is an isolated fortress. Data is scoped strictly at the query level — avoiding cross-company data leakage by design.
            </p>
            <div className="bcard-pill">Prisma v7 Query Scoped</div>
          </div>

          {/* RBAC Card */}
          <div className="bcard bcard-md bcard-teal">
            <div className="bcard-glow" />
            <div className="bcard-no">02</div>
            <span className="bcard-icon-md">🔐</span>
            <h3 className="bcard-title-sm">Role-Based Access Control</h3>
            <p className="bcard-desc-sm">Admin · Analyst · Viewer roles enforced on Vercel Edge & Server components.</p>
            <div className="rbac-chips">
              {[{ r: 'Admin', c: '#7c6ef5' }, { r: 'Analyst', c: '#38b2ac' }, { r: 'Viewer', c: '#f6ad55' }].map((x) => (
                <span className="rbac-chip" key={x.r} style={{ borderColor: x.c, color: x.c }}>{x.r}</span>
              ))}
            </div>
          </div>

          {/* Ingestion Card */}
          <div className="bcard bcard-md bcard-amber">
            <div className="bcard-glow" />
            <div className="bcard-no">03</div>
            <span className="bcard-icon-md">📥</span>
            <h3 className="bcard-title-sm">Multi-Channel Ingestion</h3>
            <p className="bcard-desc-sm">Single submission, CSV imports, or webhook streams routed straight into your inbox.</p>
            <div className="source-dots">
              {['Email', 'Survey', 'Support', 'CSV'].map((s, i) => (
                <div className="source-dot" key={s} style={{ animationDelay: `${i * 0.3}s` }}>
                  <div className="source-dot-gfx" />
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Smart Inbox Card */}
          <div className="bcard bcard-sm bcard-glass">
            <div className="bcard-glow" />
            <div className="bcard-no">04</div>
            <span className="bcard-icon-sm">🔍</span>
            <h3 className="bcard-title-xs">Smart Inbox</h3>
            <p className="bcard-desc-xs">Full-text search + 6 filter dimensions with instant response.</p>
          </div>

          {/* Analytics Card */}
          <div className="bcard bcard-sm bcard-glass">
            <div className="bcard-glow" />
            <div className="bcard-no">05</div>
            <span className="bcard-icon-sm">📊</span>
            <h3 className="bcard-title-xs">Visual Analytics</h3>
            <p className="bcard-desc-xs">Sentiment breakdown, theme trends, and volume charts built with Recharts.</p>
          </div>

          {/* Workflow Card */}
          <div className="bcard bcard-sm bcard-glass">
            <div className="bcard-glow" />
            <div className="bcard-no">06</div>
            <span className="bcard-icon-sm">⚡</span>
            <h3 className="bcard-title-xs">Status Workflow</h3>
            <p className="bcard-desc-xs">Track feedback lifecycle from NEW → REVIEWED → ACTIONED.</p>
          </div>
        </div>
      </section>

      {/* AI SUITE SECTION */}
      <section id="ai" className="ai-section">
        <div className="ai-header">
          <p className="eyebrow">AI Suite</p>
          <h2 className="section-h2">
            Four specialized engines.<br />One continuous <span className="grad-word">loop.</span>
          </h2>
          <p className="ai-subhead">Server-side execution ensures secure API credentials and fast zero-latency caching.</p>
        </div>

        <div className="ai-timeline">
          {[
            {
              n: '01', color: '#7c6ef5',
              title: 'Auto-Classification',
              sub: 'Groq API · Instant Ingestion Tagging',
              desc: 'Every incoming signal is tagged with sentiment, score, theme, and feature area. Persisted in database for zero re-computation.',
              tags: ['Sentiment', 'Score 0–1', 'Theme Tagging', 'Feature Area'],
            },
            {
              n: '02', color: '#38b2ac',
              title: 'Theme Clustering & Trends',
              sub: 'pgvector · Semantic Spike Detection',
              desc: 'Clusters items into semantic themes. Automatically flags spike anomalies (>50% growth vs prior period) with drill-down views.',
              tags: ['>50% Spike Flag', 'Vector Clusters', 'Trend Delta', 'Click-to-Drill'],
            },
            {
              n: '03', color: '#9f7aea',
              title: 'Ask LOOP — RAG Q&A',
              sub: 'pgvector Search · Evidence-Backed Answers',
              desc: 'Ask questions in natural language. LOOP retrieves matching signal vectors and synthesizes answers backed strictly by customer evidence.',
              tags: ['Semantic Embed', 'pgvector Match', 'Cited Sources', 'Natural Language'],
            },
            {
              n: '04', color: '#f6ad55',
              title: 'Voice-of-Customer Reports',
              sub: 'One-Click · Executive PDF Export',
              desc: 'Generates comprehensive VoC reports with AI narratives and interactive visual breakdown. Ready to export to PDF.',
              tags: ['One-Click VoC', 'Real DB Stats', 'AI Narrative', 'PDF Export'],
            },
          ].map((ai, i) => (
            <div className="ai-row" key={ai.n}>
              <div className="ai-row-num" style={{ color: ai.color }}>{ai.n}</div>
              <div className="ai-row-line">
                <div className="ai-row-dot" style={{ background: ai.color, boxShadow: `0 0 16px ${ai.color}` }} />
                {i < 3 && <div className="ai-row-vline" style={{ background: `linear-gradient(to bottom, ${ai.color}, transparent)` }} />}
              </div>
              <div className="ai-row-body" style={{ '--ac': ai.color } as React.CSSProperties}>
                <div className="ai-row-meta">{ai.sub}</div>
                <h3 className="ai-row-title">{ai.title}</h3>
                <p className="ai-row-desc">{ai.desc}</p>
                <div className="ai-row-tags">
                  {ai.tags.map((t) => (
                    <span className="ai-tag" key={t} style={{ borderColor: `${ai.color}50`, color: ai.color, background: `${ai.color}10` }}>{t}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PROCESS SECTION */}
      <section id="process" className="process-section">
        <p className="eyebrow text-center">How It Works</p>
        <h2 className="section-h2 text-center">From raw signal to clear executive decision.</h2>

        <div className="process-steps">
          {[
            { n: '01', verb: 'Ingest', icon: '📨', color: '#7c6ef5', desc: 'Collect signals from email, tickets, surveys, CSV.' },
            { n: '02', verb: 'Classify', icon: '🤖', color: '#38b2ac', desc: 'Groq tags sentiment, score, theme, and area.' },
            { n: '03', verb: 'Cluster', icon: '🧠', color: '#9f7aea', desc: 'pgvector groups signals into named vector clusters.' },
            { n: '04', verb: 'Query', icon: '💬', color: '#f6ad55', desc: 'Ask LOOP anything in plain English.' },
            { n: '05', verb: 'Report', icon: '🚀', color: '#fc8181', desc: 'One-click VoC report generation and PDF export.' },
          ].map((s, i) => (
            <div className="pstep" key={s.n}>
              {i < 4 && <div className="pstep-arrow">→</div>}
              <div className="pstep-card" style={{ '--pc': s.color } as React.CSSProperties}>
                <div className="pstep-icon">{s.icon}</div>
                <div className="pstep-verb" style={{ color: s.color }}>{s.verb}</div>
                <p className="pstep-desc">{s.desc}</p>
                <div className="pstep-num">{s.n}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* LIVE DEMO & CREDENTIALS */}
      <section id="demo" className="demo-section">
        <div className="demo-left">
          <p className="eyebrow">Instant Workspace</p>
          <h2 className="section-h2 demo-h2">Try it live in under 5 seconds.</h2>
          <p className="demo-desc">
            A fully seeded workspace loaded with 120+ realistic customer feedback signals is ready to test.
            Click any role to copy email credentials directly.
          </p>
          <Link href="/login" className="hbtn hbtn-primary demo-btn">
            Launch Workspace Demo →
          </Link>
        </div>

        <div className="demo-right">
          <div className="creds-card">
            <div className="creds-label">Pre-configured Demo Accounts</div>
            {[
              { role: 'Admin', color: '#7c6ef5', email: 'admin@demo.com', pw: 'password123' },
              { role: 'Analyst', color: '#38b2ac', email: 'analyst@demo.com', pw: 'password123' },
              { role: 'Viewer', color: '#f6ad55', email: 'viewer@demo.com', pw: 'password123' },
            ].map((c) => (
              <div
                className={`cred-row ${copiedRole === c.role ? 'copied' : ''}`}
                key={c.role}
                onClick={() => handleCopyCreds(c.role, c.email)}
                title="Click to copy email"
              >
                <div className="cred-role-wrap">
                  <div className="cred-role-dot" style={{ background: c.color }} />
                  <span className="cred-role" style={{ color: c.color }}>{c.role}</span>
                </div>
                <span className="cred-email">{c.email}</span>
                <span className="cred-pw">{copiedRole === c.role ? '✓ Copied!' : c.pw}</span>
              </div>
            ))}
          </div>

          <div className="demo-features">
            {[
              '✓ 120+ realistic seeded signals',
              '✓ Active Groq & pgvector search',
              '✓ Realtime analytics dashboard',
              '✓ One-click VoC report builder',
            ].map((f) => <div className="demo-feat" key={f}>{f}</div>)}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="cta-section">
        <div className="cta-ring cta-ring-1" />
        <div className="cta-ring cta-ring-2" />
        <div className="cta-inner">
          <div className="cta-logo-wrap">
            <Image src="/loop_logo.png" alt="LOOP" width={64} height={64} className="cta-logo" />
          </div>
          <h2 className="cta-h2">
            Close the loop on<br />
            <span className="grad-word">customer intelligence.</span>
          </h2>
          <p className="cta-sub">No complex setup. Instant insights powered by Next.js 16 & Groq AI.</p>
          <div className="cta-btns">
            <Link href="/signup" className="hbtn hbtn-primary hbtn-xl">
              Get started for free
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M8.5 3.5L13 8l-4.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <Link href="/login" className="hbtn hbtn-ghost hbtn-xl">Launch Live Demo</Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <Image src="/loop_logo.png" alt="LOOP" width={24} height={24} />
            <span className="footer-name">LOOP</span>
            <span className="footer-sep">·</span>
            <span className="footer-tag">AI Customer Feedback Intelligence</span>
          </div>
          <div className="footer-links">
            <Link href="/login" className="fl">Sign In</Link>
            <Link href="/signup" className="fl">Sign Up</Link>
            <a href="https://github.com/ReaveND/LOOP" target="_blank" rel="noopener noreferrer" className="fl">GitHub ↗</a>
          </div>
          <p className="footer-copy">Built with ❤ · Zidio Development Internship · LOOP v1.0</p>
        </div>
      </footer>

      {/* STYLES */}
      <style>{`
        /* === RESET & BASE === */
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .lr {
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          background: radial-gradient(circle at 50% -10%, #0c0824 0%, #050412 45%, #030309 100%);
          color: #ddddf0;
          overflow-x: hidden;
          position: relative;
        }

        /* === MESH BACKGROUND === */
        .mesh-bg {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
        }
        .mesh-layer {
          position: absolute;
          border-radius: 50%;
          filter: blur(110px);
          opacity: 0.85;
          will-change: transform;
        }
        .mesh-a {
          width: 900px; height: 900px;
          background: radial-gradient(circle, rgba(124, 110, 245, 0.22) 0%, rgba(108, 95, 245, 0.06) 50%, transparent 75%);
          top: -250px; left: -200px;
          animation: meshFloat 18s ease-in-out infinite alternate;
        }
        .mesh-b {
          width: 800px; height: 800px;
          background: radial-gradient(circle, rgba(45, 212, 191, 0.22) 0%, rgba(56, 178, 172, 0.07) 45%, transparent 75%);
          bottom: -150px; right: -150px;
          animation: meshFloat 22s ease-in-out infinite alternate-reverse;
        }
        .mesh-c {
          width: 700px; height: 700px;
          background: radial-gradient(circle, rgba(168, 85, 247, 0.16) 0%, rgba(124, 110, 245, 0.05) 50%, transparent 75%);
          top: 35%; left: 45%;
          transform: translate(-50%, -50%);
          animation: meshPulse 16s ease-in-out infinite alternate;
        }
        .mesh-d {
          width: 650px; height: 650px;
          background: radial-gradient(circle, rgba(246, 173, 85, 0.22) 0%, rgba(237, 137, 54, 0.06) 50%, transparent 75%);
          top: 70%; left: 10%;
          animation: meshFloat 20s ease-in-out infinite alternate 3s;
        }
        .grid-lines {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
          background-size: 64px 64px;
          mask-image: radial-gradient(ellipse at 50% 50%, black 40%, transparent 90%);
          -webkit-mask-image: radial-gradient(ellipse at 50% 50%, black 40%, transparent 90%);
        }
        @keyframes meshFloat {
          0% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(60px, -45px) scale(1.08); }
          100% { transform: translate(-45px, 60px) scale(0.95); }
        }
        @keyframes meshPulse {
          0% { transform: translate(-50%, -50%) scale(0.9); opacity: 0.7; }
          100% { transform: translate(-45%, -55%) scale(1.15); opacity: 1; }
        }

        /* === NAVBAR === */
        .nav {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 200;
          height: 64px;
          display: flex;
          align-items: center;
        }
        .nav::before {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(5, 5, 18, 0.75);
          backdrop-filter: blur(24px) saturate(1.4);
          -webkit-backdrop-filter: blur(24px) saturate(1.4);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        .nav-inner {
          position: relative;
          max-width: 1240px;
          margin: 0 auto;
          padding: 0 28px;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .nav-brand {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .nav-logo-wrap { position: relative; display: flex; align-items: center; }
        .nav-logo-img { border-radius: 8px; z-index: 1; }
        .logo-glow {
          position: absolute; inset: -4px;
          background: radial-gradient(circle, rgba(124,110,245,0.6), transparent 70%);
          filter: blur(6px);
        }
        .nav-wordmark {
          font-size: 18px;
          font-weight: 800;
          letter-spacing: -0.5px;
          background: linear-gradient(120deg, #bfa9ff, #60d0c8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .nav-center {
          display: flex;
          gap: 32px;
        }
        .nav-link {
          font-size: 13.5px;
          font-weight: 500;
          color: rgba(221,221,240,0.65);
          text-decoration: none;
          letter-spacing: 0.01em;
          transition: color 0.18s;
        }
        .nav-link:hover { color: #ffffff; }
        .nav-end { display: flex; align-items: center; gap: 12px; }
        .nav-signin {
          font-size: 13.5px;
          font-weight: 500;
          color: rgba(221,221,240,0.65);
          text-decoration: none;
          padding: 7px 14px;
          border-radius: 8px;
          transition: color 0.18s, background 0.18s;
        }
        .nav-signin:hover { color: #ffffff; background: rgba(255,255,255,0.06); }
        .nav-cta {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 8px 18px;
          border-radius: 10px;
          font-size: 13.5px;
          font-weight: 600;
          text-decoration: none;
          color: #fff;
          background: linear-gradient(135deg, #7c6ef5 0%, #38b2ac 100%);
          box-shadow: 0 0 0 1px rgba(124,110,245,0.4), 0 4px 20px rgba(108,95,245,0.4);
          transition: box-shadow 0.2s, transform 0.15s;
        }
        .nav-cta:hover {
          box-shadow: 0 0 0 1px rgba(124,110,245,0.6), 0 6px 28px rgba(108,95,245,0.6);
          transform: translateY(-1px);
        }

        /* === HERO === */
        .hero {
          position: relative;
          z-index: 1;
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          gap: 48px;
          align-items: center;
          max-width: 1240px;
          margin: 0 auto;
          padding: 100px 28px 60px;
        }
        .hero-left { display: flex; flex-direction: column; gap: 28px; }

        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 16px 6px 12px;
          background: rgba(124, 110, 245, 0.12);
          border: 1px solid rgba(124, 110, 245, 0.3);
          border-radius: 999px;
          font-size: 12.5px;
          font-weight: 600;
          color: #bfa9ff;
          width: fit-content;
          box-shadow: 0 0 20px rgba(124,110,245,0.2);
        }
        .status-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: #38b2ac;
          box-shadow: 0 0 10px #38b2ac;
          animation: blink 2s ease-in-out infinite;
        }
        .status-sparkle { font-size: 12px; }
        @keyframes blink {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.8); }
        }

        .hero-h1 {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .h1-line {
          display: block;
          font-weight: 800;
          line-height: 1.06;
          letter-spacing: -3px;
          font-size: clamp(42px, 5.2vw, 76px);
          color: #f4f4ff;
        }
        .h1-accent {
          display: inline-block;
          padding-right: 0.2em;
          background: linear-gradient(120deg, #c4b5fd 0%, #38b2ac 50%, #60d0c8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-style: italic;
        }

        .hero-desc {
          font-size: 16.5px;
          line-height: 1.7;
          color: rgba(221,221,240,0.65);
          max-width: 480px;
        }

        .hero-btns { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }

        .hbtn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          border-radius: 12px;
          font-size: 14.5px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s ease;
          cursor: pointer;
          border: none;
          font-family: inherit;
        }
        .hbtn-primary {
          background: linear-gradient(135deg, #7c6ef5 0%, #38b2ac 100%);
          color: #fff;
          box-shadow: 0 0 0 1px rgba(124,110,245,0.3), 0 8px 28px rgba(108,95,245,0.45);
        }
        .hbtn-primary:hover {
          box-shadow: 0 0 0 1px rgba(124,110,245,0.5), 0 12px 36px rgba(108,95,245,0.65);
          transform: translateY(-2px);
        }
        .hbtn-ghost {
          background: rgba(255,255,255,0.05);
          color: rgba(221,221,240,0.85);
          border: 1px solid rgba(255,255,255,0.12);
          backdrop-filter: blur(12px);
        }
        .hbtn-ghost:hover {
          background: rgba(255,255,255,0.09);
          border-color: rgba(255,255,255,0.25);
          color: #ffffff;
          transform: translateY(-1px);
        }
        .hbtn-xl { padding: 15px 30px; font-size: 16px; border-radius: 14px; }
        .play-icon { font-size: 11px; opacity: 0.8; }

        .hero-stats {
          display: flex;
          gap: 28px;
          padding-top: 14px;
          border-top: 1px solid rgba(255,255,255,0.08);
        }
        .hstat { display: flex; flex-direction: column; gap: 2px; }
        .hstat-value {
          font-size: 24px;
          font-weight: 800;
          color: #ffffff;
          letter-spacing: -1px;
          background: linear-gradient(180deg, #ffffff, #c4b5fd);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .hstat-label { font-size: 12px; color: rgba(221,221,240,0.45); font-weight: 500; }

        /* === HERO RIGHT VISUALIZER === */
        .hero-right {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }

        .ring-wrap {
          position: relative;
          width: 220px;
          height: 220px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ring {
          position: absolute;
          border-radius: 50%;
          border: 1px solid transparent;
        }
        .ring-outer {
          inset: 0;
          border-color: rgba(124, 110, 245, 0.25);
          animation: spin 30s linear infinite;
        }
        .ring-mid {
          inset: 24px;
          border-color: rgba(56, 178, 172, 0.3);
          animation: spin 20s linear infinite reverse;
        }
        .ring-inner {
          inset: 48px;
          border-color: rgba(246, 173, 85, 0.35);
          animation: spin 15s linear infinite;
        }
        .ring-core {
          width: 76px;
          height: 76px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(22, 18, 56, 0.95) 0%, rgba(12, 10, 36, 0.95) 100%);
          border: 1px solid rgba(124, 110, 245, 0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 35px rgba(124, 110, 245, 0.45);
          z-index: 2;
        }

        .orbit {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
        }
        .orbit-1 { inset: 0; animation: spin 20s linear infinite; }
        .orbit-2 { inset: 24px; animation: spin 15s linear infinite reverse; }
        .orbit-3 { inset: 48px; animation: spin 10s linear infinite; }
        .orbit-dot {
          width: 10px; height: 10px;
          border-radius: 50%;
          position: absolute;
          top: -5px; left: 50%;
          transform: translateX(-50%);
          box-shadow: 0 0 12px currentColor;
        }
        @keyframes spin { 100% { transform: rotate(360deg); } }

        .feed-panel {
          width: 100%;
          background: rgba(13, 11, 38, 0.7);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(124, 110, 245, 0.25);
          border-radius: 20px;
          padding: 20px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.1);
        }
        .feed-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 14px;
          margin-bottom: 14px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          gap: 12px;
          flex-wrap: wrap;
        }
        .feed-title-wrap { display: flex; align-items: center; gap: 10px; }
        .feed-title { font-size: 14px; font-weight: 700; color: #ffffff; }
        .feed-live {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11.5px;
          color: #38b2ac;
          background: rgba(56, 178, 172, 0.12);
          padding: 2px 8px;
          border-radius: 999px;
          border: 1px solid rgba(56, 178, 172, 0.3);
        }
        .feed-live-dot {
          width: 6px; height: 6px; border-radius: 50%; background: #38b2ac;
          box-shadow: 0 0 6px #38b2ac; animation: blink 1.5s infinite;
        }
        .feed-filter-tabs { display: flex; gap: 4px; background: rgba(0,0,0,0.3); padding: 3px; border-radius: 8px; }
        .feed-filter-btn {
          border: none; background: transparent; color: rgba(221,221,240,0.5);
          padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 600;
          cursor: pointer; transition: all 0.15s;
        }
        .feed-filter-btn.active, .feed-filter-btn:hover {
          color: #fff; background: rgba(124,110,245,0.3);
        }

        .feed-scroll {
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-height: 250px;
          overflow-y: auto;
          padding-right: 4px;
        }
        .feed-row {
          display: flex;
          gap: 12px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 12px;
          padding: 12px;
          transition: background 0.2s, border-color 0.2s, transform 0.15s;
          animation: fadeIn 0.4s ease-out forwards;
        }
        .feed-row:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(124, 110, 245, 0.3);
          transform: translateX(4px);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .sentiment-bar { width: 4px; border-radius: 4px; flex-shrink: 0; }
        .feed-row-body { flex: 1; display: flex; flex-direction: column; gap: 6px; }
        .feed-text { font-size: 13px; color: rgba(230, 230, 245, 0.9); line-height: 1.4; }
        .feed-tags { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .feed-tag {
          font-size: 10.5px; font-weight: 700; padding: 2px 8px; border-radius: 6px; text-transform: uppercase;
        }
        .feed-tag-theme { background: rgba(255,255,255,0.08); color: rgba(221,221,240,0.7); font-weight: 500; text-transform: none; }
        .feed-score { font-size: 11px; font-weight: 700; color: rgba(221,221,240,0.5); margin-left: auto; }

        /* === MARQUEE === */
        .marquee-wrap {
          width: 100%;
          overflow: hidden;
          background: rgba(10, 8, 30, 0.5);
          border-y: 1px solid rgba(255, 255, 255, 0.06);
          padding: 16px 0;
          position: relative;
          z-index: 1;
        }
        .marquee-track {
          display: flex;
          gap: 32px;
          width: max-content;
          animation: marquee 35s linear infinite;
        }
        .marquee-item {
          display: flex; align-items: center; gap: 8px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 8px 16px; border-radius: 999px; font-size: 13px; font-weight: 600; color: rgba(221, 221, 240, 0.85);
        }
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }

        /* === SANDBOX SECTION === */
        .sandbox-section {
          max-width: 1240px;
          margin: 0 auto;
          padding: 100px 28px 60px;
          position: relative;
          z-index: 1;
        }
        .sandbox-container {
          background: radial-gradient(circle at 50% 0%, rgba(124, 110, 245, 0.15), rgba(13, 11, 38, 0.8) 70%);
          border: 1px solid rgba(124, 110, 245, 0.3);
          border-radius: 24px;
          padding: 40px;
          backdrop-filter: blur(20px);
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.6);
        }
        .sandbox-header { text-align: center; margin-bottom: 24px; }
        .eyebrow-badge {
          display: inline-block; font-size: 12px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase;
          color: #38b2ac; background: rgba(56, 178, 172, 0.12); border: 1px solid rgba(56, 178, 172, 0.3);
          padding: 4px 14px; border-radius: 999px; margin-bottom: 12px;
        }
        .section-h2 {
          font-size: clamp(28px, 3.5vw, 44px); font-weight: 800; color: #ffffff; letter-spacing: -1.5px; line-height: 1.15;
        }
        .section-sub { font-size: 15px; color: rgba(221, 221, 240, 0.6); margin-top: 8px; }

        .preset-row { display: flex; align-items: center; justify-content: center; gap: 10px; flex-wrap: wrap; margin-bottom: 24px; }
        .preset-label { font-size: 12.5px; font-weight: 600; color: rgba(221,221,240,0.5); }
        .preset-btn {
          border: 1px solid rgba(255, 255, 255, 0.12); background: rgba(255, 255, 255, 0.05); color: rgba(221, 221, 240, 0.85);
          padding: 6px 14px; border-radius: 8px; font-size: 12.5px; font-weight: 600; cursor: pointer; transition: all 0.18s;
        }
        .preset-btn:hover { background: rgba(124, 110, 245, 0.2); border-color: rgba(124, 110, 245, 0.4); color: #ffffff; }

        .sandbox-card { display: flex; flex-direction: column; gap: 24px; }
        .sandbox-label { font-size: 13px; font-weight: 700; color: rgba(221, 221, 240, 0.8); margin-bottom: 8px; display: block; }
        .sandbox-input-wrapper { display: flex; gap: 12px; }
        .sandbox-input {
          flex: 1; background: rgba(5, 5, 18, 0.7); border: 1px solid rgba(255, 255, 255, 0.14); border-radius: 12px;
          padding: 14px 18px; color: #ffffff; font-size: 14.5px; outline: none; transition: border-color 0.2s;
        }
        .sandbox-input:focus { border-color: #7c6ef5; box-shadow: 0 0 0 3px rgba(124, 110, 245, 0.25); }
        .sandbox-submit-btn {
          display: inline-flex; align-items: center; gap: 8px; padding: 0 24px; border-radius: 12px;
          background: linear-gradient(135deg, #7c6ef5 0%, #38b2ac 100%); color: #ffffff; font-weight: 700;
          font-size: 14px; border: none; cursor: pointer; transition: transform 0.15s, box-shadow 0.2s;
        }
        .sandbox-submit-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(108,95,245,0.4); }
        .sandbox-spinner {
          width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #ffffff;
          border-radius: 50%; animation: spin 0.8s linear infinite;
        }

        .sandbox-output {
          background: rgba(5, 5, 18, 0.6); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; padding: 20px;
          display: flex; flex-direction: column; gap: 16px;
        }
        .output-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 10px; }
        .output-title { font-size: 13px; font-weight: 700; color: #38b2ac; }
        .vector-tag { font-family: monospace; font-size: 11px; color: rgba(221,221,240,0.5); background: rgba(255,255,255,0.05); padding: 2px 8px; border-radius: 4px; }
        .output-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; }
        .output-stat { display: flex; flex-direction: column; gap: 6px; }
        .stat-name { font-size: 11.5px; font-weight: 600; color: rgba(221,221,240,0.5); }
        .sentiment-result-badge {
          display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 8px; border: 1px solid;
          font-size: 12px; font-weight: 800; width: fit-content;
        }
        .sentiment-result-badge .dot { width: 6px; height: 6px; border-radius: 50%; }
        .score-bar-wrap { display: flex; align-items: center; gap: 10px; background: rgba(255,255,255,0.06); height: 28px; border-radius: 8px; padding: 4px 10px; position: relative; overflow: hidden; }
        .score-bar-fill { position: absolute; left: 0; top: 0; bottom: 0; border-radius: 8px; opacity: 0.35; transition: width 0.4s ease; }
        .score-num { position: relative; font-size: 13px; font-weight: 800; color: #fff; z-index: 1; }
        .theme-pill { display: inline-block; background: rgba(124, 110, 245, 0.16); color: #bfa9ff; border: 1px solid rgba(124, 110, 245, 0.3); font-size: 12.5px; font-weight: 700; padding: 6px 12px; border-radius: 8px; width: fit-content; }
        .output-action { display: flex; gap: 8px; font-size: 13.5px; background: rgba(255,255,255,0.03); padding: 12px; border-radius: 10px; border: 1px dashed rgba(255,255,255,0.1); }
        .action-label { font-weight: 700; color: #f6ad55; }
        .action-val { color: rgba(221,221,240,0.9); }

        /* === BENTO FEATURES === */
        .bento-section {
          max-width: 1240px; margin: 0 auto; padding: 80px 28px; position: relative; z-index: 1;
        }
        .bento-header { text-align: center; margin-bottom: 48px; }
        .eyebrow { font-size: 12.5px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #7c6ef5; margin-bottom: 8px; }
        .bento-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;
        }
        .bcard {
          position: relative; background: rgba(13, 11, 38, 0.6); border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 20px; padding: 28px; backdrop-filter: blur(16px); overflow: hidden; transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
        }
        .bcard:hover {
          transform: translateY(-4px); border-color: rgba(124, 110, 245, 0.4);
          box-shadow: 0 16px 40px rgba(0,0,0,0.5), 0 0 30px rgba(124,110,245,0.15);
        }
        .bcard-no { font-size: 54px; font-weight: 900; color: rgba(221,221,240,0.08); position: absolute; top: 16px; right: 24px; line-height: 1; letter-spacing: -2px; pointer-events: none; user-select: none; }
        .bcard-lg { grid-column: span 2; }
        .bcard-md { grid-column: span 1; }
        .bcard-sm { grid-column: span 1; }
        .bcard-icon-xl { font-size: 36px; margin-bottom: 16px; }
        .bcard-icon-md { font-size: 28px; margin-bottom: 12px; display: inline-block; }
        .bcard-icon-sm { font-size: 24px; margin-bottom: 10px; display: inline-block; }
        .bcard-title { font-size: 24px; font-weight: 800; color: #ffffff; line-height: 1.2; margin-bottom: 12px; }
        .bcard-title-sm { font-size: 18px; font-weight: 700; color: #ffffff; margin-bottom: 8px; }
        .bcard-title-xs { font-size: 16px; font-weight: 700; color: #ffffff; margin-bottom: 6px; }
        .bcard-desc { font-size: 14.5px; color: rgba(221,221,240,0.65); line-height: 1.6; margin-bottom: 20px; max-width: 440px; }
        .bcard-desc-sm { font-size: 13.5px; color: rgba(221,221,240,0.6); line-height: 1.5; margin-bottom: 16px; }
        .bcard-desc-xs { font-size: 13px; color: rgba(221,221,240,0.55); line-height: 1.4; }
        .bcard-pill { display: inline-block; font-size: 12px; font-weight: 600; color: #bfa9ff; background: rgba(124, 110, 245, 0.15); border: 1px solid rgba(124, 110, 245, 0.3); padding: 4px 12px; border-radius: 999px; }
        .rbac-chips { display: flex; gap: 8px; }
        .rbac-chip { font-size: 11.5px; font-weight: 700; padding: 4px 10px; border-radius: 6px; border: 1px solid; background: rgba(0,0,0,0.3); }
        .source-dots { display: flex; gap: 12px; }
        .source-dot { display: flex; align-items: center; gap: 6px; font-size: 11.5px; color: rgba(221,221,240,0.7); }
        .source-dot-gfx { width: 8px; height: 8px; border-radius: 50%; background: #f6ad55; box-shadow: 0 0 8px #f6ad55; }

        /* === AI SUITE === */
        .ai-section { max-width: 1240px; margin: 0 auto; padding: 80px 28px; position: relative; z-index: 1; }
        .ai-header { text-align: center; margin-bottom: 60px; }
        .grad-word { background: linear-gradient(120deg, #7c6ef5, #38b2ac); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .ai-subhead { font-size: 15px; color: rgba(221,221,240,0.55); margin-top: 10px; }

        .ai-timeline { display: flex; flex-direction: column; gap: 32px; max-width: 900px; margin: 0 auto; }
        .ai-row { display: flex; gap: 24px; align-items: flex-start; }
        .ai-row-num { font-size: 20px; font-weight: 800; font-family: monospace; width: 32px; }
        .ai-row-line { display: flex; flex-direction: column; align-items: center; position: relative; min-height: 120px; }
        .ai-row-dot { width: 14px; height: 14px; border-radius: 50%; margin-top: 6px; z-index: 1; }
        .ai-row-vline { width: 2px; flex: 1; margin-top: 6px; }
        .ai-row-body {
          flex: 1; background: rgba(13, 11, 38, 0.6); border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 18px; padding: 24px; backdrop-filter: blur(16px); transition: border-color 0.2s;
        }
        .ai-row-body:hover { border-color: var(--ac); }
        .ai-row-meta { font-size: 12px; font-weight: 600; color: rgba(221,221,240,0.5); margin-bottom: 4px; }
        .ai-row-title { font-size: 20px; font-weight: 800; color: #ffffff; margin-bottom: 8px; }
        .ai-row-desc { font-size: 14px; color: rgba(221,221,240,0.65); line-height: 1.6; margin-bottom: 16px; }
        .ai-row-tags { display: flex; gap: 8px; flex-wrap: wrap; }
        .ai-tag { font-size: 11.5px; font-weight: 600; padding: 4px 10px; border-radius: 6px; border: 1px solid; }

        /* === PROCESS === */
        .process-section { max-width: 1240px; margin: 0 auto; padding: 80px 28px; position: relative; z-index: 1; }
        .process-steps { display: grid; grid-template-columns: repeat(5, 1fr); gap: 24px; margin-top: 36px; }
        .pstep { position: relative; }
        .pstep-arrow { position: absolute; right: -20px; top: 50%; transform: translateY(-50%); width: 16px; text-align: center; font-size: 20px; font-weight: 600; color: rgba(221,221,240,0.45); z-index: 2; pointer-events: none; }
        .pstep-card {
          background: rgba(13, 11, 38, 0.6); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 16px 14px; text-align: center;
          position: relative; backdrop-filter: blur(16px); min-height: 155px; display: flex; flex-direction: column; align-items: center; justify-content: center; overflow: hidden;
        }
        .pstep-card:hover { border-color: var(--pc); transform: translateY(-3px); }
        .pstep-icon { font-size: 24px; margin-bottom: 6px; }
        .pstep-verb { font-size: 14px; font-weight: 800; margin-bottom: 4px; }
        .pstep-desc { font-size: 11.5px; color: rgba(221,221,240,0.55); line-height: 1.4; }
        .pstep-num { position: absolute; bottom: 2px; right: 10px; font-size: 38px; font-weight: 900; color: rgba(221,221,240,0.08); line-height: 1; letter-spacing: -2px; pointer-events: none; user-select: none; }

        /* === DEMO CREDENTIALS === */
        .demo-section {
          max-width: 1240px; margin: 0 auto; padding: 80px 28px; display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: center; position: relative; z-index: 1;
        }
        .demo-h2 { margin-top: 8px; margin-bottom: 16px; }
        .demo-desc { font-size: 15px; color: rgba(221,221,240,0.6); line-height: 1.6; margin-bottom: 24px; }
        .creds-card { background: rgba(13, 11, 38, 0.7); border: 1px solid rgba(124, 110, 245, 0.3); border-radius: 20px; padding: 24px; backdrop-filter: blur(20px); }
        .creds-label { font-size: 12px; font-weight: 700; text-transform: uppercase; color: rgba(221,221,240,0.5); margin-bottom: 16px; }
        .cred-row {
          display: flex; align-items: center; justify-content: space-between; padding: 12px; border-radius: 10px; background: rgba(255,255,255,0.03); margin-bottom: 8px;
          cursor: pointer; border: 1px solid transparent; transition: all 0.18s;
        }
        .cred-row:hover { background: rgba(124,110,245,0.15); border-color: rgba(124,110,245,0.4); }
        .cred-row.copied { background: rgba(56,178,172,0.18); border-color: #38b2ac; }
        .cred-role-wrap { display: flex; align-items: center; gap: 8px; }
        .cred-role-dot { width: 8px; height: 8px; border-radius: 50%; }
        .cred-role { font-size: 13px; font-weight: 700; }
        .cred-email { font-size: 12.5px; font-family: monospace; color: rgba(221,221,240,0.8); }
        .cred-pw { font-size: 12px; font-family: monospace; color: rgba(221,221,240,0.4); }

        .demo-features { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 20px; }
        .demo-feat { font-size: 12.5px; font-weight: 600; color: #38b2ac; background: rgba(56,178,172,0.08); border: 1px solid rgba(56,178,172,0.2); padding: 8px 12px; border-radius: 8px; }

        /* === CTA === */
        .cta-section {
          max-width: 1240px; margin: 60px auto; padding: 80px 28px; text-align: center; position: relative; z-index: 1; overflow: hidden;
        }
        .cta-inner {
          background: radial-gradient(circle at 50% 0%, rgba(124, 110, 245, 0.25), rgba(13, 11, 38, 0.9) 70%);
          border: 1px solid rgba(124, 110, 245, 0.4); border-radius: 28px; padding: 60px 28px; backdrop-filter: blur(24px);
          box-shadow: 0 24px 80px rgba(0,0,0,0.7);
        }
        .cta-logo-wrap { position: relative; display: inline-block; margin-bottom: 20px; }
        .cta-logo { border-radius: 16px; position: relative; z-index: 1; }
        .cta-logo-glow { position: absolute; inset: -10px; background: radial-gradient(circle, #7c6ef5, transparent 70%); filter: blur(12px); }
        .cta-h2 { font-size: clamp(32px, 4vw, 54px); font-weight: 800; color: #ffffff; line-height: 1.1; margin-bottom: 12px; letter-spacing: -1.5px; }
        .cta-sub { font-size: 16px; color: rgba(221,221,240,0.65); margin-bottom: 32px; }
        .cta-btns { display: flex; justify-content: center; gap: 16px; flex-wrap: wrap; }

        /* === FOOTER === */
        .footer { border-top: 1px solid rgba(255,255,255,0.08); padding: 40px 28px; position: relative; z-index: 1; }
        .footer-inner { max-width: 1240px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 20px; }
        .footer-brand { display: flex; align-items: center; gap: 10px; font-size: 13.5px; }
        .footer-name { font-weight: 800; color: #ffffff; }
        .footer-sep { color: rgba(221,221,240,0.3); }
        .footer-tag { color: rgba(221,221,240,0.5); }
        .footer-links { display: flex; gap: 20px; }
        .fl { font-size: 13px; color: rgba(221,221,240,0.6); text-decoration: none; transition: color 0.15s; }
        .fl:hover { color: #ffffff; }
        .footer-copy { width: 100%; text-align: center; font-size: 12px; color: rgba(221,221,240,0.35); margin-top: 20px; }

        /* RESPONSIVE */
        @media (max-width: 992px) {
          .hero { grid-template-columns: 1fr; text-align: center; padding-top: 120px; }
          .hero-left { align-items: center; }
          .hero-desc { max-width: 100%; }
          .bento-grid { grid-template-columns: 1fr; }
          .bcard-lg, .bcard-md, .bcard-sm { grid-column: span 1; }
          .process-steps { grid-template-columns: 1fr; }
          .pstep-arrow { display: none; }
          .demo-section { grid-template-columns: 1fr; text-align: center; }
        }
      `}</style>
    </div>
  );
}
