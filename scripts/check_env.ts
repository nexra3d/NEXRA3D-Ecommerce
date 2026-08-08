import dotenv from 'dotenv';
dotenv.config();

console.log('ENV KEYS:', Object.keys(process.env).filter(k => !k.startsWith('npm_') && !k.startsWith('NVM_')));
console.log('DELHIVERY_API_TOKEN present:', Boolean(process.env.DELHIVERY_API_TOKEN), 'Length:', process.env.DELHIVERY_API_TOKEN?.length);
console.log('DELHIVERY_BASE_URL:', process.env.DELHIVERY_BASE_URL);
console.log('DELHIVERY_RATE_API_URL:', process.env.DELHIVERY_RATE_API_URL);
