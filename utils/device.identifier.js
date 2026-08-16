// const si = require('systeminformation');
const { decryptWithRandomIV } = require('./decrypt.authtag.mjs');



 module.exports = getNodeID = async(encrptedData) => {
  try {

    // FOR SERVER SIDE REQUEST.
    if (encrptedData.encryptedBundle) {
      // Fetches native system UUIDs
      // const data = await si.uuid();
      const data = await encrptedData.encryptedBundle.uuid;
      // console.log('Hardware UUID:', data.hardware); 
      // console.log('OS UUID:', data.os);
      return data.hardware
    }

    // FOR CLIENT SIDE REQUEST.
    if (encrptedData) {
      // Fetches native system UUIDs
      // const data = await si.uuid();
      const data = await decryptWithRandomIV(encrptedData);
      // console.log('Hardware UUID:', data.hardware); 
      // console.log('OS UUID:', data.os);
      return data.data
    }
   
  } catch (error) {
    console.error('Error fetching device ID:', error);
  }
}

// getNodeID();
