// CONFIG ENVIRONMENT VARIABLES.
if(process.env.ENV !== "production"){
  require('dotenv').config({path : '../.secrets/.env'})
}


module.exports =  sendSecurityCheck = () => {
  const url = process.env.VAS_URL;

  // Headers gathered from the provided interface image
  const headers = {
    'Content-Type': process.env.CONTENT_TYPE,
    'User-Agent': process.env.USER_AGENT,
    'Origin': process.env.ORIGIN,
    'X-Forwarded-For': process.env.X_FORWARDED_FOR,
    'X-Request-Id': process.env.X_REQUEST_ID,
    'X-User-Role': process.env.X_USER_ROLE
  };

  // The requested payload structure
  const payload = {
    action: process.env.ACTION_NAME,
    method: process.env.METHOD,
    url: process.env.URL,
    hostname: process.env.HOSTNAME,
    socket: {
      remoteAddress: process.env.REMOTEADDRESS
    },
    ip: process.env.IP
  };

  try {
    const response = await fetch(url, {
      method: process.env.METHOD, // Note: Payloads are typically transmitted via POST/PUT methods
      headers: headers,
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    console.log('Response Status:', response.status);
    console.log('Response Body:', data);
  } catch (error) {
    console.error('Error executing request:', error);
  }
}

// Execute the request
// sendSecurityCheck();
