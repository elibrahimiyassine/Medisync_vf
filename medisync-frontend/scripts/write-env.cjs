const fs = require('fs');
const path = require('path');

const apiUrl = process.env.MEDISYNC_API_URL || 'https://medisync-api-production-1ace.up.railway.app/api/v1';
const wsUrl = process.env.MEDISYNC_WS_URL || apiUrl.replace(/\/api\/v1\/?$/, '');

const content = `export const environment = {
  production: true,
  apiUrl: '${apiUrl}',
  wsUrl: '${wsUrl}',
};
`;

const envDir = path.join(__dirname, '..', 'src', 'environments');
fs.writeFileSync(path.join(envDir, 'environment.ts'), content);
fs.writeFileSync(path.join(envDir, 'environment.prod.ts'), content);
console.log(`Wrote Angular environment for ${apiUrl}`);
