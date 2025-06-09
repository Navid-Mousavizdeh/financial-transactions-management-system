import {
  DeleteBodySchema,
  GetQuerySchema,
  PostBodySchema,
  PutBodySchema,
} from "@/schemas";
import { z } from "zod";

// Interface for GET params, derived from GetQuerySchema
type GetParams = z.output<typeof GetQuerySchema>;

/**
 * Generates query parameters for GET requests
 * @param params Parameters for sorting, filtering, searching, and pagination
 * @returns URLSearchParams object with formatted query parameters
 * @throws Error if validation fails
 */
export function generateGetParams(params: GetParams): URLSearchParams {
  const parsedParams = GetQuerySchema.parse(params);
  const searchParams = new URLSearchParams();

  // Add sorting
  if (parsedParams.sort.length > 0) {
    const sortString = parsedParams.sort
      .map(({ field, order }) => `${field}:${order}`)
      .join(",");
    searchParams.append("sort", sortString);
  }

  // Add filters
  if (parsedParams.filter.length > 0) {
    const filterString = parsedParams.filter
      .map(({ field, value }) => {
        if (typeof value === "object" && !Array.isArray(value)) {
          const rangeParts: string[] = [];
          if (value.min) rangeParts.push(`${field}.min:${value.min}`);
          if (value.max) rangeParts.push(`${field}.max:${value.max}`);
          return rangeParts.join(",");
        } else if (Array.isArray(value)) {
          return `${field}:${value.join("|")}`;
        } else {
          return `${field}:${value}`;
        }
      })
      .join(",");
    searchParams.append("filter", filterString);
  }

  // Add search
  if (parsedParams.search) {
    searchParams.append("search", parsedParams.search);
  }

  // Add pagination
  searchParams.append("page", parsedParams.page.toString());
  searchParams.append("size", parsedParams.size.toString());

  return searchParams;
}

/**
 * Generates body for POST requests to create a new transaction
 * @param data Transaction data (excluding id)
 * @returns Validated transaction object
 * @throws Error if validation fails
 */
export function generatePostBody(
  data: Omit<Transaction, "id">
): Omit<Transaction, "id"> {
  return PostBodySchema.parse(data);
}

/**
 * Generates body for PUT requests to update a transaction
 * @param data Partial transaction data with required id
 * @returns Validated partial transaction object
 * @throws Error if validation fails
 */
export function generatePutBody(
  data: Partial<Transaction> & { id: string }
): Partial<Transaction> & { id: string } {
  return PutBodySchema.parse(data);
}

/**
 * Generates body for DELETE requests to delete multiple transactions
 * @param ids Array of transaction IDs
 * @returns Validated delete body with IDs
 * @throws Error if validation fails
 */
export function generateDeleteBody(ids: string[]): { ids: string[] } {
  return DeleteBodySchema.parse({ ids });
}
