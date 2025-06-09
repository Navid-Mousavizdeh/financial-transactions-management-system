import { NextRequest, NextResponse } from "next/server";
import { config as jsonServerConfig } from "@/json-server/config";

export async function proxyRequest(req: NextRequest, url: string, body?: any) {
  const targetUrl = `http://localhost:${jsonServerConfig.port}${url}`;

  const init: RequestInit = {
    method: req.method,
    headers: {
      ...Object.fromEntries(req.headers),
      "Content-Type": "application/json",
      "Accept-Encoding": "identity",
    },
    body: body
      ? JSON.stringify(body)
      : ["GET", "HEAD"].includes(req.method)
      ? undefined
      : await req.text(),
    redirect: "manual",
  };

  const response = await fetch(targetUrl, init);
  const resBody = await response.json();

  const resHeaders = new Headers(response.headers);
  resHeaders.set("Content-Type", "application/json");
  resHeaders.delete("Content-Encoding");

  const serializedBody = JSON.stringify(resBody);
  resHeaders.set(
    "Content-Length",
    Buffer.byteLength(serializedBody).toString()
  );

  return new NextResponse(serializedBody, {
    status: response.status,
    statusText: response.statusText,
    headers: resHeaders,
  });
}
