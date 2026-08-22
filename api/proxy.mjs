// ======================================================
// LOAD ENV VARIABLES
// ======================================================

const EXPECTED_ACTION = "runSecurityCheck";
const configText = await Deno.readTextFile("./deno.json");
const securityConfig = JSON.parse(configText);
import { decryptWithRandomIV } from "../utils/decrypt.authtag.mjs"

// ======================================================
// SECURITY CONFIGURATION
// ======================================================

// Trusted Origins (CORS + CSP validation)
const RESTRICITED_ORIGINS = new Set([
  "https://vas-management-system.vercel.app",
  "http://127.0.0.1:3000",
]);

// Trusted Methods
const ALLOWED_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"];

// Trusted Request Headers
const ALLOWED_HEADERS = [
  // "authorization",
  // "x-requested-with", // useful for third party authorized application
  "content-type", "postman-token", "origin", "accept-encoding" , 
  "user-agent", "x-forwarded-for", "x-request-id", "x-user-role",
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
const BLOCKED_AGENTS = ["sqlmap", "nikto", "wget", "masscan", "nmap"];

// Restricted agents
const RESTRICTED_AGENTS = ["curl", "python-requests" , "http" , "https"];

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
// console.log("Deno KV: " , kv);

// Seed allowed IPs
await kv.set(["allowed_ips", "127.0.0.1"], true);
await kv.set(["allowed_ips", "192.168.1.10"], true);
await kv.set(["allowed_ips", "::ffff:127.0.0.1"], true);


// console.log("Deno KV: " , kv);

// ======================================================
// HELPERS
// ======================================================

function getClientIP(req) {
  const forwarded = req.ip;
  console.log("IP: " , forwarded);
  const reqForwarded = forwarded.trim();
  if(reqForwarded === "::1") return "127.0.0.1" || "unknown";

}

function isAllowedDevice(req) {

  const device_id = req.device_id;
  const adminDevices = securityConfig.allowed_devices || [];
  // console.log("Admin Devices: " , adminDevices);
  return adminDevices.some(device => 
    device.device_id === device_id 
  );
}


async function isAllowedUsers(body) {

  // STEP 01 : NEEDS TO IMPORT THE DECRIPT AUTH TAG.
  const actualBody = await decryptWithRandomIV(body);
  console.log("Actual Body: " , actualBody);

  // STEP 02 : NEEDS TO VERIFIED FROM OUR KV DATABASE.
  const device_id = actualBody.sub;
  const verifiedUsers = securityConfig.allowed_oidc_users || [];
  // console.log("Admin Devices: " , adminDevices);
  return verifiedUsers.some(device => 
    device.google_user_id === device_id 
  );
}

async function isAllowedIP(ip , req) {
  // console.log("ip: " , ip);
  const result = await kv.get(["allowed_ips", ip]);

  // console.log("Result Value: " , result);
  
  // UTIL TO CHECK THE DEVICE ID FOR SERVER SIDE REDIRECTING
  // if (result.value === true && isAllowedDevice(req) === true) return true;

  // UTIL TO CHECK THE USER ODIC FROM GOOGLE CONSOLE API ENDPOINT
  // if (result.value === true && isAllowedUsers(req) === true) return true;

  // console.log("Result: " , result);
  return result;
}

function hasValidOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return false;
  return RESTRICITED_ORIGINS.has(origin);
}

function hasValidMethod(req) {
  return ALLOWED_METHODS.includes(req.method?.toUpperCase());
}

// ======================================================
// ADMIN VALIDATION
// ======================================================

function isAdminRequest(req) {
  const requestId = req.headers["x-request-id"];
  const role = req.headers["x-user-role"];
  // console.log("Role: " , role)
  if (!requestId || !role) return false;

  const adminUsers = securityConfig.adminUsers || [];
  return adminUsers.some(user => 
    user.requestId === requestId && user.role === role && role === "admin"
  );
}

// ====================================================
// RESTRICTED AGENTS
// ====================================================

