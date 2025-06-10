import { getTransactionById } from "@/features/utils";
import { useQuery } from "@tanstack/react-query";

export const useTransaction = (id: string) => {
  return useQuery({
    queryKey: ["transaction", id],
    queryFn: () => getTransactionById(id),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 2,
    enabled: !!id, // Only fetch if ID is provided
  });
};
