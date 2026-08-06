export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry"
];

function cleanAreaName(name: string): string {
  if (!name) return '';
  return name
    .replace(/\s*(S\.?O\.?|B\.?O\.?|H\.?O\.?|G\.?P\.?O\.?|Sub Post Office|Head Post Office|Branch Office)$/i, '')
    .trim();
}

export async function lookupPincode(pincode: string): Promise<{ city?: string; state?: string } | null> {
  const cleanCode = pincode.trim().replace(/\D/g, '');
  if (cleanCode.length !== 6) return null;

  // Attempt 1: PostalPincode API with timeout
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const res = await fetch(`https://api.postalpincode.in/pincode/${cleanCode}`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data[0] && data[0].Status === 'Success' && Array.isArray(data[0].PostOffice) && data[0].PostOffice.length > 0) {
        const po = data[0].PostOffice[0];
        
        const cleanedName = cleanAreaName(po.Name || '');
        const validBlock = (po.Block && !['NA', 'N.A.', 'N/A'].includes(po.Block.toUpperCase())) ? po.Block.trim() : '';
        const cleanedDivision = (po.Division || '').replace(/\s*Division$/i, '').replace(/\s*City$/i, '').trim();

        // City priority: Cleaned Area/City Name -> Valid Block -> Division -> District
        let city = cleanedName || validBlock || cleanedDivision || po.District || '';
        let state = po.State || '';

        if (cleanCode.startsWith('50') && state === 'Andhra Pradesh') {
          state = 'Telangana';
        }

        if (city && state) {
          return { city, state };
        }
      }
    }
  } catch (err) {
    // Fallthrough to Zippopotam
  }

  // Attempt 2: Zippopotam API
  try {
    const res = await fetch(`https://api.zippopotam.us/in/${cleanCode}`);
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.places) && data.places.length > 0) {
        const place = data.places[0];
        let city = place['place name'] || '';
        let state = place['state'] || '';

        if (cleanCode.startsWith('50') && state === 'Andhra Pradesh') {
          state = 'Telangana';
        }

        return { city, state };
      }
    }
  } catch (err) {
    console.error('Pincode lookup error:', err);
  }

  return null;
}
