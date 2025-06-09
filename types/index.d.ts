type Transaction = {
  id: string;
  amount: number;
  currency: string;
  status: "completed" | "pending" | "failed";
  timestamp: string;
  description: string;
  merchant: {
    name: string;
    id: string;
  };
  payment_method: {
    type: string;
    last4: string;
    brand: string;
  };
  sender: {
    name: string;
    account_id: string;
  };
  receiver: {
    name: string;
    account_id: string;
  };
  fees: {
    processing_fee: number;
    currency: string;
  };
  metadata: {
    order_id: string;
    customer_id: string;
  };
};

type GetQuery = {
  sort: { field: string; order: "asc" | "desc" }[];
  filter: {
    field: string;
    value: string | number | string[] | { min?: number; max?: number };
  }[];
  search?: string;
  page: number;
  size: number;
};
