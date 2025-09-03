import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(3).max(20),
  icon: z.string().max(20),
  type: z.enum(["income", "expense"]),
});

export type CreateCategoryType = z.infer<typeof createCategorySchema>;

export const deleteCategorySchema = z.object({
  name: z.string().min(3).max(20),
  type: z.enum(["income", "expense"]),
});

export type DeleteCategoryType = z.infer<typeof deleteCategorySchema>;
