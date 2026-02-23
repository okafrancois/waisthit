import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  campaigns: defineTable({
    targetName: v.string(),
    title: v.string(),
    type: v.union(v.literal("paid_subscription"), v.literal("social_follower")),
    estimatedValue: v.number(),
    metrics: v.object({
      totalVerifiedActions: v.number(),
      totalImpactValue: v.number(),
    }),
  }),
  actions: defineTable({
    campaignId: v.id("campaigns"),
    userId: v.optional(v.string()), // Optional for anonymous submissions
    actionType: v.union(
      v.literal("cancelled"),
      v.literal("paused"),
      v.literal("unfollowed"),
    ),
    impactMultiplier: v.number(), // Extrapolated from months impact
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
