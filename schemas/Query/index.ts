import { z } from "zod";

// Validation schemas
export const SortOrderSchema = z.enum(["asc", "desc"]);
export const StatusSchema = z.enum(["completed", "pending", "failed"]);

export const GetQuerySchema = z.any().transform((query: any): GetQuery => {
  const result: GetQuery = {
    sort: [],
    filter: [],
    page: 1,
    size: 10,
  };

  // Parse sort
  if (query.sort) {
    const sortString = z.string().parse(query.sort);
    result.sort = sortString.split(",").map((s) => {
      const [field, order] = s.split(":");
      return { field, order: SortOrderSchema.parse(order || "asc") };
    });
  }

  // Parse filter
  if (query.filter) {
    const filterString = z.string().parse(query.filter);
    result.filter = filterString
      .split(",")
      .map((f) => {
        const [field, value] = f.split(":");
        if (field.endsWith(".min") || field.endsWith(".max")) {
          const baseField = field.replace(/\.min$|\.max$/, "");
          const existingRange = result.filter.find(
            (f) => f.field === baseField
          );
          const rangeValue = z.coerce.number().parse(value);
          if (
            existingRange &&
            typeof existingRange.value === "object" &&
            !Array.isArray(existingRange.value)
          ) {
            existingRange.value[field.endsWith(".min") ? "min" : "max"] =
              rangeValue;
            return null;
          } else {
            const range: { min?: number; max?: number } = {};
            range[field.endsWith(".min") ? "min" : "max"] = rangeValue;
            return { field: baseField, value: range };
          }
        } else if (field === "status" && value.includes("|")) {
          return {
            field,
            value: value.split("|").map((v) => StatusSchema.parse(v)),
          };
        } else if (["amount", "fees.processing_fee"].includes(field)) {
          return { field, value: z.coerce.number().parse(value) };
        } else {
          return { field, value };
        }
      })
      .filter((f): f is NonNullable<typeof f> => f !== null);
  }

  // Parse search
  if (query.search) {
    result.search = z.string().parse(query.search);
  }

  // Parse pagination
  if (query.page) {
    result.page = z.coerce.number().int().min(1).parse(query.page);
  }
  if (query.size) {
    result.size = z.coerce.number().int().min(1).max(100).parse(query.size);
  }

  return result;
});

export const TransactionSchema = z.object({
  id: z.string().uuid(),
  amount: z.number().positive(),
  currency: z.string().min(3).max(3),
  status: StatusSchema,
  timestamp: z.string().datetime(),
  description: z.string(),
  merchant: z.object({
    name: z.string(),
    id: z.string(),
  }),
  payment_method: z.object({
    type: z.string(),
    last4: z.string().length(4),
    brand: z.string(),
  }),
  sender: z.object({
    name: z.string(),
    account_id: z.string(),
  }),
  receiver: z.object({
    name: z.string(),
    account_id: z.string(),
  }),
  fees: z.object({
    processing_fee: z.number().nonnegative(),
    currency: z.string().min(3).max(3),
  }),
  metadata: z.object({
    order_id: z.string(),
    customer_id: z.string(),
  }),
});

export const PostBodySchema = TransactionSchema.omit({ id: true });
export const PutBodySchema = TransactionSchema.partial().required({ id: true });
export const DeleteBodySchema = z.object({
  ids: z.string().uuid().array().min(1),
});
