import { prisma } from "../lib/db";
import {
  UserRole,
  FeedbackChannel,
  Sentiment,
  FeedbackStatus,
} from "../lib/generated/prisma/client";
import bcrypt from "bcryptjs";

const FEEDBACK_TEMPLATES = [
  // POSITIVE
  {
    content: "The new dashboard UI is incredibly intuitive and responsive. Huge improvement over the last version!",
    sentiment: Sentiment.POSITIVE,
    score: 0.9,
    channel: FeedbackChannel.EMAIL,
    themes: ["UI/UX", "Performance"],
    customer: "Sarah Chen (Enterprise Tier)",
  },
  {
    content: "Integration with Slack has saved our team so much time every single day! Best feature update this year.",
    sentiment: Sentiment.POSITIVE,
    score: 0.95,
    channel: FeedbackChannel.WEBSITE,
    themes: ["Integrations", "Productivity"],
    customer: "Alex Thompson",
  },
  {
    content: "Love the automated export functionality. Saved me over an hour of manual data formatting today.",
    sentiment: Sentiment.POSITIVE,
    score: 0.85,
    channel: FeedbackChannel.MOBILE_APP,
    themes: ["Feature Requests", "Productivity"],
    customer: "Elena Rostova",
  },
  {
    content: "Customer support resolved my billing inquiry within 5 minutes. Outstanding service!",
    sentiment: Sentiment.POSITIVE,
    score: 0.92,
    channel: FeedbackChannel.EMAIL,
    themes: ["Support", "Billing"],
    customer: "David Miller",
  },
  {
    content: "The dark mode implementation looks crisp and reduces eye strain during night shifts.",
    sentiment: Sentiment.POSITIVE,
    score: 0.8,
    channel: FeedbackChannel.WEBSITE,
    themes: ["UI/UX"],
    customer: "Kevin Patel",
  },
  {
    content: "Filtering feedback by channel and date range works seamlessly. Exactly what our product team needed.",
    sentiment: Sentiment.POSITIVE,
    score: 0.88,
    channel: FeedbackChannel.API,
    themes: ["UI/UX", "Search & Filter"],
    customer: "Rachel Green",
  },
  {
    content: "API response times have improved noticeably after the latest patch. Great job by the dev team!",
    sentiment: Sentiment.POSITIVE,
    score: 0.86,
    channel: FeedbackChannel.API,
    themes: ["Performance", "Developer Experience"],
    customer: "TechCorp Dev Team",
  },
  {
    content: "Super smooth onboarding process. I was able to set up my workspace in less than 3 minutes.",
    sentiment: Sentiment.POSITIVE,
    score: 0.91,
    channel: FeedbackChannel.WEBSITE,
    themes: ["Onboarding"],
    customer: "Michael Scott",
  },

  // NEUTRAL
  {
    content: "Would love to see dark mode support expanded to pdf exports as well.",
    sentiment: Sentiment.NEUTRAL,
    score: 0.05,
    channel: FeedbackChannel.WEBSITE,
    themes: ["Feature Requests", "UI/UX"],
    customer: "Marcus Johnson",
  },
  {
    content: "API documentation could use more code examples for Python and Go SDKs.",
    sentiment: Sentiment.NEUTRAL,
    score: -0.1,
    channel: FeedbackChannel.CSV,
    themes: ["Documentation", "Developer Experience"],
    customer: "Jordan Lee",
  },
  {
    content: "The app works fine on desktop, but the mobile web layout has some minor horizontal scrolling issues.",
    sentiment: Sentiment.NEUTRAL,
    score: -0.15,
    channel: FeedbackChannel.MOBILE_APP,
    themes: ["UI/UX", "Mobile"],
    customer: "NPS Survey #482",
  },
  {
    content: "Is there a planned integration with HubSpot CRM? Our sales team currently syncs data manually.",
    sentiment: Sentiment.NEUTRAL,
    score: 0.0,
    channel: FeedbackChannel.EMAIL,
    themes: ["Integrations", "Feature Requests"],
    customer: "Amanda Waller",
  },
  {
    content: "Notifications are fine, but I wish I could digest them into a weekly summary email instead of instant alerts.",
    sentiment: Sentiment.NEUTRAL,
    score: 0.1,
    channel: FeedbackChannel.WEBSITE,
    themes: ["Notifications", "Feature Requests"],
    customer: "Chris Hemsworth",
  },
  {
    content: "Dashboard loading speed is average. Takes around 2.5 seconds during peak usage hours.",
    sentiment: Sentiment.NEUTRAL,
    score: -0.05,
    channel: FeedbackChannel.API,
    themes: ["Performance"],
    customer: "Analytics Bot Monitor",
  },

  // NEGATIVE
  {
    content: "The onboarding process was confusing. Too many required steps before reaching the main dashboard.",
    sentiment: Sentiment.NEGATIVE,
    score: -0.75,
    channel: FeedbackChannel.WEBSITE,
    themes: ["Onboarding", "UI/UX"],
    customer: "Emily Rodriguez",
  },
  {
    content: "Billing page keeps timing out whenever I attempt to download my monthly PDF invoice.",
    sentiment: Sentiment.NEGATIVE,
    score: -0.85,
    channel: FeedbackChannel.EMAIL,
    themes: ["Billing", "Performance"],
    customer: "Support Ticket #1092",
  },
  {
    content: "Prospect demands SAML/SSO authentication before signing contract. Third lost deal this month due to missing SSO.",
    sentiment: Sentiment.NEGATIVE,
    score: -0.9,
    channel: FeedbackChannel.CSV,
    themes: ["Security", "Feature Requests"],
    customer: "Enterprise Sales Note",
  },
  {
    content: "CSV bulk import crashed midway and gave a generic 500 error without specifying which row failed.",
    sentiment: Sentiment.NEGATIVE,
    score: -0.82,
    channel: FeedbackChannel.CSV,
    themes: ["CSV Ingestion", "Performance"],
    customer: "Data Ops Team",
  },
  {
    content: "Mobile app crashes frequently on iOS 17 when trying to open attached screenshots in feedback tickets.",
    sentiment: Sentiment.NEGATIVE,
    score: -0.88,
    channel: FeedbackChannel.MOBILE_APP,
    themes: ["Mobile", "Bugs"],
    customer: "AppStore Review (1 star)",
  },
  {
    content: "Search functionality fails to find exact string matches if keywords contain special characters or hyphens.",
    sentiment: Sentiment.NEGATIVE,
    score: -0.65,
    channel: FeedbackChannel.API,
    themes: ["Search & Filter", "Bugs"],
    customer: "Developer Forum User",
  },
  {
    content: "Role permissions seem broken: Viewer role users were able to view workspace member emails.",
    sentiment: Sentiment.NEGATIVE,
    score: -0.95,
    channel: FeedbackChannel.EMAIL,
    themes: ["Security", "Permissions"],
    customer: "Security Audit Team",
  },
  {
    content: "Frequent 504 Gateway Timeout errors observed between 2 PM and 4 PM UTC daily.",
    sentiment: Sentiment.NEGATIVE,
    score: -0.89,
    channel: FeedbackChannel.API,
    themes: ["Performance", "Infrastructure"],
    customer: "DevOps Monitoring Alert",
  },
];

