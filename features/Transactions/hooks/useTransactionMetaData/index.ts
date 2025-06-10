import { useQuery } from "@tanstack/react-query";
import { transactionsQueryKeys } from "../../constants";
import { getQueryMetaData } from "@/features/utils";

export const useTransactionMetaData = () => {
  return useQuery<TransactionMetaData, Error>({
    queryKey: [transactionsQueryKeys.transactions],
    queryFn: getQueryMetaData,
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
    retry: 2,
  });
};
