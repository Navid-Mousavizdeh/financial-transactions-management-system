import { deleteTransactions } from "@/features/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { useRouter } from "next/navigation";

export const useDeleteTransaction = (id: string) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => deleteTransactions([id]),
    onSuccess: () => {
      message.success("Transaction deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      router.push("/");
    },
    onError: (error: Error) => {
      message.error(error.message || "Failed to delete transaction");
    },
  });
};
