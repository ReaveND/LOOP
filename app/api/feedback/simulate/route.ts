import { NextResponse } from "next/server";
import { UserRole, FeedbackChannel, FeedbackStatus } from "@/lib/generated/prisma/client";
import { requireRole } from "@/lib/permissions";
import { prisma } from "@/lib/db";
import { withErrorHandler } from "@/lib/utils/with-error-handler";

// 20 realistic, varied simulated feedback items across all channels and sentiments
const SIMULATED_ITEMS = [
  {
    content:
      "The new onboarding wizard is a game-changer — my team was up and running in under 10 minutes.",
    channel: FeedbackChannel.MOBILE_APP,
    customerLabel: "App Store Review — TechStartup CEO",
  },
  {
    content:
      "Dashboard analytics take more than 15 seconds to load during peak morning hours. This is blocking our daily standups.",
    channel: FeedbackChannel.EMAIL,
    customerLabel: "TechCorp Support Ticket #8821",
  },
  {
    content:
      "The checkout flow crashes whenever I select Google Pay on iOS 17. Reproducible every time.",
    channel: FeedbackChannel.MOBILE_APP,
    customerLabel: "App Store Review — iOS User",
  },
  {
    content:
      "Loving the dark mode update! Makes nighttime reviews so much easier on the eyes.",
    channel: FeedbackChannel.WEBSITE,
    customerLabel: "Jessica M. — Power User",
  },
  {
    content:
      "Webhook delivery fails silently when payload exceeds 5 MB. No error in logs, no retry. Took us hours to debug.",
    channel: FeedbackChannel.API,
    customerLabel: "DevOps Engineer — FinTech Partner",
  },
  {
    content:
      "CSAT Survey: Filters are super responsive, but I'd love to export custom filtered views directly to PDF.",
    channel: FeedbackChannel.WEBSITE,
    customerLabel: "Enterprise Account Lead — Acme Inc.",
  },
  {
    content:
      "Invited 3 teammates and all three got their invites within seconds. Seamless experience.",
    channel: FeedbackChannel.MOBILE_APP,
    customerLabel: "App Store Review — Small Business Owner",
  },
  {
    content:
      "Billing page keeps timing out when I try to download an invoice. Happened 4 times this week.",
    channel: FeedbackChannel.EMAIL,
    customerLabel: "Finance Manager — RetailCo",
  },
  {
    content:
      "The search bar is unreliable — searching for exact phrases returns no results even when the content exists.",
    channel: FeedbackChannel.WEBSITE,
    customerLabel: "Product Manager — ScaleUp Ltd.",
  },
  {
    content:
      "NPS Survey: Solid product overall but the mobile experience seriously needs a responsive overhaul.",
    channel: FeedbackChannel.MOBILE_APP,
    customerLabel: "NPS Respondent — Healthcare Client",
  },
  {
    content:
      "The new export feature saved me an hour today. Love it! Would be great to schedule automated exports.",
    channel: FeedbackChannel.WEBSITE,
    customerLabel: "Community Post — Power User Forum",
  },
  {
    content:
      "Prospect asked for SSO support again before they'll sign. That's the 4th time this month — we're losing deals over it.",
    channel: FeedbackChannel.EMAIL,
    customerLabel: "Sales Call Note — AE Team",
  },
  {
    content:
      "API rate limits aren't documented anywhere. Hit a 429 in production and had no idea what the thresholds were.",
    channel: FeedbackChannel.API,
    customerLabel: "Backend Developer — Integration Partner",
  },
  {
    content:
      "The theme clustering feature grouped my feedback perfectly. Cut my triage time by 60%.",
    channel: FeedbackChannel.WEBSITE,
    customerLabel: "Head of Product — EdTech Startup",
  },
  {
    content:
      "Couldn't figure out how to invite my team during onboarding. The button was hidden under a collapsed section.",
    channel: FeedbackChannel.EMAIL,
    customerLabel: "Support Ticket #9043 — New User",
  },
  {
    content:
      "Report generation is too slow — waited 40 seconds for a 30-day report. Please optimize.",
    channel: FeedbackChannel.API,
    customerLabel: "CTO — B2B SaaS Client",
  },
  {
    content:
      "CSV import is brilliant. Imported 500 rows in seconds with a clear success/failure summary.",
    channel: FeedbackChannel.CSV,
    customerLabel: "Data Analyst — Logistics Corp.",
  },
  {
    content:
      "The sidebar navigation disappears on tablet width. Completely unusable on iPad.",
    channel: FeedbackChannel.MOBILE_APP,
    customerLabel: "App Store Review — iPad User",
  },
  {
    content:
      "Two-factor authentication would make us feel much more secure. Any plans for this?",
    channel: FeedbackChannel.WEBSITE,
    customerLabel: "Security-Conscious Enterprise Admin",
  },
  {
    content:
      "Permissions system is exactly what we needed. Analysts can work freely without worrying about breaking anything.",
    channel: FeedbackChannel.EMAIL,
    customerLabel: "IT Manager — ManufacturingCo",
  },
];

// POST /api/feedback/simulate — seed realistic simulated channel feedback
export const POST = withErrorHandler(async (_req: Request) => {
  const session = await requireRole([UserRole.ADMIN, UserRole.ANALYST]);
  const workspaceId = session.user.workspaceId;

  const records = SIMULATED_ITEMS.map((item) => ({
    content: item.content,
    channel: item.channel,
    customerLabel: item.customerLabel,
    workspaceId,
    status: FeedbackStatus.NEW,
  }));

  const created = await prisma.feedback.createMany({ data: records });

  return NextResponse.json(
    {
      message: "Simulation complete",
      importedCount: created.count,
    },
    { status: 201 }
  );
});
