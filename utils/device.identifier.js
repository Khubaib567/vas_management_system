// const si = require('systeminformation');

 module.exports = getNodeID = async(encrptedData) => {
  try {

    // FOR SERVER SIDE REQUEST.
    if (encrptedData.encryptedBundle) {
      // Fetches native system UUIDs
      // const data = await si.uuid();
      const data = await userDeviceID.uuid;
      // console.log('Hardware UUID:', data.hardware); 
      // console.log('OS UUID:', data.os);
      return data.hardware
    }

    // FOR CLIENT SIDE REQUEST.
    if (encrptedData.ciphertext) {
      // Fetches native system UUIDs
      // const data = await si.uuid();
      const data = await userDeviceID.openID.userProfile
      // console.log('Hardware UUID:', data.hardware); 
      // console.log('OS UUID:', data.os);
      return data.sub
    }
   
  } catch (error) {
    console.error('Error fetching device ID:', error);
  }
}

// getNodeID();
