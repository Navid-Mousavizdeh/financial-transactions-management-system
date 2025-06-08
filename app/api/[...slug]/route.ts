import { NextRequest, NextResponse } from "next/server";
import { config as jsonServerConfig } from "@/json-server/config";

async function proxyRequest(req: NextRequest) {
  const url = new URL(req.url);
  url.pathname = url.pathname.replace(/^\/api\//, "");
  const targetUrl = `http://localhost:${jsonServerConfig.port}${url.pathname}${url.search}`;

  const init: RequestInit = {
    method: req.method,
    headers: req.headers,
    body: ["GET", "HEAD"].includes(req.method ?? "")
      ? undefined
      : await req.arrayBuffer().then((buf) => Buffer.from(buf)),
    redirect: "manual",
  };

  const response = await fetch(targetUrl, init);
  const resBody = await response.arrayBuffer();

  const resHeaders = new Headers(response.headers);

  return new NextResponse(resBody, {
    status: response.status,
    statusText: response.statusText,
    headers: resHeaders,
  });
}

export async function GET(req: NextRequest) {
  return proxyRequest(req);
}

export async function POST(req: NextRequest) {
  return proxyRequest(req);
}

export async function PUT(req: NextRequest) {
  return proxyRequest(req);
}

export async function DELETE(req: NextRequest) {
  return proxyRequest(req);
}

export async function PATCH(req: NextRequest) {
  return proxyRequest(req);
}
