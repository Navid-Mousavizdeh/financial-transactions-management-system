import { TransactionTableData } from "@/features/Transactions/types";
import { FilterOutlined } from "@ant-design/icons";
import { Badge, Button, Skeleton } from "antd";
import { SetStateAction } from "react";

const { Button: ButtonSkeleton } = Skeleton;

interface FilterButtonProps {
  filterCount: number | undefined;
  isLoadingMetaData: boolean;
  setDrawerVisible: (value: SetStateAction<boolean>) => void;
}

const FilterButton = ({
  filterCount,
  isLoadingMetaData,
  setDrawerVisible,
}: FilterButtonProps) => {
  return (
    <Badge count={filterCount || 0}>
      {isLoadingMetaData ? (
        <ButtonSkeleton active={true} />
      ) : (
        <Button
          icon={<FilterOutlined />}
          onClick={() => setDrawerVisible(true)}
        >
          Filters
        </Button>
      )}
    </Badge>
  );
};

export default FilterButton;
