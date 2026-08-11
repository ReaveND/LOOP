import Link from 'next/link';
import Image from 'next/image';

const FEEDBACK_ITEMS = [
  { text: '"The search filters are incredible — saved us hours."', sentiment: 'positive', theme: 'Search UX', score: 0.94 },
  { text: '"Onboarding flow is confusing for new users."', sentiment: 'negative', theme: 'Onboarding', score: 0.21 },
  { text: '"API response times are consistently under 50ms."', sentiment: 'positive', theme: 'Performance', score: 0.91 },
  { text: '"Mobile layout breaks on iPad landscape view."', sentiment: 'negative', theme: 'Mobile UX', score: 0.18 },
  { text: '"Love the dark mode — my eyes thank you."', sentiment: 'positive', theme: 'Accessibility', score: 0.88 },
  { text: '"Pricing page needs more clarity on tiers."', sentiment: 'neutral', theme: 'Pricing', score: 0.5 },
  { text: '"Export to PDF is flawless every time."', sentiment: 'positive', theme: 'Reporting', score: 0.96 },
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

export default function LandingPage() {
  return (
    <div className="lr">
      {/* ── SVG noise texture filter ── */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <filter id="noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
          <feBlend in="SourceGraphic" mode="overlay" result="blend" />
          <feComposite in="blend" in2="SourceGraphic" operator="in" />
        </filter>
      </svg>

      {/* ── Mesh background ── */}
      <div className="mesh-bg" aria-hidden="true">
        <div className="mesh-layer mesh-a" />
        <div className="mesh-layer mesh-b" />
        <div className="mesh-layer mesh-c" />
        <div className="grid-lines" />
      </div>

      {/* ─────────────── NAVBAR ─────────────── */}
      <nav className="nav">
        <div className="nav-inner">
          <div className="nav-brand">
            <Image src="/loop_logo.png" alt="LOOP" width={32} height={32} className="nav-logo-img" />
            <span className="nav-wordmark">LOOP</span>
          </div>

          <div className="nav-center">
            <a href="#features" className="nav-link">Platform</a>
            <a href="#ai" className="nav-link">AI Suite</a>
            <a href="#process" className="nav-link">Process</a>
            <a href="#demo" className="nav-link">Demo</a>
          </div>

          <div className="nav-end">
            <Link href="/login" className="nav-signin">Sign in</Link>
            <Link href="/signup" className="nav-cta">
              <span>Get started</span>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7h8M7.5 3.5L11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
          </div>
        </div>
      </nav>

      {/* ─────────────── HERO ─────────────── */}
      <section className="hero">
        <div className="hero-left">
          {/* Status pill */}
          <div className="status-pill">
            <span className="status-dot" />
            <span>Live · AI processing feedback</span>
          </div>

          {/* Headline */}
          <h1 className="hero-h1">
            <span className="h1-line h1-line-1">Customer</span>
            <span className="h1-line h1-line-2">
              feedback,
              <span className="h1-accent"> finally</span>
            </span>
            <span className="h1-line h1-line-3">understood.</span>
          </h1>

          <p className="hero-desc">
            LOOP turns scattered customer signals into ranked, evidence-backed decisions.
            Multi-tenant · AI-classified · Ready in minutes.
          </p>

          <div className="hero-btns">
            <Link href="/signup" className="hbtn hbtn-primary">
              Start building
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M8.5 3.5L13 8l-4.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
            <Link href="/login" className="hbtn hbtn-ghost">
              <span className="play-icon">▶</span>
              View live demo
            </Link>
          </div>

          {/* Micro stats */}
          <div className="hero-stats">
            {[
              { value: '120+', label: 'Seeded items' },
              { value: '4', label: 'AI engines' },
              { value: '3', label: 'Access roles' },
              { value: '<1s', label: 'AI classify' },
            ].map((s) => (
              <div className="hstat" key={s.label}>
                <span className="hstat-value">{s.value}</span>
                <span className="hstat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: Live Feed visualization ── */}
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

          {/* Live feedback feed */}
          <div className="feed-panel">
            <div className="feed-header">
              <span className="feed-title">Live Inbox</span>
              <span className="feed-live"><span className="feed-live-dot" />Processing</span>
            </div>
            <div className="feed-scroll">
              {FEEDBACK_ITEMS.map((item, i) => (
                <div className="feed-row" key={i} style={{ animationDelay: `${i * 0.15}s` }}>
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
                          background: item.sentiment === 'positive' ? 'rgba(56,178,172,0.12)'
                            : item.sentiment === 'negative' ? 'rgba(252,129,129,0.12)' : 'rgba(246,173,85,0.12)',
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

          {/* Ask LOOP mini chip */}
          <div className="ask-chip">
            <span className="ask-icon">💬</span>
            <span className="ask-text">
              <span className="ask-dim">Ask LOOP: </span>
              "What do users hate about onboarding?"
            </span>
            <span className="ask-enter">↵</span>
          </div>
        </div>
      </section>

      {/* ─────────────── MARQUEE ─────────────── */}
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

      {/* ─────────────── BENTO FEATURES ─────────────── */}
      <section id="features" className="bento-section">
        <div className="bento-header">
          <p className="eyebrow">Core Platform</p>
          <h2 className="section-h2">Everything, in one loop.</h2>
        </div>

        <div className="bento-grid">
          {/* Large card — Multi-tenant */}
          <div className="bcard bcard-lg bcard-purple">
            <div className="bcard-no">01</div>
            <div className="bcard-icon-xl">🏢</div>
            <h3 className="bcard-title">Multi-Tenant<br />Workspaces</h3>
            <p className="bcard-desc">
              Every workspace is a fortress. Data is isolated at the query level — not just the UI.
              No row from Company A can ever bleed into Company B.
            </p>
            <div className="bcard-pill">Workspace-scoped queries</div>
          </div>

          {/* Medium — RBAC */}
          <div className="bcard bcard-md bcard-teal">
            <div className="bcard-no">02</div>
            <span className="bcard-icon-md">🔐</span>
            <h3 className="bcard-title-sm">Role-Based Access</h3>
            <p className="bcard-desc-sm">Admin · Analyst · Viewer — enforced server-side.</p>
            <div className="rbac-chips">
              {[{ r: 'Admin', c: '#7c6ef5' }, { r: 'Analyst', c: '#38b2ac' }, { r: 'Viewer', c: '#f6ad55' }].map(x => (
                <span className="rbac-chip" key={x.r} style={{ borderColor: x.c, color: x.c }}>{x.r}</span>
              ))}
            </div>
          </div>

          {/* Medium — Ingestion */}
          <div className="bcard bcard-md bcard-amber">
            <div className="bcard-no">03</div>
            <span className="bcard-icon-md">📥</span>
            <h3 className="bcard-title-sm">Multi-Channel Ingestion</h3>
            <p className="bcard-desc-sm">Single entry, bulk CSV, or simulated sources — all into one inbox.</p>
            <div className="source-dots">
              {['Email', 'Survey', 'Support', 'CSV'].map((s, i) => (
                <div className="source-dot" key={s} style={{ animationDelay: `${i * 0.3}s` }}>
                  <div className="source-dot-gfx" />
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Small — Inbox */}
          <div className="bcard bcard-sm bcard-glass">
            <div className="bcard-no">04</div>
            <span className="bcard-icon-sm">🔍</span>
            <h3 className="bcard-title-xs">Smart Inbox</h3>
            <p className="bcard-desc-xs">Full-text search + 6 filter dimensions. Every item, instantly found.</p>
          </div>

          {/* Small — Analytics */}
          <div className="bcard bcard-sm bcard-glass">
            <div className="bcard-no">05</div>
            <span className="bcard-icon-sm">📊</span>
            <h3 className="bcard-title-xs">Analytics</h3>
            <p className="bcard-desc-xs">Volume, sentiment, themes — real DB data, rendered with Recharts.</p>
          </div>

          {/* Small — Workflow */}
          <div className="bcard bcard-sm bcard-glass">
            <div className="bcard-no">06</div>
            <span className="bcard-icon-sm">⚡</span>
            <h3 className="bcard-title-xs">Status Workflow</h3>
            <p className="bcard-desc-xs">NEW → REVIEWED → ACTIONED. Track every item to resolution.</p>
          </div>
        </div>
      </section>

      {/* ─────────────── AI SUITE ─────────────── */}
      <section id="ai" className="ai-section">
        <div className="ai-header">
          <p className="eyebrow">AI Suite</p>
          <h2 className="section-h2">
            Four engines.<br />One continuous <span className="grad-word">loop.</span>
          </h2>
          <p className="ai-subhead">All AI runs server-side. Your API key never reaches the browser.</p>
        </div>

        <div className="ai-timeline">
          {[
            {
              n: '01', color: '#7c6ef5',
              title: 'Auto-Classification',
              sub: 'Groq API · Runs on ingest',
              desc: 'Every feedback item is automatically tagged with sentiment, score, theme(s), and feature area. Results are persisted — zero recompute on render.',
              tags: ['Sentiment', 'Score 0–1', 'Theme tagging', 'Feature area'],
            },
            {
              n: '02', color: '#38b2ac',
              title: 'Theme Clustering & Trends',
              sub: 'pgvector · Spike detection',
              desc: 'Feedback clusters into named themes by semantic similarity. Spike detection flags any theme growing >50% vs the prior period — with a single click to drill in.',
              tags: ['>50% spike', 'Named themes', 'Trend delta', 'Click-to-drill'],
            },
            {
              n: '03', color: '#9f7aea',
              title: 'Ask LOOP — RAG Q&A',
              sub: 'Semantic search · Cited sources',
              desc: 'Type any plain-English question. LOOP embeds it, finds the most relevant feedback via pgvector, then answers using only that data — with cited source links.',
              tags: ['Semantic embed', 'pgvector search', 'Cited sources', 'Plain English'],
            },
            {
              n: '04', color: '#f6ad55',
              title: 'Voice-of-Customer Reports',
              sub: 'One-click · PDF export',
              desc: 'Generate a full VoC report for any time period. Real stats are pre-computed, then Groq writes the narrative. Saved to DB, shareable, exportable as PDF.',
              tags: ['One-click', 'Real data', 'AI narrative', 'PDF export'],
            },
          ].map((ai, i) => (
            <div className="ai-row" key={ai.n}>
              <div className="ai-row-num" style={{ color: ai.color }}>{ai.n}</div>
              <div className="ai-row-line">
                <div className="ai-row-dot" style={{ background: ai.color, boxShadow: `0 0 12px ${ai.color}` }} />
                {i < 3 && <div className="ai-row-vline" style={{ background: `linear-gradient(to bottom, ${ai.color}, transparent)` }} />}
              </div>
              <div className="ai-row-body" style={{ '--ac': ai.color } as React.CSSProperties}>
                <div className="ai-row-meta">{ai.sub}</div>
                <h3 className="ai-row-title">{ai.title}</h3>
                <p className="ai-row-desc">{ai.desc}</p>
                <div className="ai-row-tags">
                  {ai.tags.map(t => (
                    <span className="ai-tag" key={t} style={{ borderColor: `${ai.color}40`, color: ai.color }}>{t}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────────── PROCESS ─────────────── */}
      <section id="process" className="process-section">
        <p className="eyebrow text-center">How It Works</p>
        <h2 className="section-h2 text-center">Raw signal → clear decision.</h2>

        <div className="process-steps">
          {[
            { n: '01', verb: 'Ingest', icon: '📨', color: '#7c6ef5', desc: 'Collect from email, tickets, surveys, CSV.' },
            { n: '02', verb: 'Classify', icon: '🤖', color: '#38b2ac', desc: 'Groq tags sentiment, score, theme, area.' },
            { n: '03', verb: 'Cluster', icon: '🧠', color: '#9f7aea', desc: 'pgvector groups into named themes.' },
            { n: '04', verb: 'Query', icon: '💬', color: '#f6ad55', desc: 'Ask LOOP anything in plain English.' },
            { n: '05', verb: 'Report', icon: '🚀', color: '#fc8181', desc: 'One-click VoC report. Ship the right thing.' },
          ].map((s, i) => (
            <div className="pstep" key={s.n}>
              {i > 0 && <div className="pstep-arrow">→</div>}
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

      {/* ─────────────── DEMO ─────────────── */}
      <section id="demo" className="demo-section">
        <div className="demo-left">
          <p className="eyebrow">Live Demo</p>
          <h2 className="section-h2 demo-h2">Try it.<br />Right now.</h2>
          <p className="demo-desc">
            A fully seeded workspace with 120+ realistic feedback items is waiting.
            All three roles are pre-configured.
          </p>
          <Link href="/login" className="hbtn hbtn-primary demo-btn">
            Open dashboard →
          </Link>
        </div>

        <div className="demo-right">
          <div className="creds-card">
            <div className="creds-label">Demo credentials</div>
            {[
              { role: 'Admin', color: '#7c6ef5', email: 'admin@demo.com', pw: 'password123' },
              { role: 'Analyst', color: '#38b2ac', email: 'analyst@demo.com', pw: 'password123' },
              { role: 'Viewer', color: '#f6ad55', email: 'viewer@demo.com', pw: 'password123' },
            ].map(c => (
              <div className="cred-row" key={c.role}>
                <div className="cred-role-wrap">
                  <div className="cred-role-dot" style={{ background: c.color }} />
                  <span className="cred-role" style={{ color: c.color }}>{c.role}</span>
                </div>
                <span className="cred-email">{c.email}</span>
                <span className="cred-pw">{c.pw}</span>
              </div>
            ))}
          </div>

          <div className="demo-features">
            {[
              '✓ 120+ seeded feedback items',
              '✓ All AI features active',
              '✓ Pre-built themes + trends',
              '✓ Sample VoC reports',
            ].map(f => <div className="demo-feat" key={f}>{f}</div>)}
          </div>
        </div>
      </section>

      {/* ─────────────── CTA ─────────────── */}
      <section className="cta-section">
        <div className="cta-ring cta-ring-1" />
        <div className="cta-ring cta-ring-2" />
        <div className="cta-inner">
          <div className="cta-logo-wrap">
            <Image src="/loop_logo.png" alt="LOOP" width={64} height={64} className="cta-logo" />
          </div>
          <h2 className="cta-h2">
            Close the loop on<br />
            <span className="grad-word">customer feedback.</span>
          </h2>
          <p className="cta-sub">No credit card. No setup headaches. Just insights.</p>
          <div className="cta-btns">
            <Link href="/signup" className="hbtn hbtn-primary hbtn-xl">
              Get started free
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M8.5 3.5L13 8l-4.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
            <Link href="/login" className="hbtn hbtn-ghost hbtn-xl">View demo</Link>
          </div>
        </div>
      </section>

      {/* ─────────────── FOOTER ─────────────── */}
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

      {/* ─────────────── STYLES ─────────────── */}
      <style>{`
        /* === RESET & BASE === */
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .lr {
          font-family: 'Inter', 'Geist', system-ui, -apple-system, sans-serif;
          background: #050510;
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
        }
        .mesh-layer {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
        }
        .mesh-a {
          width: 700px; height: 700px;
          background: radial-gradient(circle, rgba(124,110,245,0.12) 0%, transparent 70%);
          top: -200px; left: -200px;
          animation: meshFloat 20s ease-in-out infinite;
        }
        .mesh-b {
          width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(56,178,172,0.09) 0%, transparent 70%);
          bottom: -100px; right: -100px;
          animation: meshFloat 25s ease-in-out infinite reverse;
        }
        .mesh-c {
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(159,122,234,0.07) 0%, transparent 70%);
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          animation: meshFloat 18s ease-in-out infinite 5s;
        }
        .grid-lines {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px);
          background-size: 60px 60px;
        }
        @keyframes meshFloat {
          0%, 100% { transform: translate(0,0); }
          33% { transform: translate(40px, -30px); }
          66% { transform: translate(-30px, 40px); }
        }

        /* === NAVBAR === */
        .nav {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 200;
          height: 60px;
          display: flex;
          align-items: center;
        }
        .nav::before {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(5, 5, 16, 0.72);
          backdrop-filter: blur(24px) saturate(1.4);
          -webkit-backdrop-filter: blur(24px) saturate(1.4);
          border-bottom: 1px solid rgba(255,255,255,0.06);
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
          gap: 9px;
        }
        .nav-logo-img { border-radius: 6px; }
        .nav-wordmark {
          font-size: 17px;
          font-weight: 800;
          letter-spacing: -0.5px;
          background: linear-gradient(120deg, #a99cf8, #60d0c8);
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
          color: rgba(221,221,240,0.55);
          text-decoration: none;
          letter-spacing: 0.01em;
          transition: color 0.18s;
        }
        .nav-link:hover { color: #ddddf0; }
        .nav-end { display: flex; align-items: center; gap: 10px; }
        .nav-signin {
          font-size: 13.5px;
          font-weight: 500;
          color: rgba(221,221,240,0.55);
          text-decoration: none;
          padding: 6px 12px;
          border-radius: 8px;
          transition: color 0.18s, background 0.18s;
        }
        .nav-signin:hover { color: #ddddf0; background: rgba(255,255,255,0.05); }
        .nav-cta {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 7px 16px;
          border-radius: 9px;
          font-size: 13.5px;
          font-weight: 600;
          text-decoration: none;
          color: #fff;
          background: linear-gradient(135deg, #6c5ff5 0%, #4c9cc8 100%);
          box-shadow: 0 0 0 1px rgba(124,110,245,0.3), 0 4px 16px rgba(108,95,245,0.35);
          transition: box-shadow 0.2s, transform 0.15s;
        }
        .nav-cta:hover {
          box-shadow: 0 0 0 1px rgba(124,110,245,0.5), 0 6px 24px rgba(108,95,245,0.5);
          transform: translateY(-1px);
        }

        /* === HERO === */
        .hero {
          position: relative;
          z-index: 1;
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
          align-items: center;
          max-width: 1240px;
          margin: 0 auto;
          padding: 80px 28px 60px;
        }
        .hero-left { display: flex; flex-direction: column; gap: 28px; }

        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 5px 14px 5px 10px;
          background: rgba(56,178,172,0.08);
          border: 1px solid rgba(56,178,172,0.22);
          border-radius: 999px;
          font-size: 12.5px;
          font-weight: 500;
          color: #5ddbd3;
          width: fit-content;
        }
        .status-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: #38b2ac;
          box-shadow: 0 0 8px #38b2ac;
          animation: blink 2s ease-in-out infinite;
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        .hero-h1 {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .h1-line {
          display: block;
          font-weight: 800;
          line-height: 1.08;
          letter-spacing: -3px;
          font-size: clamp(44px, 5.5vw, 80px);
          color: #f4f4ff;
        }
        .h1-accent {
          background: linear-gradient(120deg, #a99cf8 0%, #5ecfca 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-style: italic;
        }

        .hero-desc {
          font-size: 16px;
          line-height: 1.7;
          color: rgba(221,221,240,0.5);
          max-width: 440px;
        }

        .hero-btns { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }

        .hbtn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 11px 22px;
          border-radius: 10px;
          font-size: 14.5px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.18s;
          cursor: pointer;
          border: none;
          font-family: inherit;
        }
        .hbtn-primary {
          background: linear-gradient(135deg, #6c5ff5 0%, #4c9cc8 100%);
          color: #fff;
          box-shadow: 0 0 0 1px rgba(124,110,245,0.25), 0 6px 24px rgba(108,95,245,0.4);
        }
        .hbtn-primary:hover {
          box-shadow: 0 0 0 1px rgba(124,110,245,0.4), 0 8px 32px rgba(108,95,245,0.55);
          transform: translateY(-2px);
        }
        .hbtn-ghost {
          background: rgba(255,255,255,0.04);
          color: rgba(221,221,240,0.8);
          border: 1px solid rgba(255,255,255,0.1);
        }
        .hbtn-ghost:hover {
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.2);
          color: #ddddf0;
          transform: translateY(-1px);
        }
        .hbtn-xl { padding: 14px 28px; font-size: 15.5px; border-radius: 12px; }
        .play-icon { font-size: 11px; opacity: 0.7; }

        .hero-stats {
          display: flex;
          gap: 28px;
          padding-top: 8px;
          border-top: 1px solid rgba(255,255,255,0.07);
        }
        .hstat { display: flex; flex-direction: column; gap: 2px; }
        .hstat-value {
          font-size: 22px;
          font-weight: 800;
          color: #f4f4ff;
          letter-spacing: -1px;
        }
        .hstat-label { font-size: 11.5px; color: rgba(221,221,240,0.38); font-weight: 500; }

        /* ── Hero Right ── */
        .hero-right {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        /* Ring animation */
        .ring-wrap {
          position: relative;
          width: 220px;
          height: 220px;
          flex-shrink: 0;
        }
        .ring {
          position: absolute;
          border-radius: 50%;
          border: 1.5px solid;
          animation: spin linear infinite;
        }
        .ring-outer {
          inset: 0;
          border-color: rgba(124,110,245,0.25);
          animation-duration: 18s;
          border-style: dashed;
        }
        .ring-mid {
          inset: 22px;
          border-color: rgba(56,178,172,0.3);
          animation-duration: 12s;
          animation-direction: reverse;
        }
        .ring-inner {
          inset: 44px;
          border-color: rgba(246,173,85,0.2);
          animation-duration: 8s;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .ring-core {
          position: absolute;
          inset: 66px;
          border-radius: 50%;
          background: rgba(124,110,245,0.08);
          border: 1px solid rgba(124,110,245,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(8px);
        }

        /* Orbiting dots */
        .orbit {
          position: absolute;
          top: 50%; left: 50%;
          border-radius: 50%;
          animation: spin linear infinite;
        }
        .orbit-1 { width: 220px; height: 220px; margin: -110px; animation-duration: 18s; }
        .orbit-2 { width: 176px; height: 176px; margin: -88px; animation-duration: 12s; animation-direction: reverse; }
        .orbit-3 { width: 132px; height: 132px; margin: -66px; animation-duration: 8s; }
        .orbit-dot {
          width: 10px; height: 10px;
          border-radius: 50%;
          position: absolute;
          top: -5px; left: 50%;
          margin-left: -5px;
          box-shadow: 0 0 12px currentColor;
        }

        /* Live feed panel */
        .feed-panel {
          width: 100%;
          background: rgba(12,12,32,0.8);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          overflow: hidden;
          backdrop-filter: blur(20px);
          box-shadow: 0 24px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(124,110,245,0.06);
        }
        .feed-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          background: rgba(255,255,255,0.02);
        }
        .feed-title { font-size: 12px; font-weight: 700; color: rgba(221,221,240,0.5); text-transform: uppercase; letter-spacing: 0.08em; }
        .feed-live {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: #38b2ac;
          font-weight: 600;
        }
        .feed-live-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #38b2ac;
          animation: blink 1.5s ease-in-out infinite;
        }
        .feed-scroll {
          max-height: 260px;
          overflow-y: auto;
          scrollbar-width: none;
        }
        .feed-scroll::-webkit-scrollbar { display: none; }
        .feed-row {
          display: flex;
          gap: 10px;
          padding: 10px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          animation: slideIn 0.4s ease-out both;
          transition: background 0.15s;
        }
        .feed-row:hover { background: rgba(255,255,255,0.03); }
        .feed-row:last-child { border-bottom: none; }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .sentiment-bar {
          width: 3px;
          border-radius: 3px;
          flex-shrink: 0;
          align-self: stretch;
          min-height: 32px;
        }
        .feed-row-body { display: flex; flex-direction: column; gap: 5px; min-width: 0; }
        .feed-text {
          font-size: 12px;
          line-height: 1.45;
          color: rgba(221,221,240,0.65);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .feed-tags { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
        .feed-tag {
          padding: 2px 8px;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 600;
        }
        .feed-tag-theme {
          background: rgba(255,255,255,0.06);
          color: rgba(221,221,240,0.45);
        }
        .feed-score { font-size: 10px; color: rgba(221,221,240,0.3); margin-left: auto; font-family: monospace; }

        /* Ask chip */
        .ask-chip {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 16px;
          background: rgba(12,12,32,0.6);
          border: 1px solid rgba(159,122,234,0.2);
          border-radius: 12px;
          backdrop-filter: blur(16px);
        }
        .ask-icon { font-size: 16px; }
        .ask-text { font-size: 12.5px; color: rgba(221,221,240,0.55); flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .ask-dim { color: rgba(221,221,240,0.3); }
        .ask-enter {
          font-size: 14px;
          color: rgba(159,122,234,0.7);
          border: 1px solid rgba(159,122,234,0.2);
          border-radius: 4px;
          padding: 1px 5px;
          font-family: monospace;
          flex-shrink: 0;
        }

        /* === MARQUEE === */
        .marquee-wrap {
          position: relative;
          z-index: 1;
          overflow: hidden;
          border-top: 1px solid rgba(255,255,255,0.05);
          border-bottom: 1px solid rgba(255,255,255,0.05);
          padding: 14px 0;
          background: rgba(255,255,255,0.015);
          mask-image: linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%);
          -webkit-mask-image: linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%);
        }
        .marquee-track {
          display: flex;
          gap: 0;
          width: max-content;
          animation: marquee 32s linear infinite;
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .marquee-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0 28px;
          border-right: 1px solid rgba(255,255,255,0.06);
          white-space: nowrap;
        }
        .marquee-icon { font-size: 15px; }
        .marquee-text { font-size: 13px; font-weight: 600; color: rgba(221,221,240,0.3); letter-spacing: 0.01em; }

        /* === BENTO === */
        .bento-section {
          position: relative;
          z-index: 1;
          max-width: 1240px;
          margin: 0 auto;
          padding: 100px 28px;
        }
        .bento-header { margin-bottom: 52px; }

        .eyebrow {
          display: inline-block;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #7c6ef5;
          margin-bottom: 14px;
        }
        .text-center { text-align: center; }
        .section-h2 {
          font-size: clamp(30px, 4vw, 52px);
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -2px;
          color: #f4f4ff;
        }
        .grad-word {
          background: linear-gradient(120deg, #a99cf8 0%, #5ecfca 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .bento-grid {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          grid-auto-rows: minmax(180px, auto);
          gap: 16px;
        }
        .bcard {
          position: relative;
          border-radius: 20px;
          padding: 28px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(12,12,32,0.7);
          backdrop-filter: blur(20px);
          transition: transform 0.22s, border-color 0.22s, box-shadow 0.22s;
        }
        .bcard:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 60px rgba(0,0,0,0.4);
        }

        /* Spans */
        .bcard-lg { grid-column: span 5; grid-row: span 2; }
        .bcard-md { grid-column: span 4; }
        .bcard-sm { grid-column: span 3; }

        /* Colors */
        .bcard-purple {
          background: linear-gradient(145deg, rgba(108,95,245,0.12) 0%, rgba(12,12,32,0.8) 60%);
          border-color: rgba(108,95,245,0.2);
        }
        .bcard-purple:hover { border-color: rgba(108,95,245,0.4); box-shadow: 0 20px 60px rgba(108,95,245,0.15); }
        .bcard-teal {
          background: linear-gradient(145deg, rgba(56,178,172,0.1) 0%, rgba(12,12,32,0.8) 60%);
          border-color: rgba(56,178,172,0.18);
        }
        .bcard-teal:hover { border-color: rgba(56,178,172,0.35); }
        .bcard-amber {
          background: linear-gradient(145deg, rgba(246,173,85,0.08) 0%, rgba(12,12,32,0.8) 60%);
          border-color: rgba(246,173,85,0.15);
        }
        .bcard-amber:hover { border-color: rgba(246,173,85,0.3); }
        .bcard-glass { background: rgba(255,255,255,0.025); }
        .bcard-glass:hover { border-color: rgba(124,110,245,0.25); }

        .bcard-no {
          position: absolute;
          top: 20px; right: 24px;
          font-size: 64px;
          font-weight: 900;
          color: rgba(255,255,255,0.03);
          line-height: 1;
          letter-spacing: -4px;
          pointer-events: none;
          font-variant-numeric: tabular-nums;
        }
        .bcard-icon-xl { font-size: 40px; margin-bottom: 20px; }
        .bcard-title {
          font-size: 24px;
          font-weight: 800;
          color: #f4f4ff;
          line-height: 1.15;
          letter-spacing: -1px;
          margin-bottom: 14px;
        }
        .bcard-desc {
          font-size: 14px;
          line-height: 1.65;
          color: rgba(221,221,240,0.45);
          margin-bottom: 20px;
        }
        .bcard-pill {
          display: inline-block;
          padding: 4px 14px;
          border-radius: 999px;
          background: rgba(108,95,245,0.15);
          border: 1px solid rgba(108,95,245,0.3);
          font-size: 11px;
          font-weight: 600;
          color: #a99cf8;
          letter-spacing: 0.02em;
        }

        .bcard-icon-md { font-size: 28px; display: block; margin-bottom: 12px; }
        .bcard-title-sm { font-size: 18px; font-weight: 800; color: #f4f4ff; letter-spacing: -0.5px; margin-bottom: 8px; }
        .bcard-desc-sm { font-size: 13px; color: rgba(221,221,240,0.4); line-height: 1.5; margin-bottom: 16px; }

        .rbac-chips { display: flex; gap: 8px; flex-wrap: wrap; }
        .rbac-chip {
          padding: 4px 12px;
          border-radius: 999px;
          border: 1px solid;
          font-size: 11.5px;
          font-weight: 700;
        }

        .source-dots { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 8px; }
        .source-dot { display: flex; flex-direction: column; align-items: center; gap: 5px; font-size: 10px; color: rgba(221,221,240,0.35); }
        .source-dot-gfx {
          width: 28px; height: 28px;
          border-radius: 50%;
          background: rgba(246,173,85,0.15);
          border: 1px solid rgba(246,173,85,0.3);
          animation: sourcePulse 2s ease-in-out infinite both;
        }
        @keyframes sourcePulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.15); opacity: 1; }
        }

        .bcard-icon-sm { font-size: 22px; display: block; margin-bottom: 10px; }
        .bcard-title-xs { font-size: 15px; font-weight: 700; color: #f4f4ff; letter-spacing: -0.3px; margin-bottom: 6px; }
        .bcard-desc-xs { font-size: 12.5px; color: rgba(221,221,240,0.38); line-height: 1.5; }

        /* === AI TIMELINE === */
        .ai-section {
          position: relative;
          z-index: 1;
          max-width: 1240px;
          margin: 0 auto;
          padding: 100px 28px;
        }
        .ai-header { margin-bottom: 72px; }
        .ai-subhead { font-size: 15px; color: rgba(221,221,240,0.4); margin-top: 12px; }

        .ai-timeline { display: flex; flex-direction: column; gap: 0; }
        .ai-row {
          display: grid;
          grid-template-columns: 48px 36px 1fr;
          gap: 0 20px;
          padding-bottom: 48px;
        }
        .ai-row:last-child { padding-bottom: 0; }
        .ai-row-num {
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.06em;
          padding-top: 4px;
          text-align: right;
          opacity: 0.7;
        }
        .ai-row-line { display: flex; flex-direction: column; align-items: center; gap: 0; }
        .ai-row-dot { width: 14px; height: 14px; border-radius: 50%; flex-shrink: 0; margin-top: 2px; }
        .ai-row-vline { width: 1.5px; flex: 1; margin-top: 8px; min-height: 60px; }
        .ai-row-body {
          padding-bottom: 8px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .ai-row:last-child .ai-row-body { border-bottom: none; }
        .ai-row-meta { font-size: 11px; font-weight: 700; color: var(--ac, #7c6ef5); letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 8px; opacity: 0.8; }
        .ai-row-title { font-size: 26px; font-weight: 800; color: #f4f4ff; letter-spacing: -0.8px; margin-bottom: 10px; }
        .ai-row-desc { font-size: 15px; line-height: 1.65; color: rgba(221,221,240,0.45); margin-bottom: 16px; max-width: 640px; }
        .ai-row-tags { display: flex; gap: 8px; flex-wrap: wrap; }
        .ai-tag {
          padding: 3px 12px;
          border-radius: 999px;
          border: 1px solid;
          font-size: 11.5px;
          font-weight: 600;
        }

        /* === PROCESS === */
        .process-section {
          position: relative;
          z-index: 1;
          max-width: 1240px;
          margin: 0 auto;
          padding: 100px 28px;
          text-align: center;
        }
        .process-section .section-h2 { margin: 14px auto 64px; }
        .process-steps {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 0;
        }
        .pstep { display: flex; align-items: center; }
        .pstep-arrow {
          font-size: 22px;
          color: rgba(221,221,240,0.12);
          padding: 0 12px;
          flex-shrink: 0;
        }
        .pstep-card {
          position: relative;
          width: 168px;
          padding: 28px 20px 24px;
          background: rgba(12,12,32,0.7);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 18px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
          backdrop-filter: blur(16px);
        }
        .pstep-card:hover {
          transform: translateY(-6px);
          border-color: var(--pc, rgba(124,110,245,0.4));
          box-shadow: 0 16px 40px rgba(0,0,0,0.3), 0 0 24px color-mix(in srgb, var(--pc) 20%, transparent);
        }
        .pstep-icon { font-size: 28px; }
        .pstep-verb { font-size: 16px; font-weight: 800; letter-spacing: -0.3px; }
        .pstep-desc { font-size: 11.5px; line-height: 1.5; color: rgba(221,221,240,0.4); }
        .pstep-num {
          position: absolute;
          bottom: 10px; right: 14px;
          font-size: 32px;
          font-weight: 900;
          color: rgba(255,255,255,0.04);
          line-height: 1;
          letter-spacing: -2px;
        }

        /* === DEMO === */
        .demo-section {
          position: relative;
          z-index: 1;
          max-width: 1240px;
          margin: 0 auto;
          padding: 100px 28px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 64px;
          align-items: center;
        }
        .demo-left { display: flex; flex-direction: column; gap: 20px; }
        .demo-h2 { letter-spacing: -3px; }
        .demo-desc { font-size: 15px; line-height: 1.7; color: rgba(221,221,240,0.45); }
        .demo-btn { margin-top: 8px; align-self: flex-start; }

        .demo-right { display: flex; flex-direction: column; gap: 16px; }
        .creds-card {
          background: rgba(12,12,32,0.8);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          overflow: hidden;
          backdrop-filter: blur(20px);
        }
        .creds-label {
          padding: 12px 20px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: rgba(221,221,240,0.3);
          background: rgba(255,255,255,0.02);
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .cred-row {
          display: grid;
          grid-template-columns: 90px 1fr auto;
          align-items: center;
          gap: 12px;
          padding: 14px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          transition: background 0.15s;
        }
        .cred-row:last-child { border-bottom: none; }
        .cred-row:hover { background: rgba(255,255,255,0.03); }
        .cred-role-wrap { display: flex; align-items: center; gap: 8px; }
        .cred-role-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
        .cred-role { font-size: 13px; font-weight: 700; }
        .cred-email { font-size: 12.5px; color: rgba(221,221,240,0.45); font-family: 'Geist Mono', monospace; }
        .cred-pw { font-size: 12px; color: rgba(221,221,240,0.3); font-family: 'Geist Mono', monospace; }

        .demo-features { display: flex; flex-direction: column; gap: 8px; }
        .demo-feat { font-size: 13.5px; color: rgba(221,221,240,0.5); padding-left: 4px; }

        /* === CTA === */
        .cta-section {
          position: relative;
          z-index: 1;
          overflow: hidden;
          padding: 140px 28px;
          text-align: center;
          border-top: 1px solid rgba(255,255,255,0.05);
        }
        .cta-ring {
          position: absolute;
          border-radius: 50%;
          border: 1px solid rgba(124,110,245,0.12);
          pointer-events: none;
        }
        .cta-ring-1 {
          width: 600px; height: 600px;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
        }
        .cta-ring-2 {
          width: 900px; height: 900px;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          border-color: rgba(56,178,172,0.06);
        }
        .cta-inner { position: relative; z-index: 2; }
        .cta-logo-wrap {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 88px; height: 88px;
          border-radius: 24px;
          background: rgba(124,110,245,0.08);
          border: 1px solid rgba(124,110,245,0.18);
          margin-bottom: 32px;
        }
        .cta-logo { border-radius: 8px; }
        .cta-h2 {
          font-size: clamp(32px, 4.5vw, 60px);
          font-weight: 800;
          letter-spacing: -2px;
          line-height: 1.1;
          color: #f4f4ff;
          margin-bottom: 16px;
        }
        .cta-sub { font-size: 16px; color: rgba(221,221,240,0.4); margin-bottom: 40px; }
        .cta-btns { display: flex; align-items: center; justify-content: center; gap: 14px; flex-wrap: wrap; }

        /* === FOOTER === */
        .footer {
          position: relative;
          z-index: 1;
          border-top: 1px solid rgba(255,255,255,0.05);
          padding: 32px 28px;
        }
        .footer-inner {
          max-width: 1240px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
        }
        .footer-brand { display: flex; align-items: center; gap: 8px; }
        .footer-name { font-size: 15px; font-weight: 800; color: rgba(221,221,240,0.7); letter-spacing: -0.3px; }
        .footer-sep { color: rgba(221,221,240,0.2); }
        .footer-tag { font-size: 12.5px; color: rgba(221,221,240,0.3); }
        .footer-links { display: flex; gap: 20px; margin-left: auto; }
        .fl { font-size: 13px; color: rgba(221,221,240,0.35); text-decoration: none; transition: color 0.18s; font-weight: 500; }
        .fl:hover { color: rgba(221,221,240,0.7); }
        .footer-copy { width: 100%; font-size: 11.5px; color: rgba(221,221,240,0.18); margin-top: 4px; }

        /* === RESPONSIVE === */
        @media (max-width: 1024px) {
          .hero { grid-template-columns: 1fr; padding-top: 100px; }
          .hero-right { flex-direction: row; align-items: flex-start; gap: 16px; flex-wrap: wrap; }
          .ring-wrap { width: 160px; height: 160px; flex-shrink: 0; }
          .orbit-1 { width: 160px; height: 160px; margin: -80px; }
          .orbit-2 { width: 120px; height: 120px; margin: -60px; }
          .orbit-3 { width: 84px; height: 84px; margin: -42px; }
          .ring-inner { inset: 30px; }
          .ring-core { inset: 48px; }
          .bento-grid { grid-template-columns: repeat(6, 1fr); }
          .bcard-lg { grid-column: span 6; grid-row: span 1; }
          .bcard-md { grid-column: span 3; }
          .bcard-sm { grid-column: span 2; }
          .demo-section { grid-template-columns: 1fr; gap: 40px; }
          .process-steps { gap: 8px; }
          .pstep-arrow { display: none; }
        }
        @media (max-width: 720px) {
          .nav-center { display: none; }
          .h1-line { letter-spacing: -2px; }
          .bento-grid { grid-template-columns: 1fr; }
          .bcard-lg, .bcard-md, .bcard-sm { grid-column: span 1; grid-row: span 1; }
          .ai-row { grid-template-columns: 36px 28px 1fr; }
          .ai-row-num { display: none; }
          .pstep-card { width: 140px; }
          .footer-links { margin-left: 0; }
          .hero-stats { gap: 18px; }
        }
      `}</style>

      {/* Google Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
    </div>
  );
}