const CUSTOMER_NAMES = [
  "Alice Smith", "Bob Jones", "Carol Taylor", "Dan Brown", "Eva Martinez",
  "Frank Wright", "Grace Hopper", "Hank Schrader", "Ivy Chen", "Jack Ryan",
  "Karen Page", "Leo Fitz", "Mia Wong", "Nathan Drake", "Olivia Wilde",
  "Peter Parker", "Quinn Fabray", "Reed Richards", "Steve Rogers", "Tony Stark",
  "AppStore Reviewer", "G2 Crowd Verified User", "Support Ticket System",
  "Salesforce Sync Bot", "User Feedback Widget", "Customer Advisory Board"
];

const THEME_DEFINITIONS = [
  { name: "UI/UX", description: "User interface, design, and user experience issues or praise", color: "#3B82F6" },
  { name: "Performance", description: "Speed, latency, timeouts, and system resource consumption", color: "#EF4444" },
  { name: "Feature Requests", description: "Suggestions for new capabilities or options", color: "#F59E0B" },
  { name: "Documentation", description: "API docs, guides, and help center clarity", color: "#10B981" },
  { name: "Integrations", description: "Third-party connections like Slack, HubSpot, and Webhooks", color: "#8B5CF6" },
  { name: "Onboarding", description: "First-time user setup, tutorial, and initial workflow", color: "#EC4899" },
  { name: "Billing", description: "Invoices, payment processing, subscriptions, and pricing", color: "#6366F1" },
  { name: "Security", description: "SSO, permissions, compliance, data privacy, and authentication", color: "#14B8A6" },
  { name: "Mobile", description: "iOS and Android app experience, mobile responsiveness", color: "#F97316" },
  { name: "Search & Filter", description: "Search query accuracy, filtering options, and data discovery", color: "#06B6D4" },
  { name: "CSV Ingestion", description: "File imports, data mapping, and CSV parsing errors", color: "#84CC16" },
  { name: "Support", description: "Help desk responsiveness, customer success interaction", color: "#64748B" },
];

