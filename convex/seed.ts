import { mutation } from "./_generated/server";

export default mutation(async (ctx) => {
  const existing = await ctx.db.query("campaigns").first();
  if (existing) {
    console.log("Database already seeded");
    return;
  }

  const campaigns = [
    {
      title: "Boycott Canal+ Sport",
      targetName: "Canal+ Sport",
      type: "paid_subscription" as const,
      estimatedValue: 15.99,
      metrics: { totalVerifiedActions: 0, totalImpactValue: 0 },
    },
    {
      title: "Cancel DAZN Subscriptions",
      targetName: "DAZN",
      type: "paid_subscription" as const,
      estimatedValue: 19.99,
      metrics: { totalVerifiedActions: 0, totalImpactValue: 0 },
    },
    {
      title: "Unfollow Creator X",
      targetName: "Creator X",
      type: "social_follower" as const,
      estimatedValue: 5.0, // € per follower per year estimated
      metrics: { totalVerifiedActions: 0, totalImpactValue: 0 },
    },
  ];

  for (const campaign of campaigns) {
    await ctx.db.insert("campaigns", campaign);
  }
  return "Seeded 3 campaigns!";
});
