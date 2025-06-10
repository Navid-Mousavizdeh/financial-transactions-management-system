import {
  DeleteBodySchema,
  GetParamsSchema,
  PostBodySchema,
  PutBodySchema,
} from "@/schemas";
import { z } from "zod";

// Interface for GET params
type GetParams = z.input<typeof GetParamsSchema>;

/**
 * Generates query parameters for GET requests
 * @param params Parameters for sorting, filtering, searching, and pagination
 * @returns URLSearchParams object with formatted query parameters
 * @throws Error if validation fails
 */
export function generateGetParams(params: GetParams): URLSearchParams {
  return GetParamsSchema.parse(params);
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
