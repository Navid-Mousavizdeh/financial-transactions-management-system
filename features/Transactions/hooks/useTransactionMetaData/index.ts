import { useQuery } from "@tanstack/react-query";
import { getQueryMetaData } from "../../utils";
import { transactionsQueryKeys } from "../../constants";

export const useTransactionMetaData = () => {
  return useQuery<TransactionMetaData, Error>({
    queryKey: [transactionsQueryKeys.transactions],
    queryFn: getQueryMetaData,
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
    retry: 2,
  });
};
