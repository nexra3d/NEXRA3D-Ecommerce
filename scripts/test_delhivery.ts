import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const token = process.env.DELHIVERY_API_TOKEN || '';
const baseUrl = process.env.DELHIVERY_BASE_URL || 'https://track.delhivery.com';
const rateUrlFromEnv = process.env.DELHIVERY_RATE_API_URL || '';

console.log('=== DELHIVERY DIAGNOSTIC TEST ===');
console.log('Token provided:', Boolean(token), 'Length:', token.length);
console.log('Base URL:', baseUrl);
console.log('Rate URL from env:', rateUrlFromEnv);

const candidateUrls = [
  rateUrlFromEnv,
  `${baseUrl}/api/kcl/charge.json`,
  `${baseUrl}/c/api/kcl/charge.json`,
  `https://express.delhivery.com/api/kcl/charge.json`,
  `https://express.delhivery.com/c/api/kcl/charge.json`,
  `https://staging-express.delhivery.com/api/kcl/charge.json`,
  `https://staging-express.delhivery.com/c/api/kcl/charge.json`,
  `${baseUrl}/c/api/v1/kcl/charge.json`,
  `${baseUrl}/api/v1/kcl/charge.json`,
  `https://track.delhivery.com/api/v1/kcl/charge.json`,
  `https://track.delhivery.com/c/api/v1/kcl/charge.json`,
].filter(Boolean);

// Unique candidates
const uniqueUrls = Array.from(new Set(candidateUrls));

const params = {
  md: 'S', // Surface
  ss: 'Delivered',
  d_pin: '500046',
  o_pin: '500032',
  cgm: 1000,
  gm: 1000,
  pt: 'Pre-paid',
  clv: 1499,
  l: 15,
  w: 15,
  h: 10
};

async function testAll() {
  for (const url of uniqueUrls) {
    console.log(`\nTesting URL: ${url}`);
    try {
      const res = await axios.get(url, {
        params,
        headers: {
          'Authorization': `Token ${token}`,
          'Accept': 'application/json'
        },
        timeout: 5000
      });
      console.log(`SUCCESS! Status: ${res.status}`);
      console.log('Response data:', JSON.stringify(res.data, null, 2));
    } catch (err: any) {
      console.log(`FAILED! Status: ${err.response?.status || 'NO_RESPONSE'}`);
      if (err.response) {
        console.log('Error Data:', JSON.stringify(err.response.data));
      } else {
        console.log('Error Message:', err.message);
      }
    }
  }

  // Also test pincode serviceability
  console.log('\nTesting Pincode Serviceability...');
  const pinUrl = `${baseUrl}/c/api/pin-codes/json/`;
  try {
    const res = await axios.get(pinUrl, {
      params: { filter_codes: '500046' },
      headers: {
        'Authorization': `Token ${token}`,
        'Accept': 'application/json'
      },
      timeout: 5000
    });
    console.log(`Serviceability SUCCESS! Status: ${res.status}`);
    console.log('Serviceability Response:', JSON.stringify(res.data, null, 2));
  } catch (err: any) {
    console.log(`Serviceability FAILED! Status: ${err.response?.status || 'NO_RESPONSE'}`);
    if (err.response) {
      console.log('Error Data:', JSON.stringify(err.response.data));
    } else {
      console.log('Error Message:', err.message);
    }
  }
}

testAll();
