import { axiosInstance } from "@/config";

export async function getTransactions(params: URLSearchParams): Promise<{
  transactions: Transaction[];
  total: number;
  maxPage: number;
}> {
  try {
    const response = await axiosInstance.get(`/api/transactions`, {
      params,
    });
    const { data, total, maxPage } = response.data;
    return { transactions: data, total, maxPage };
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch transactions"
    );
  }
}