async function main() {
  console.log("🌱 Starting database seed...");

  // 1. Clean existing data in correct order
  console.log("🧹 Cleaning old records...");
  await prisma.feedbackTheme.deleteMany();
  await prisma.embedding.deleteMany();
  await prisma.report.deleteMany();
  await prisma.feedback.deleteMany();
  await prisma.theme.deleteMany();
  await prisma.user.deleteMany();
  await prisma.workspace.deleteMany();

  // 2. Create Workspace and Users
  console.log("🏢 Creating demo workspace & users...");
  const hashedPassword = await bcrypt.hash("password123", 12);

  const workspace = await prisma.workspace.create({
    data: {
      name: "Demo Workspace",
      users: {
        create: [
          {
            name: "Rupak Sarkar",
            email: "reaverrupak@gmail.com",
            passwordHash: hashedPassword,
            role: UserRole.ADMIN,
          },
          {
            name: "Srabani Kar",
            email: "srabanikar02@gmail.com",
            passwordHash: hashedPassword,
            role: UserRole.ANALYST,
          },
          {
            name: "Bidusha Halder",
            email: "bidushak098@gmail.com",
            passwordHash: hashedPassword,
            role: UserRole.VIEWER,
          },
          {
            name: "Demo Admin",
            email: "admin@demo.com",
            passwordHash: hashedPassword,
            role: UserRole.ADMIN,
          },
          {
            name: "Demo Analyst",
            email: "analyst@demo.com",
            passwordHash: hashedPassword,
            role: UserRole.ANALYST,
          },
          {
            name: "Demo Viewer",
            email: "viewer@demo.com",
            passwordHash: hashedPassword,
            role: UserRole.VIEWER,
          },
        ],
      },
    },
  });

  // 3. Create Themes
  console.log("🎨 Creating theme categories...");
  const themeMap = new Map<string, string>();
  for (const tDef of THEME_DEFINITIONS) {
    const theme = await prisma.theme.create({
      data: {
        name: tDef.name,
        description: tDef.description,
        color: tDef.color,
        workspaceId: workspace.id,
      },
    });
    themeMap.set(tDef.name, theme.id);
  }

  // 4. Generate 130 realistic Feedback items
  console.log("📝 Generating 130 realistic feedback entries across 60 days...");
  const channels = Object.values(FeedbackChannel);
  const statuses = [FeedbackStatus.NEW, FeedbackStatus.REVIEWED, FeedbackStatus.ACTIONED];
  
  const now = new Date();

  for (let i = 0; i < 130; i++) {
    // Pick base template or generate variation
    const template = FEEDBACK_TEMPLATES[i % FEEDBACK_TEMPLATES.length];
    
    // Spread dates over past 60 days
    const daysAgo = Math.floor(Math.random() * 60);
    const hoursAgo = Math.floor(Math.random() * 24);
    const createdAt = new Date(now.getTime() - (daysAgo * 86400000 + hoursAgo * 3600000));

    // Slight score jitter
    const jitter = (Math.random() * 0.1) - 0.05;
    const finalScore = Math.max(-1, Math.min(1, Number((template.score + jitter).toFixed(2))));

    const channel = channels[i % channels.length];
    const customer = CUSTOMER_NAMES[i % CUSTOMER_NAMES.length];
    const status = statuses[i % statuses.length];

    const feedback = await prisma.feedback.create({
      data: {
        content: `${template.content} [Ref #${1000 + i}]`,
        channel,
        customerLabel: customer,
        externalReference: `EXT-${202400 + i}`,
        sentiment: template.sentiment,
        sentimentScore: finalScore,
        status,
        workspaceId: workspace.id,
        createdAt,
      },
    });

    // Attach themes to feedback
    for (const themeName of template.themes) {
      const themeId = themeMap.get(themeName);
      if (themeId) {
        await prisma.feedbackTheme.create({
          data: {
            feedbackId: feedback.id,
            themeId,
            confidence: Number((0.75 + Math.random() * 0.24).toFixed(2)),
          },
        });
      }
    }
  }

  console.log("✅ Seed completed successfully!");
  console.log(`Summary:
  - Workspace: "${workspace.name}"
  - Users: 3 (Admin, Analyst, Viewer - password: password123)
  - Themes: ${THEME_DEFINITIONS.length}
  - Feedback Items: 130
  `);
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });