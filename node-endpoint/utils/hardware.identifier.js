const { execFile } = require('child_process');
const path = require('path');
const si = require('systeminformation');

// 1. Define the absolute path to your compiled Rust executable
// Change 'rust_passkey_cli.exe' to match your actual compiled binary filename
const rustBinaryPath = path.join(__dirname, 'target', 'release', 'rust_passkey_cli.exe');

console.log("🔒 Starting Secure Authentication... Windows Hello prompt will appear.");

/**
 * Fetches unique hardware identifiers using the systeminformation library
 */
async function fetchHardwareDeviceInfo() {
  try {
    console.log("\n🔑 Access Granted. Retrieving hardware device identifiers...");
    
    // Fetch unique system-level tokens (UUID, serial numbers, SKU)
    const systemData = await si.system();
    
    console.log("================ HARDWARE DEVICE INFO ================");
    console.log(`Manufacturer:   ${systemData.manufacturer}`);
    console.log(`Model/Product:  ${systemData.model}`);
    console.log(`Hardware UUID:  ${systemData.uuid}`); // Unique motherboard ID
    console.log(`Serial Number:  ${systemData.serial}`);
    console.log("======================================================");
    
  } catch (error) {
    console.error("❌ Failed to read hardware device data:", error.message);
  }
}

// 2. Spawn the Rust child process to open the native Windows Hello Dialog window
execFile(rustBinaryPath, (error, stdout, stderr) => {
  // Catch hard runtime errors (e.g., file not found, crash)
  if (error && error.code === 'ENOENT') {
    console.error(`❌ Could not locate the Rust executable at: ${rustBinaryPath}`);
    return;
  }

  // Parse the output string sent back from Rust's println statements
  const rustOutput = stdout.trim();

  // 3. Evaluate the cryptographic signature status returned from the result
  if (rustOutput.includes("VERIFICATION_SUCCESS")) {
    // Trigger hardware query only if authentication passes
    fetchHardwareDeviceInfo();
  } else {
    console.log("\n❌ Access Denied: Cryptographic passkey validation failed or user cancelled.");
    if (stderr) {
      console.error(`Debug Info: ${stderr}`);
    }
  }
});
