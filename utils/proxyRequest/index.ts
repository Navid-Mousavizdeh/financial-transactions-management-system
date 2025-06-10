import { NextRequest, NextResponse } from "next/server";
import { config as jsonServerConfig } from "@/json-server/config";

export async function proxyRequest(req: NextRequest, url: string, body?: any) {
  const targetUrl = `http://localhost:${jsonServerConfig.port}${
    url.startsWith("/") ? url : `/${url}`
  }`;

  // Log request details
  console.log("Proxy Request:", {
    targetUrl,
    method: req.method,
    providedBody: body,
  });

  // Prepare request body
  let requestBody: string | undefined;
  let contentLength: string | undefined;

  if (body) {
    // Explicit body provided (e.g., DELETE with IDs)
    try {
      requestBody = JSON.stringify(body);
      contentLength = Buffer.byteLength(requestBody, "utf8").toString();
      console.log(
        "Explicit Body:",
        requestBody,
        "Content-Length:",
        contentLength
      );
    } catch (error) {
      console.error("Error serializing provided body:", error);
      return new NextResponse(
        JSON.stringify({ error: "Invalid body format" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  } else if (!["GET", "HEAD"].includes(req.method)) {
    // Read body for POST, PUT, DELETE
    try {
      const rawBody = await req.text();
      if (rawBody) {
        // Validate JSON
        const parsedBody = JSON.parse(rawBody);
        requestBody = JSON.stringify(parsedBody); // Re-serialize to ensure clean JSON
        contentLength = Buffer.byteLength(requestBody, "utf8").toString();
        console.log(
          "Request Body:",
          requestBody,
          "Content-Length:",
          contentLength
        );
      } else {
        console.log("No request body provided");
      }
    } catch (error) {
      console.error("Error processing request body:", error);
      return new NextResponse(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  const init: RequestInit = {
    method: req.method,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "Accept-Encoding": "identity",
      ...(contentLength && { "Content-Length": contentLength }),
    },
    body: requestBody,
    redirect: "manual",
  };

  try {
    const response = await fetch(targetUrl, init);
    const resBodyText = await response.text();

    console.log("Response:", {
      status: response.status,
      statusText: response.statusText,
      body: resBodyText,
    });

    const resHeaders = new Headers();
    resHeaders.set("Content-Type", "application/json");

    // Parse response body only if non-empty
    const resBody = resBodyText ? JSON.parse(resBodyText) : {};
    const serializedBody = JSON.stringify(resBody);
    resHeaders.set(
      "Content-Length",
      Buffer.byteLength(serializedBody, "utf8").toString()
    );

    return new NextResponse(serializedBody, {
      status: response.status,
      statusText: response.statusText,
      headers: resHeaders,
    });
  } catch (error: any) {
    console.error("Proxy request failed:", {
      message: error.message,
      cause: error.cause,
      code: error.code,
    });
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
