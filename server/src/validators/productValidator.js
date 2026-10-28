const { z } = require("zod");

const productSchema = z.object({
  name: z.string().trim().min(1, "Product name is required").max(150),

  sku: z.string().trim().min(1, "SKU is required").max(100),

  description: z.string().trim().max(1000).nullish(),

  quantityOnHand: z.number().int().min(0, "Quantity cannot be negative"),

  costPrice: z.number().finite().min(0).max(9999999999.99).nullish(),

  sellingPrice: z.number().finite().min(0).max(9999999999.99).nullish(),

  lowStockThreshold: z.number().int().min(0).nullish(),
}).strict();

const updateProductSchema = productSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: "Provide at least one field to update" }
);

module.exports = { productSchema, updateProductSchema };