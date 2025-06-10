import { updateTransaction } from "@/features/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { useRouter } from "next/navigation";

export const useUpdateTransaction = (id: string) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: any) => updateTransaction(id, data),
    onSuccess: () => {
      message.success("Transaction updated successfully");
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      router.push("/");
    },
    onError: (error: Error) => {
      message.error(error.message || "Failed to update transaction");
    },
  });
};
