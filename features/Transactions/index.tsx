import { Suspense } from "react";
import { TransactionTable } from "./components";

const Transactions = () => {
  return (
    <Suspense fallback={<div>Loading transactions...</div>}>
      <TransactionTable />
    </Suspense>
  );
};

export default Transactions;
