const { spawn } = require("child_process");
const path = require("path");

let denoProcess = null;

function startDenoProxy(req, res, next) {
  const rootDir = path.resolve(__dirname, "..");
  const scriptPath = path.join(rootDir, "/api/proxy.mjs");

   // Allow reading only required files
  const configPath = [
    path.join(rootDir, "deno.json"),
    path.join(rootDir, ".env"),
  ].join(",");
  

  const isWindows = process.platform === "win32";
  const localDenoPath = path.join(rootDir, "bin", "deno.exe");
  const denoCmd = isWindows ? localDenoPath : "deno";

  denoProcess = spawn(
    denoCmd,
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

  try {
    const payloadString = JSON.stringify(requestPayload);
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
  });

  let stderrBuffer = "";
  denoProcess.stderr.on("data", (chunk) => {
    console.error(`[DENO STDERR]: ${chunk.toString().trim()}`);
    stderrBuffer += chunk.toString();
  });

  denoProcess.on("close", (code) => {
    denoProcess = null; // Clean up reference immediately

    if (code !== 0) {
      console.error("Deno Process Failed:", stderrBuffer);
      return res.status(500).json({
        success: false,
        message: "Security check failed!",
      });
    }

    let denoResponse;
    try {
      const jsonStart = stdoutBuffer.indexOf("{");
      const jsonString = stdoutBuffer.slice(jsonStart).trim();
      const denoResponse = JSON.parse(jsonString);

      if (denoResponse.allowed === false) {
        return res.status(denoResponse.status || 403).json({
          success: false,
          message: denoResponse.message || "Access Denied"
        });
      }

      // By Pass the Request
      if(denoResponse.allowed === true) next(); 

    } catch (error) {
      console.error("Invalid Deno Response Raw String:", stdoutBuffer);
      return res.status(500).json({
        success: false,
        message: "Invalid Security Response",
      });
    }
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

}



module.exports = { startDenoProxy };
