import { NextRequest, NextResponse } from "next/server";
import { ENDPOINTS, buildRequestDetails, type EndpointId, type PlaygroundRequestPayload } from "@/lib/api-config";

type UpstreamBody = Record<string, unknown> | unknown[] | string | null;

function isEndpointId(value: string): value is EndpointId {
  return value in ENDPOINTS;
}

function sanitizeParams(input: PlaygroundRequestPayload["params"]) {
  return Object.entries(input).reduce<Record<string, string | string[]>>((acc, [key, value]) => {
    if (value === "" || value === null || value === undefined) {
      return acc;
    }

    if (Array.isArray(value)) {
      const normalized = value.filter(Boolean);
      if (normalized.length > 0) {
        acc[key] = normalized;
      }
      return acc;
    }

    acc[key] = value;
    return acc;
  }, {});
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.IPGEOLOCATION_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        error: "Server configuration error",
        message: "IPGEOLOCATION_API_KEY is missing. Add it to your .env file.",
      },
      { status: 500 },
    );
  }

  let payload: PlaygroundRequestPayload;

  try {
    payload = (await request.json()) as PlaygroundRequestPayload;
  } catch {
    return NextResponse.json(
      {
        error: "Invalid request",
        message: "Request body must be valid JSON.",
      },
      { status: 400 },
    );
  }

  if (!payload?.endpointId || !isEndpointId(payload.endpointId)) {
    return NextResponse.json(
      {
        error: "Invalid endpoint",
        message: "Select a supported playground endpoint.",
      },
      { status: 400 },
    );
  }

  const params = sanitizeParams(payload.params ?? {});
  const { url, maskedUrl, curlCommand, codeSnippets, headers } = buildRequestDetails(
    payload.endpointId,
    params,
    apiKey,
  );

  let statusCode = 500;
  let responseBody: UpstreamBody = null;
  let responseHeaders: Record<string, string> = {};
  const startedAt = performance.now();

  try {
    const upstreamResponse = await fetch(url, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    statusCode = upstreamResponse.status;
    responseHeaders = {
      "content-type": upstreamResponse.headers.get("content-type") ?? "",
      "x-credits-charged": upstreamResponse.headers.get("x-credits-charged") ?? "",
      "retry-after": upstreamResponse.headers.get("retry-after") ?? "",
    };

    const rawText = await upstreamResponse.text();

    try {
      responseBody = JSON.parse(rawText) as UpstreamBody;
    } catch {
      responseBody = rawText;
    }
  } catch (error) {
    const durationMs = Math.round(performance.now() - startedAt);
    return NextResponse.json(
      {
        endpointId: payload.endpointId,
        maskedUrl,
        curlCommand,
        codeSnippets,
        statusCode: 502,
        durationMs,
        responseHeaders,
        error: "Upstream request failed",
        message:
          error instanceof Error
            ? error.message
            : "The server could not reach api.ipgeolocation.io.",
        response: null,
      },
      { status: 502 },
    );
  }

  const durationMs = Math.round(performance.now() - startedAt);

  return NextResponse.json(
    {
      endpointId: payload.endpointId,
      maskedUrl,
      curlCommand,
      codeSnippets,
      statusCode,
      durationMs,
      responseHeaders,
      response: responseBody,
    },
    { status: statusCode },
  );
}

