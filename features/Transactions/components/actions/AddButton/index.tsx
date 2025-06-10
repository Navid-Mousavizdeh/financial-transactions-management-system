import { TransactionTableData } from "@/features/Transactions/types";
import { FilterOutlined, PlusOutlined } from "@ant-design/icons";
import { Badge, Button, Skeleton } from "antd";
import { useRouter } from "next/navigation";
import { SetStateAction } from "react";

const AddButton = () => {
  const router = useRouter();
  return (
    <Button
      type="primary"
      icon={<PlusOutlined />}
      onClick={() => router.push("/transaction")}
    >
      Add
    </Button>
  );
};

export default AddButton;
