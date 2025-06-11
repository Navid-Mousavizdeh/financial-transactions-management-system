import { axiosInstance } from "@/config";

export async function getTransactions(
  params: URLSearchParams,
  setPagination: (val: { total: number; maxPage: number }) => void
): Promise<{
  transactions: Transaction[];
  total: number;
  maxPage: number;
}> {
  try {
    const response = await axiosInstance.get(`/api/transactions`, {
      params,
    });
    const { data, total, maxPage } = response.data;
    setPagination({ total, maxPage });
    return { transactions: data, total, maxPage };
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch transactions"
    );
  }
}
