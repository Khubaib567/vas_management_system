
// CONFIG ENVIRONMENT VARIABLES.
if(process.env.ENV !== "production"){
  require('dotenv').config({path : './.secrets/.env'})
}

const { spawn } = require("child_process");
const path = require("path");
const axios = require("axios")

let denoProcess = null;

const runCloudDeno = async (requestPayload) => {

  try {
    const proxyAllowed = await axios.get(process.env.DENO_PRODUCTION_URL , requestPayload);
    return proxyAllowed.data;
  } catch (error) {
    console.error("Error: " , error.message)
  }

}

const runDenoScript =  (requestPayload , isWindows) => {
  
  return new Promise((async (resolve , reject) => {

  const rootDir = path.resolve(__dirname, "..");
  const scriptPath = path.join(rootDir, "/api/proxy.mjs");

   // Allow reading only required files
  const configPath = [
    path.join(rootDir, "deno.json"),
    path.join(rootDir, ".env"),
  ].join(",");


  const localDenoPath = path.join(rootDir, "bin", "deno.exe");

  denoProcess = spawn(
    localDenoPath,
    [
      "run",
      // "--watch", 
      "--allow-net",
      "--allow-env",
      `--allow-read=${configPath}`,
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
    // console.log("Payload String: " , payloadString)
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

  console.log(req.headers['x-forwarded-for'])
  const requestPayload = {
    action: "runSecurityCheck",
    method: req.method,
    url: req.originalUrl,
    hostname: req.hostname,
    headers: {
      "user-agent": req.headers["user-agent"],
      "origin": req.headers["origin"],
      "x-forwarded-for": req.headers["x-forwarded-for"],
      "x-request-id": req.headers["x-request-id"],
      "x-user-role": req.headers["x-user-role"],
      "content-type": req.headers["content-type"],
    },
    socket: {
      remoteAddress: req.socket?.remoteAddress || req.ip || "unknown"
    },
    ip: req.ip
  };
  
   const isWindows = process.platform === "win32" ;
  
  let response = isWindows ? await runDenoScript(requestPayload , isWindows) : await runCloudDeno(requestPayload);

  // Ensure response exists before parsing
  if (!response) {
    return res.status(500).json({ success: false, message: "Empty security response" });
  }
   
  //  try {
  //   response = await runCloudDeno(requestPayload);
  //   // response = await runDenoScript(requestPayload , isWindows);
  //   // console.log("Deno Respone: " , typeof(response));
  //  } catch (err) {
  //    return res.status(500).json({
  //      success: false,
  //      message: err.message || "Internal Server Error!",
  //    });
  //  }

   let denoResponse;
    try {

      if(typeof(response) === "string") {
        const jsonStart = response.indexOf("{");
        const jsonString = response.slice(jsonStart).trim();
        denoResponse = JSON.parse(jsonString);
      }


      if(typeof(response) === "object") {
        denoResponse = response;
        // console.log(response)
      }
      
      console.log("Deno Respone: " , denoResponse);

      if (denoResponse.allowed === false) {
        return res.status(denoResponse.status || 403).json({
          success: false,
          message: denoResponse.message || "Access Denied"
        });
      }

      // ByPass the Request
      if(denoResponse.allowed === true) next(); 

    } catch (error) {
      console.error("Invalid Deno Response Raw String:", response);
      return res.status(500).json({
        success: false,
        message: "Invalid Security Response",
      });
  }
  

}



module.exports = { startDenoProxy };