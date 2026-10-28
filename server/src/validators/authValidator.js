const { z } = require("zod");

const signupSchema = z.object({
  email: z.email().trim().toLowerCase(),

  password: z.string()
    .min(8, "Password must contain at least 8 characters")
    .max(72, "Password must not exceed 72 characters"),

  confirmPassword: z.string(),

  organizationName: z.string()
    .trim()
    .min(2, "Organization name must contain at least 2 characters")
    .max(150),
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  }
);

const loginSchema = z.object({
  email: z.email().trim().toLowerCase(),

  password: z.string().min(1, "Password is required"),
});

module.exports = {
  signupSchema,
  loginSchema,
};