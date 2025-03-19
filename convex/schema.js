import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { Users } from "lucide-react";

export default defineSchema({
    Users: defineTable({
        name:v.string(),
        email:v.string(),
        credits:v.number(),
        subscriptionId: v.optional(v.string()) 
    })
})