// ======================================================
// LOAD ENV VARIABLES
// ======================================================

import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

// FOR VERCEL SERVER HANDLING 
import { NextResponse } from "next/server";

const configText = await Deno.readTextFile(
  "./deno.json"
);

const securityConfig =
  JSON.parse(configText);

// ======================================================
// CONFIG
// ======================================================

const NODE_BACKEND =
  Deno.env.get("PROXY_LOCALHOST") ||
  "http://127.0.0.1:3000";

const PORT = Number(
  Deno.env.get("DENO_PORT") || 8080
);

// ======================================================
// SECURITY CONFIGURATION
// ======================================================

// Trusted Origins (CORS + CSP validation)
const ALLOWED_ORIGINS = new Set([
  "https://vas-management-system.vercel.app",
  "http://127.0.0.1:3000"
]);

// Trusted Methods
const ALLOWED_METHODS = [
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "OPTIONS",
];

// Trusted Request Headers
const ALLOWED_HEADERS = [
  "content-type",
  // "authorization",
  // "x-requested-with", // useful for third party authorized application
  "postman-token",
  "accept-encoding",
  "origin",
  "user-agent",
  "x-forwarded-for",
  "x-request-id",
  "x-user-role",
];

// ======================================================
// BLOCKED USER AGENTS
// ======================================================
//
// curl + python-requests are blocked
// EXCEPT when:
// 1. request-id exists
// 2. user role === admin
// 3. request-id exists inside deno.json
//
// ======================================================

const BLOCKED_AGENTS = [
  "sqlmap",
  "nikto",
  "wget",
  "masscan",
  "nmap",
];

// Restricted agents
const RESTRICTED_AGENTS = [
  "curl",
  "python-requests",
];

// ======================================================
// DENO PERMISSION API CHECK
// ======================================================

const readPermission =
  await Deno.permissions.query({
    name: "read",
    path: "./deno.json",
  });

if (readPermission.state !== "granted") {

  console.error(
    "Read permission denied for deno.json"
  );

  Deno.exit(1);
}

// ======================================================
// LOOKUP TABLE (IP WHITELIST)
// ======================================================

const kv = await Deno.openKv();

// Seed allowed IPs
await kv.set(["allowed_ips", "127.0.0.1"], true);
await kv.set(["allowed_ips", "192.168.1.10"], true);

// ======================================================
// HELPERS
// ======================================================

function getClientIP(Request) {

  const forwarded =
    Request.headers.get("x-forwarded-for");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  return "unknown";
}

async function isAllowedIP(ip) {

  const result = await kv.get([
    "allowed_ips",
    ip,
  ]);

  // console.log("Result:" , result.value);
  return result.value === true;
}

function hasValidOrigin(Request) {

  const origin =
    Request.headers.get("origin");

  // Allow server-to-server traffic
  if (!origin) {
    return true;
  }

  return ALLOWED_ORIGINS.has(origin);
}


async function hasValidHeaders(Request) {

  const requestHeaders =
    Request.headers;
  // console.log("Request Headers : " , Request.headers);

  for (const header of requestHeaders.keys()) {

    const normalized =
    header.toLowerCase();
    // console.log("Req. Headers: " , normalized);

    // Ignore browser/system headers
    if (
      normalized.startsWith("sec-") ||
      normalized.startsWith("x-forwarded-for") ||
      normalized === "host" ||
      normalized === "connection" ||
      normalized === "accept" ||
      normalized === "user-agent" ||
      normalized === "origin" ||
      normalized === "referer" ||
      normalized === "content-length" ||
      normalized === "postman-token"
    ) {
      continue;
    }

    if (!ALLOWED_HEADERS.includes(normalized)) {
      return false;

    }
  }

  return true;
}

function hasValidMethod(Request) {

  return ALLOWED_METHODS.includes(
    Request.method.toUpperCase()
  );
}

// ======================================================
// ADMIN VALIDATION
// ======================================================

function isAdminRequest(Request) {

  const requestId =
    Request.headers.get("x-request-id");

  const role =
    Request.headers.get("x-user-role");

  if (!requestId || !role) {
    return false;
  }

  const adminUsers =
    securityConfig.adminUsers || [];

  return adminUsers.some(
    (user) =>
      user.requestId === requestId &&
      user.role === role &&
      role === "admin"
  );
}

// ======================================================
// USER AGENT VALIDATION
// ======================================================

function hasValidUserAgent(Request) {

  const ua = (
    Request.headers.get("user-agent") || ""
  ).toLowerCase();

  // ====================================================
  // HARD BLOCKED AGENTS
  // ====================================================

  const blocked =
    BLOCKED_AGENTS.some((agent) =>
      ua.includes(agent)
    );

  if (blocked) {
    return false;
  }

  // ====================================================
  // RESTRICTED AGENTS
  // ====================================================

  const restricted =
    RESTRICTED_AGENTS.some((agent) =>
      ua.includes(agent)
    );

  // Allow curl/python-requests only for admins
  if (restricted) {
    return isAdminRequest(Request);
  }

  return true;
}

