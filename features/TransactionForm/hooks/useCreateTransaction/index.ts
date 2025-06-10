import { createTransaction } from "@/features/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { useRouter } from "next/navigation";

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      message.success("Transaction created successfully");
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      router.push("/");
    },
    onError: (error: Error) => {
      message.error(error.message || "Failed to create transaction");
    },
  });
};
