import { axiosInstance } from "@/config";

export async function updateTransaction(
  id: string,
  data: Transaction
): Promise<Transaction> {
  try {
    const response = await axiosInstance.put(`/api/transactions`, data);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        `Failed to update transaction with ID ${id}`
    );
  }
}