// ======================================================
// START SERVER
// ======================================================

console.log(
  `Secure Reverse Proxy Running :${PORT}`
);

// ======================================================
// MAIN SERVER
// ======================================================

serve(async (req) => {

  // ====================================================
  // EXTRACT CLIENT DETAILS
  // ====================================================

  const ip = getClientIP(req);

  console.log(
    `[${ip}] ${req.method} ${req.url}`
  );

  // ====================================================
  // HYBRID SECURITY LAYER
  // ====================================================

  // 1. IP WHITELIST VALIDATION
  const allowedIP =
    await isAllowedIP(ip);

  if (!allowedIP) {

    console.warn(
      `Blocked Unknown IP : ${ip}`
    );

    return new NextResponse(
      "Access Denied",
      {
        status: 403,
      }
    );
  }

  // 2. USER AGENT VALIDATION
  if (!hasValidUserAgent(req)) {

    console.warn(
      `Blocked Suspicious Agent : ${ip}`
    );

    return new Response(
      "Forbidden",
      {
        status: 403,
      }
    );
  }

  // 3. METHOD VALIDATION
  if (!hasValidMethod(req)) {

    return new NextResponse(
      "Method Not Allowed",
      {
        status: 405,
      }
    );
  }

  // 4. ORIGIN VALIDATION
  if (!hasValidOrigin(req)) {

    console.warn(
      `Blocked Invalid Origin : ${ip}`
    );

    return new NextResponse(
      "Invalid Origin",
      {
        status: 403,
      }
    );
  }

  // 5. HEADER POLICY VALIDATION
  if (!hasValidHeaders(req)) {

    console.warn(
      `Blocked Invalid Headers : ${ip}`
    );

    return new NextResponse(
      "Invalid Request Headers",
      {
        status: 403,
      }
    );
  }

  // ====================================================
  // BUILD TARGET URL
  // ====================================================

  const url = new URL(req.url);

  const proxyUrl =
    `${NODE_BACKEND}${url.pathname}${url.search}`;

  // ====================================================
  // FORWARD HEADERS
  // ====================================================

  const headers =
    new Headers(req.headers);

  headers.set(
    "x-forwarded-for",
    ip
  );

  headers.set(
    "x-forwarded-proto",
    "https"
  );

  headers.set(
    "x-real-ip",
    ip
  );

  try {

    // ==================================================
    // PROXY REQUEST
    // ==================================================

    const response = await fetch(
      proxyUrl,
      {
        method: req.method,
        headers,
        body:
          req.method === "GET" ||
          req.method === "HEAD"
            ? undefined
            : req.body,
        redirect: "manual",
      }
    );

    // ==================================================
    // HARDEN RESPONSE HEADERS
    // ==================================================

    const responseHeaders =
      new Headers(response.headers);

    // Hide Framework Signature
    responseHeaders.delete(
      "x-powered-by"
    );

    responseHeaders.delete(
      "server"
    );

    // ==================================================
    // SECURITY HEADERS
    // ==================================================

    responseHeaders.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
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
      "strict-origin-when-cross-origin"
    );

    responseHeaders.set(
      "Permissions-Policy",
      "camera=(), microphone=(), geolocation=()"
    );

    responseHeaders.set(
      "Content-Security-Policy",
      [
        "default-src 'self'",
        "script-src 'self'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data:",
        "connect-src 'self'",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ].join("; ")
    );

    // ==================================================
    // CORS POLICY
    // ==================================================

    const origin =
      req.headers.get("origin");

    if (
      origin &&
      ALLOWED_ORIGINS.has(origin)
    ) {

      responseHeaders.set(
        "Access-Control-Allow-Origin",
        origin
      );

      responseHeaders.set(
        "Access-Control-Allow-Methods",
        ALLOWED_METHODS.join(", ")
      );

      responseHeaders.set(
        "Access-Control-Allow-Headers",
        ALLOWED_HEADERS.join(", ")
      );

      responseHeaders.set(
        "Access-Control-Allow-Credentials",
        "true"
      );
    }

    // ==================================================
    // RETURN SECURED RESPONSE
    // ==================================================

    return new NextResponse(
      response.body,
      {
        status: response.status,
        headers: responseHeaders,
      }
    );

  } catch (err) {

    console.error(
      "Proxy Error:",
      err
    );

    return new NextResponse(
      "Bad Gateway",
      {
        status: 502,
      }
    );
  }

}, {
  port: PORT,
});