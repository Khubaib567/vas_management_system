// =========================
// LOAD ENV VARIABLES
// =========================

import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

// =========================
// CONFIG
// =========================

const NODE_BACKEND =
  Deno.env.get("PROXY_LOCALHOST") ||
  "http://localhost:3000";

const PORT = Number(
  Deno.env.get("DENO_PORT") || 8080
);

// =========================
// START SERVER
// =========================

console.log(`Reverse proxy running on :${PORT}`);

serve(async (req) => {

  // =========================
  // BASIC SECURITY FILTERS
  // =========================

  const ip =
    req.headers.get("x-forwarded-for") ||
    "unknown";

  console.log(
    `[${ip}] ${req.method} ${req.url}`
  );

  // BLOCK SUSPICIOUS USER AGENTS
  const ua =
    req.headers.get("user-agent") || "";

  const blockedAgents = [
    "sqlmap",
    "nikto",
    "curl",
    "wget",
  ];

  if (
    blockedAgents.some((agent) =>
      ua.toLowerCase().includes(agent)
    )
  ) {
    return new Response("Forbidden", {
      status: 403,
    });
  }

  // =========================
  // BUILD PROXY URL
  // =========================

  const url = new URL(req.url);

  const proxyUrl =
    `${NODE_BACKEND}${url.pathname}${url.search}`;

  // =========================
  // FORWARD HEADERS
  // =========================

  const headers = new Headers(req.headers);

  headers.set(
    "x-forwarded-for",
    ip
  );

  headers.set(
    "x-forwarded-proto",
    "https"
  );

  try {

    // =========================
    // FORWARD REQUEST
    // =========================

    const response = await fetch(proxyUrl, {
      method: req.method,
      headers,
      body:
        req.method === "GET" ||
        req.method === "HEAD"
          ? undefined
          : req.body,
      redirect: "manual",
    });

    // =========================
    // RESPONSE SECURITY
    // =========================

    const responseHeaders =
      new Headers(response.headers);

    // HIDE EXPRESS SIGNATURE
    responseHeaders.delete(
      "x-powered-by"
    );

    // SECURITY HEADERS
    responseHeaders.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains"
    );

    responseHeaders.set(
      "X-Frame-Options",
      "DENY"
    );

    responseHeaders.set(
      "X-Content-Type-Options",
      "nosniff"
    );

    responseHeaders.set(
      "Referrer-Policy",
      "no-referrer"
    );

    return new Response(response.body, {
      status: response.status,
      headers: responseHeaders,
    });

  } catch (err) {

    console.error(
      "Proxy Error:",
      err
    );

    return new Response(
      "Bad Gateway",
      {
        status: 502,
      }
    );
  }

}, {
  port: PORT,
});