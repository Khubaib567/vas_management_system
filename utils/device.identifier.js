const si = require('systeminformation');

 module.exports = getDeviceID = async() => {
  try {
    // Fetches native system UUIDs
    const data = await si.uuid();
    // console.log('Hardware UUID:', data.hardware); 
    // console.log('OS UUID:', data.os);
    return data.hardware
  } catch (error) {
    console.error('Error fetching device ID:', error);
  }
}

// getDeviceID();
