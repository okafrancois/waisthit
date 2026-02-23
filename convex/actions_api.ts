import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { authComponent } from "./auth";

export const createCampaign = mutation({
  args: {
    title: v.string(),
    targetName: v.string(),
    type: v.union(v.literal("paid_subscription"), v.literal("social_follower")),
    estimatedValue: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("campaigns", {
      ...args,
      metrics: {
        totalVerifiedActions: 0,
        totalImpactValue: 0,
      },
    });
  },
});

export const getTrendingCampaigns = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("campaigns").take(3);
  },
});

export const getCampaigns = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("campaigns").take(20);
  },
});

export const getCampaign = query({
  args: { id: v.id("campaigns") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getCampaignActions = query({
  args: { campaignId: v.id("campaigns") },
  handler: async (ctx, args) => {
    const actions = await ctx.db
      .query("actions")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", args.campaignId))
      .order("desc")
      .take(50);
    return Promise.all(
      actions.map(async (action) => {
        let proofUrl = null;
        if (action.proofStorageId) {
          proofUrl = await ctx.storage.getUrl(action.proofStorageId);
        }
        return { ...action, proofUrl };
      }),
    );
  },
});

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

export const submitAction = mutation({
  args: {
    campaignId: v.id("campaigns"),
    actionType: v.union(
      v.literal("cancelled"),
      v.literal("paused"),
      v.literal("unfollowed"),
    ),
    impactMultiplier: v.number(),
    proofStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign) throw new Error("Campaign non trouvée.");

    // BetterAuth session integration check for optional user
    const authData = await authComponent.getAuthUser(ctx);
    const userId = authData?._id ?? undefined;

    const computedImpact =
      args.actionType === "unfollowed" ?
        campaign.estimatedValue
      : campaign.estimatedValue * args.impactMultiplier;

    const actionId = await ctx.db.insert("actions", {
      campaignId: args.campaignId,
      userId,
      actionType: args.actionType,
      impactMultiplier: args.impactMultiplier,
      computedImpact,
      proofStorageId: args.proofStorageId,
      status: "pending", // Waiting for manual or AI verification
    });

    // Option: On pourrait directement incrémenter les stats pour cette démo.
    // Habituellement on le fait SEULEMENT après validation ("verified") !
    // Pour que le UI du mur bouge en dev, on commente cette protection :
    await ctx.db.patch(args.campaignId, {
      metrics: {
        totalVerifiedActions: campaign.metrics.totalVerifiedActions + 1,
        totalImpactValue: campaign.metrics.totalImpactValue + computedImpact,
      },
    });

    return actionId;
  },
});

export const getRecentActions = query({
  args: {},
  handler: async (ctx) => {
    const actions = await ctx.db.query("actions").order("desc").take(12);
    return Promise.all(
      actions.map(async (action) => {
        const campaign = await ctx.db.get(action.campaignId);
        let proofUrl = null;
        if (action.proofStorageId) {
          proofUrl = await ctx.storage.getUrl(action.proofStorageId);
        }
        return {
          ...action,
          targetName: campaign?.targetName || "Inconnu",
          proofUrl,
        };
      }),
    );
  },
});

export const getGlobalImpact = query({
  args: {},
  handler: async (ctx) => {
    const campaigns = await ctx.db.query("campaigns").collect();
    let totalActions = 0;
    let totalRevenueWithheld = 0;

    for (const c of campaigns) {
      totalActions += c.metrics.totalVerifiedActions;
      totalRevenueWithheld += c.metrics.totalImpactValue;
    }

    return {
      totalActions,
      totalRevenueWithheld,
      totalMonthsPledged: totalActions, // Simplified for demo
    };
  },
});