function hasValidUserAgent(req) {
  const ua = (req.headers["user-agent"] || "").toLowerCase();
  // console.log("User Agent: " , ua)

  if (BLOCKED_AGENTS.some(agent => ua.includes(agent))) return false;

  if (RESTRICTED_AGENTS.some(agent => ua.includes(agent))) {
    return isAdminRequest(req);
  }

  return false;
}


// ======================================================
// USER AGENT VALIDATION
// ======================================================

function hasValidHeaders(req) {
  for (const header in req.headers) {
    const normalized = header.toLowerCase();
    // ====================================================
    // HARD BLOCKED AGENTS
    // ====================================================
    if (["sec-", "host", "connection", "accept", "user-agent", "origin", 
         "referer", "content-length", "postman-token", "x-forwarded-for"]
         .some(skip => normalized === skip || normalized.startsWith("sec-"))) {
      continue;
    }
    if (!ALLOWED_HEADERS.includes(normalized)) return false;
  }
  return true;
}

// ======================================================
// MAIN SECURITY CHECK FUNCTION
// ======================================================

async function runSecurityCheck(payload) {
  // console.log("Payload: " , payload);
  const req = { 
    method : payload.method,
    // device_id : payload.device_id,   // DISABLE ON TEMPARRORY BASIS
    url: payload.originalUrl,
    hostname: payload.hostname,
    ip : payload.socket.remoteAddress,
    headers : payload.headers
  };

  // console.log("Req. Body : " , req)

  const ip = getClientIP(req);
  // console.log(`[${ip}] ${req.method} ${req.headers['origin']}`);

  // === IP Whitelist ===
  if (!(await isAllowedIP(ip , req))) {
    return { allowed: false, status: 403, message: "Access Denied" };
  }

  // === User Agent ===
  if (!hasValidUserAgent(req)) {
    return { allowed: false, status: 403, message: "Forbidden" };
  }

  // === Method ===
  if (!hasValidMethod(req)) {
    return { allowed: false, status: 405, message: "Method Not Allowed" };
  }

  // === Origin ===
  if (!hasValidOrigin(req)) {
    return { allowed: false, status: 403, message: "Invalid Origin" };
  }

  // === Valid Headers ===
  if (!hasValidHeaders(req)) {
    return { allowed: false, status: 403, message: "Invalid Request Headers" };
  }

  // === Block Direct Access ===
  if (req.hostname ===  RESTRICITED_ORIGINS[0] || req.hostname === RESTRICITED_ORIGINS[1]) {
    return { allowed: false, status: 403, message: "Direct Access Blocked" };
  }

  // === Return Success with Headers ===
  return {
    allowed: true
  };
}

// ======================================================
// LISTEN FOR INPUT FROM NODE.JS
// ======================================================

async function processPayload(rawInput) {
  try {
    if (!rawInput) {
      throw new Error("Empty input from Node.js");
    }

    const payload = JSON.parse(rawInput);

    if (payload.action !== EXPECTED_ACTION) {
      console.error(`Invalid action: ${payload.action}`);
      console.log(JSON.stringify({
        allowed: false,
        status: 403,
        message: "Invalid Function Identifier"
      }));
      Deno.exit(1);
    }

     // 1. Await the security check response
     const response = await runSecurityCheck(payload);

     console.log(JSON.stringify(response));
  
    //  return response;

  } catch (err) {
    console.error("Parse Error:", err.message);
    console.log(JSON.stringify({
      allowed: false,
      status: 500,
      message: "Invalid Request Payload"
    }));
    Deno.exit(1);
  }
}

let inputData = "";

async function readFromStdin() {
  const decoder = new TextDecoder();

  for await (const chunk of Deno.stdin.readable) {
    const text = decoder.decode(chunk, { stream: true });
    inputData += text;
    
    // console.log("[DEBUG] Chunk received:", text);   // ← Better logging
  }

  // All data received
  // console.log("[DEBUG] Full payload received:", inputData.trim());
  
  processPayload(inputData.trim());
  // console.log("Hello World!")
}

// Start reading
await readFromStdin();