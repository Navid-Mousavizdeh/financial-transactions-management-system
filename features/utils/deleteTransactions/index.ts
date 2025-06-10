import { axiosInstance } from "@/config";

export async function deleteTransactions(ids: React.Key[]): Promise<void> {
  try {
    await axiosInstance.delete("/api/transactions", {
      data: { ids },
    });
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to delete transactions"
    );
  }
}
