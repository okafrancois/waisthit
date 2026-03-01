import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  campaigns: defineTable({
    targetName: v.string(),
    title: v.string(),
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
    metrics: v.object({
      totalVerifiedActions: v.number(),
      totalImpactValue: v.number(),
    }),
  }),
  actions: defineTable({
    campaignId: v.id("campaigns"),
    userId: v.optional(v.string()),
    actionType: v.string(),
    isCustomAction: v.boolean(),
    impactMultiplier: v.number(),
    computedImpact: v.number(),
    proofStorageId: v.optional(v.id("_storage")),
    status: v.union(
      v.literal("pending"),
      v.literal("verified"),
      v.literal("rejected"),
    ),
  })
    .index("by_campaignId", ["campaignId"])
    .index("by_userId", ["userId"])
    .index("by_status", ["status"]),
});
