import { DeleteOutlined, LoadingOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { Key } from "react";

interface DeleteButtonProps {
  numSelectedRowKeys?: number;
  handleDeleteSelected: () => void;
  isDeleting: boolean;
}

const DeleteButton = ({
  handleDeleteSelected,
  isDeleting,
  numSelectedRowKeys,
}: DeleteButtonProps) => {
  return (
    !!numSelectedRowKeys &&
    numSelectedRowKeys > 0 && (
      <Button
        type="primary"
        danger
        icon={isDeleting ? <LoadingOutlined /> : <DeleteOutlined />}
        onClick={handleDeleteSelected}
        disabled={isDeleting}
      >
        Delete{" "}
        {numSelectedRowKeys > 1
          ? `${numSelectedRowKeys} Selected Items`
          : "Selected Item"}
      </Button>
    )
  );
};

export default DeleteButton;
