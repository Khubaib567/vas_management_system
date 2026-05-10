// CONFIG ENVIRONMENT VARIABLES.
if(process.env.ENV !== "production"){
  require('dotenv').config({path : './.secrets/.env'})
}


import { serve } from "https://deno.land/std/http/server.ts";

const NODE_BACKEND = process.env.PROXY_LOCALHOST;

serve(async (req) => {

  // =========================
  // BASIC SECURITY FILTERS
  // =========================

  const ip =
    req.headers.get("x-forwarded-for") ||
    "unknown";

  console.log(`[${ip}] ${req.method} ${req.url}`);

  // BLOCK SUSPICIOUS USER AGENTS
  const ua = req.headers.get("user-agent") || "";

  const blockedAgents = [
    "sqlmap",
    "nikto",
    "curl",
    "wget"
  ];

  if (
    blockedAgents.some(agent =>
      ua.toLowerCase().includes(agent)
    )
  ) {
    return new Response("Forbidden", {
      status: 403,
    });
  }

  // =========================
  // FORWARD REQUEST
  // =========================

  const url = new URL(req.url);

  const proxyUrl =
    `${NODE_BACKEND}${url.pathname}${url.search}`;

  const headers = new Headers(req.headers);

  // FORWARD REAL CLIENT IP
  headers.set(
    "x-forwarded-for",
    ip
  );

  headers.set(
    "x-forwarded-proto",
    "https"
  );

  try {

    const response = await fetch(proxyUrl, {
      method: req.method,
      headers,
      body:
        req.method === "GET" ||
        req.method === "HEAD"
          ? undefined
          : req.body,
    });

    const responseHeaders =
      new Headers(response.headers);

    // HIDE EXPRESS SIGNATURE
    responseHeaders.delete("x-powered-by");

    // EXTRA SECURITY HEADERS
    responseHeaders.set(
      "Strict-Transport-Security",
      "max-age=31536000"
    );

    responseHeaders.set(
      "X-Frame-Options",
      "DENY"
    );

    responseHeaders.set(
      "X-Content-Type-Options",
      "nosniff"
    );

    return new Response(response.body, {
      status: response.status,
      headers: responseHeaders,
    });

  } catch (err) {

    console.error(err);

    return new Response(
      "Bad Gateway",
      { status: 502 }
    );
  }
}, {
  port: 8080,
});