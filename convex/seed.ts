import { mutation } from "./_generated/server";

export default mutation(async (ctx) => {
  const existing = await ctx.db.query("campaigns").first();
  if (existing) {
    console.log("Database already seeded");
    return;
  }

  const campaigns = [
    {
      title: "Stop les abonnements DAZN",
      targetName: "DAZN",
      campaignType: "desabonnement" as const,
      estimatedValue: 19.99,
      actionTypes: [
        { label: "J'ai résilié mon abo", impactValue: 19.99 },
        { label: "J'ai mis en pause", impactValue: 9.99 },
      ],
      metrics: { totalVerifiedActions: 0, totalImpactValue: 0 },
    },
    {
      title: "Unfollow massif",
      targetName: "InfluenceurX",
      campaignType: "unfollow" as const,
      estimatedValue: 5.0,
      actionTypes: [
        { label: "Unfollow sur Instagram", impactValue: 5.0 },
        { label: "Unfollow sur TikTok", impactValue: 3.0 },
        { label: "Désabonné YouTube", impactValue: 4.0 },
      ],
      metrics: { totalVerifiedActions: 0, totalImpactValue: 0 },
    },
  ];

  for (const campaign of campaigns) {
    await ctx.db.insert("campaigns", campaign);
  }
  return "Seeded 2 campaigns!";
});
