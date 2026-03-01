import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { authComponent } from "./auth";

export const createCampaign = mutation({
  args: {
    title: v.string(),
    targetName: v.string(),
    campaignType: v.union(
      v.literal("desabonnement"),
      v.literal("unfollow"),
      v.literal("boycott"),
    ),
    actionTypes: v.array(
      v.object({
        label: v.string(),
        impactValue: v.number(),
      }),
    ),
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
    actionType: v.string(),
    isCustomAction: v.boolean(),
    impactMultiplier: v.number(),
    proofStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign) throw new Error("Mouvement non trouvé.");

    // BetterAuth session integration check for optional user
    const authData = await authComponent.getAuthUser(ctx);
    const userId = authData?._id ?? undefined;

    // Find matching action type for impact calculation
    const matchingAction = campaign.actionTypes.find(
      (at) => at.label === args.actionType,
    );
    const baseImpact = matchingAction?.impactValue ?? campaign.estimatedValue;
    const computedImpact = baseImpact * args.impactMultiplier;

    const actionId = await ctx.db.insert("actions", {
      campaignId: args.campaignId,
      userId,
      actionType: args.actionType,
      isCustomAction: args.isCustomAction,
      impactMultiplier: args.impactMultiplier,
      computedImpact,
      proofStorageId: args.proofStorageId,
      status: "pending",
    });

    // If custom action, add it to the campaign's actionTypes so others can reuse
    if (args.isCustomAction) {
      const alreadyExists = campaign.actionTypes.some(
        (at) => at.label.toLowerCase() === args.actionType.toLowerCase(),
      );
      if (!alreadyExists) {
        await ctx.db.patch(args.campaignId, {
          actionTypes: [
            ...campaign.actionTypes,
            { label: args.actionType, impactValue: baseImpact },
          ],
        });
      }
    }

    // Update campaign metrics (simplified for demo — ideally after verification)
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
      totalMonthsPledged: totalActions,
    };
  },
});
