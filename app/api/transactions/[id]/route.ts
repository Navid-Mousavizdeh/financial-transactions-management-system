import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { config as jsonServerConfig } from "@/json-server/config";
import { TransactionSchema } from "@/schemas";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate ID format
    const idSchema = z.string();
    const idValidation = idSchema.safeParse(id);
    if (!idValidation.success) {
      return NextResponse.json(
        { message: "Invalid transaction ID format" },
        { status: 400 }
      );
    }

    // Construct JSON Server URL
    const jsonServerUrl = `http://localhost:${jsonServerConfig.port}/transactions?id=${id}`;

    // Fetch transaction from JSON Server
    const response = await fetch(jsonServerUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { message: `Transaction with ID ${id} not found` },
          { status: 404 }
        );
      }
      throw new Error(`Failed to fetch transaction: ${response.statusText}`);
    }

    const transaction = await response.json();

    if (transaction?.length) {
      // Validate transaction data
      const validation = TransactionSchema.safeParse(transaction[0]);
      if (!validation.success) {
        return NextResponse.json(
          {
            message: "Invalid transaction data",
            errors: validation.error.issues,
          },
          { status: 500 }
        );
      }
      return NextResponse.json(transaction[0], { status: 200 });
    } else {
      return NextResponse.json(
        {
          message: "No Transaction with this Id",
        },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error fetching transaction:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
