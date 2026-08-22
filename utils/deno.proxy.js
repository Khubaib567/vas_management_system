
// CONFIG ENVIRONMENT VARIABLES.
if(process.env.ENV !== "production"){
  require('dotenv').config({path : './.secrets/.env'})
}

const { spawn } = require("child_process");
const path = require("path");
const http = require('http');
const https = require('https');
const axios = require("axios");
// const getNodeID = require("../utils/device.identifier");

let denoProcess = null;

const runCloudDeno = async (requestPayload) => {

  // console.log("Deno Production URL: " , process.env.DENO_PRODUCTION_URL)
  // console.log("Request. Payload: " , requestPayload);
  try {
    // Apply them in the request config
    const proxyAllowed = await axios.get(process.env.DENO_PRODUCTION_URL, {
      ...requestPayload,          // keep your existing config
      httpAgent,                  // used for http://
      httpsAgent,                 // used for https://
    });
    // const proxyAllowed = await axios.get(process.env.DENO_PRODUCTION_URL , requestPayload);
    // console.log("Cloud Response Type : " , typeof(proxyAllowed))
    return proxyAllowed.data;
  } catch (error) {
    console.error("Error: " , error.message)
  }

}

const runDenoScript =  (requestPayload , isWindows) => {
  
  return new Promise((async (resolve , reject) => {

  const rootDir = path.resolve(__dirname, "..");
  // const scriptPath = path.join(rootDir, "/api/proxy.mjs");
  const scriptPath = path.join(rootDir, "api", "proxy.mjs");

  // ✅ Allow reading the entire project (fixes the permission error)
  // You can make this more strict later if needed
  const allowRead = rootDir;

  // Allow reading only required files
  // const configPath = [
  //   path.join(rootDir, "deno.json"),
  //   path.join(rootDir, ".env"),
  // ].join(",");

  const localDenoPath = path.join(rootDir, "bin", "deno.exe");

  denoProcess = spawn(
    localDenoPath,
    [
      "run",
      // "--watch",
      "--allow-net",
      "--allow-env",
      `--allow-read=${allowRead}`,
      "--allow-write",
      "--unstable-kv",
      scriptPath,
    ],
    {
      shell: isWindows, 
      cwd: rootDir, 
      stdio: ["pipe", "pipe", "pipe"],
    }
  );

  try {
    
    const payloadString =  await JSON.stringify(requestPayload);
    console.log("Payload String: " , payloadString)
    denoProcess.stdin.write(payloadString);
    denoProcess.stdin.end();           // Important: Close stdin
  } catch (err) {
    console.error("Failed to stringify payload:", err.message);
    return res.status(500).json({ success: false, message: "Payload Error" });
  }

  let stdoutBuffer = "";
  denoProcess.stdout.on("data", (chunk) => {
    // Log only the fresh chunk to the console to prevent compounding strings
    console.log(`[DENO STDOUT]: ${chunk.toString().trim()}`);
    stdoutBuffer += chunk.toString();
    return stdoutBuffer;
  });

  let stderrBuffer = "";
  denoProcess.stderr.on("data", (chunk) => {
    console.error(`[DENO STDERR]: ${chunk.toString().trim()}`);
    stderrBuffer += chunk.toString();
    return stderrBuffer;
  });

  denoProcess.on("close", (code) => {
      denoProcess = null; 
      if (code !== 0) {
        console.error("Deno Process Failed:", stderrBuffer);
        return reject(new Error("Security check failed!"));
      }
      resolve(stdoutBuffer); // Return the final string data here
  });

  denoProcess.on("error", (err) => {
    console.error("Failed to start Deno process:", err);
    denoProcess = null;
    return res.status(500).json({
      success: false,
      message: "Internal Server Error!",
    });
  });

  // Clean up OS listeners properly
  process.on("SIGINT", () => {
    if (denoProcess) denoProcess.kill("SIGTERM");
    process.exit();
  });

  }));
}

const startDenoProxy = async (req, res, next) => {

  // console.log("Req. body:" , req.body);
  // console.log("Req. Headers: " , req.headers['x-forwarded-for'])
  const requestPayload = {
    action: "runSecurityCheck",
    // node_id : await getNodeID(req.body.encrptedData),
    method: req.method,
    url: req.originalUrl,
    hostname: req.hostname,
    headers: {
      "user-agent": req.headers["user-agent"],
      "origin": req.headers["origin"],
      "x-forwarded-for": req.headers["x-forwarded-for"],
      "x-request-id": req.headers["x-request-id"],
      "x-user-role": req.headers["x-user-role"],
      "content-type": req.headers["content-type"]
    },
    socket: {
      remoteAddress: req.socket?.remoteAddress || req.ip || "unknown"
    },
    ip: req.ip
  };

  // const node_id = await getNodeID(req.body.encrptedData);

  // console.log("Get Node Id: " , req.body.encrptedData);
  // console.log("Request Payload: " , requestPayload);

  try {
  const isWindows = process.platform === "win32";
  let response = isWindows 
    ? await runDenoScript(requestPayload, isWindows) 
    : await runCloudDeno(requestPayload);

  // let response =  await runCloudDeno(requestPayload);
  let denoResponse;
  
  console.log("Response: " , response);

   if(typeof(response) === "string") {

    const jsonStart = response.indexOf("{");
    const jsonString = response.slice(jsonStart).trim();
    // console.log("Response: " , response);
    denoResponse = JSON.parse(jsonString);
  }

  if(typeof(response) === "object") {
    // console.log("Deno Object Body : " , response)
    denoResponse = response;
  }
      
  // console.log("Deno Respone: " , denoResponse);

  if (denoResponse.allowed === false) {
    return res.status(denoResponse.status || 403).json({
      success: false,
      message: denoResponse.message || "Access Denied"
    });
  }

  // ByPass the Request
  if(denoResponse.allowed === true) next(); 
    
  // console.log("Response: ", response);
  } catch (error) {
    console.error("Execution failed:", error);
    return res.status(500).json({ 
      success: false, 
      message: "An internal server error occurred.",
      error: error.message 
    });
  }

}



module.exports = { startDenoProxy };