import { config as jsonServerConfig } from "@/json-server/config";
import { NextResponse } from "next/server";

type QueryMetaDataResponse = {
  amount: { min: number; max: number };
  timestamp: { min: string; max: string };
  merchant_name: string[];
  payment_method: string[];
};

export async function GET() {
  try {
    // Fetch all transactions
    const response = await fetch(
      `http://localhost:${jsonServerConfig.port}/transactions`
    );

    if (!response.ok) {
      return new NextResponse(
        JSON.stringify({ error: "Failed to fetch transactions" }),
        {
          status: response.status,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const transactions = await response.json();

    if (!Array.isArray(transactions)) {
      return new NextResponse(
        JSON.stringify({ error: "Invalid data format" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Process transactions to extract metadata
    const metadata: QueryMetaDataResponse = {
      amount: { min: 0, max: 0 },
      timestamp: { min: "", max: "" },
      merchant_name: [],
      payment_method: [],
    };

    if (transactions.length > 0) {
      // Calculate amount range
      metadata.amount = transactions.reduce(
        (acc: { min: number; max: number }, t: Transaction) => ({
          min: Math.min(acc.min, t.amount),
          max: Math.max(acc.max, t.amount),
        }),
        { min: transactions[0].amount, max: transactions[0].amount }
      );

      // Calculate timestamp range
      metadata.timestamp = transactions.reduce(
        (acc: { min: string; max: string }, t: Transaction) => ({
          min: acc.min
            ? t.timestamp < acc.min
              ? t.timestamp
              : acc.min
            : t.timestamp,
          max: acc.max
            ? t.timestamp > acc.max
              ? t.timestamp
              : acc.max
            : t.timestamp,
        }),
        { min: transactions[0].timestamp, max: transactions[0].timestamp }
      );

      // Collect unique merchant names
      metadata.merchant_name = Array.from(
        new Set(transactions.map((t: Transaction) => t.merchant.name))
      ).sort();

      // Collect unique payment method types
      metadata.payment_method = Array.from(
        new Set(transactions.map((t: Transaction) => t.payment_method.type))
      ).sort();
    }

    return new NextResponse(JSON.stringify(metadata), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(
          JSON.stringify(metadata)
        ).toString(),
      },
    });
  } catch {
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
