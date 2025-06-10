import { config as jsonServerConfig } from "@/json-server/config";
import {
  DeleteBodySchema,
  GetQuerySchema,
  PostBodySchema,
  PutBodySchema,
} from "@/schemas";
import { proxyRequest } from "@/utils";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function GET(req: NextRequest) {
  try {
    const query = Object.fromEntries(new URL(req.url).searchParams);
    const parsedQuery = GetQuerySchema.parse(query);

    const url = new URL(req.url);
    url.pathname = url.pathname.replace(/^\/api\//, "");
    url.search = "";

    // Add sorting
    if (parsedQuery.sort.length > 0) {
      const sortFields = parsedQuery.sort.map(({ field }) => field).join(",");
      const sortOrders = parsedQuery.sort.map(({ order }) => order).join(",");
      url.searchParams.append("_sort", sortFields);
      url.searchParams.append("_order", sortOrders);
    }

    // Add filters
    if (parsedQuery.filter.length > 0) {
      parsedQuery.filter.forEach(({ field, value }) => {
        if (typeof value === "object" && !Array.isArray(value)) {
          // Range filter
          if (field === "timestamp") {
            if (value.min) {
              url.searchParams.append(
                "timestamp_gte",
                new Date(value.min).toISOString()
              );
            }
            if (value.max) {
              url.searchParams.append(
                "timestamp_lte",
                new Date(value.max).toISOString()
              );
            }
          } else if (field === "amount" || field === "fees.processing_fee") {
            if (value.min) {
              url.searchParams.append(`${field}_gte`, value.min.toString());
            }
            if (value.max) {
              url.searchParams.append(`${field}_lte`, value.max.toString());
            }
          }
        } else if (Array.isArray(value)) {
          // Array filter (e.g., status)
          value.forEach((v) => url.searchParams.append(field, v));
        } else {
          // Exact match
          url.searchParams.append(field, value.toString());
        }
      });
    }

    // Add search
    if (parsedQuery.search) {
      url.searchParams.append("q", parsedQuery.search);
    }

    // Fetch total count (without pagination)
    const countUrl = new URL(url);
    const countResponse = await fetch(
      `http://localhost:${jsonServerConfig.port}${countUrl.pathname}${countUrl.search}`
    );
    const countData = await countResponse.json();
    const total = Array.isArray(countData) ? countData.length : 0;
    const maxPage = Math.ceil(total / parsedQuery.size);

    // Add pagination
    const offset = (parsedQuery.page - 1) * parsedQuery.size;
    url.searchParams.append("_start", offset.toString());
    url.searchParams.append("_limit", parsedQuery.size.toString());

    const response = await proxyRequest(req, `${url.pathname}${url.search}`);
    const data = await response.json();

    // Wrap response with total and maxPage
    const responseBody: GetResponse = {
      data: Array.isArray(data) ? data : [],
      total,
      maxPage,
    };

    return new NextResponse(JSON.stringify(responseBody), {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(
          JSON.stringify(responseBody)
        ).toString(),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify({ error: error.errors }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsedBody = PostBodySchema.parse(body);
    const url = new URL(req.url).pathname.replace(/^\/api\//, "");
    return proxyRequest(req, url, parsedBody);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify({ error: error.errors }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const parsedBody = PutBodySchema.parse(body);
    const url =
      new URL(req.url).pathname.replace(/^\/api\//, "") + `/${parsedBody?.id}`;
    return proxyRequest(req, url, parsedBody);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify({ error: error.errors }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const parsedBody = DeleteBodySchema.parse(body);

    const deletePromises = parsedBody.ids.map(async (id) => {
      const deleteUrl = new URL(req.url);
      deleteUrl.pathname = `/transactions/${id}`;
      return fetch(
        `http://localhost:${jsonServerConfig.port}${deleteUrl.pathname}`,
        {
          method: "DELETE",
        }
      );
    });

    const responses = await Promise.all(deletePromises);
    const failed = responses.filter((res) => !res.ok);

    if (failed.length > 0) {
      return new NextResponse(
        JSON.stringify({ error: "Some deletions failed" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new NextResponse(
      JSON.stringify({ message: "Transactions deleted successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify({ error: error.errors }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
