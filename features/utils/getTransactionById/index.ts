import { axiosInstance } from "@/config";

export async function getTransactionById(id: string): Promise<Transaction> {
  try {
    const response = await axiosInstance.get(`/api/transactions/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        `Failed to fetch transaction with ID ${id}`
    );
  }
}
