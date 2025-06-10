"use client";

import { Transactions } from "@/features";
import TransactionForm from "@/features/TransactionForm";
import { use } from "react";

export default function Home({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <TransactionForm id={id} />;
}
