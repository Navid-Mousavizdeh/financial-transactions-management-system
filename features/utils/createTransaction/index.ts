import { axiosInstance } from "@/config";

export async function createTransaction(
  data: Transaction
): Promise<Transaction> {
  try {
    const response = await axiosInstance.post("/api/transactions", data);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to create transaction"
    );
  }
}
