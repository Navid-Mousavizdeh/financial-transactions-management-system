import { axiosInstance } from "@/config";

export async function getQueryMetaData(): Promise<TransactionMetaData> {
  try {
    const response = await axiosInstance.get("/api/transactions/metadata");
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch transaction metadata"
    );
  }
}
