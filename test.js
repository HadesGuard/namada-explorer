// decodeEthData.js
const Web3 = require('web3');

const encodedData = '0x19000000000000000001dcc69b62900bb67632b3118dc3ecb336a3c0c3f5020000000077d6d1b9cea2925777103b8ac55ba8df6dac2d0700913ca0d1864b758df429d5d5f0d122c7e2fa07eb';

// Create a new web3 instance
const web3 = new Web3();

// Decode the data using the web3.utils module
const decodedData = web3.utils.hexToAscii(encodedData);

console.log(decodedData);
