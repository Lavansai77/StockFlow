const { z } = require("zod");

const settingsSchema = z.object({
  defaultLowStockThreshold: z
    .number()
    .int("Threshold must be a whole number")
    .min(0, "Threshold cannot be negative")
    .max(1000000, "Threshold is too large"),
}).strict();

module.exports = { settingsSchema };