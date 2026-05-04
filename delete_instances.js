const http = require('http');
const https = require('https');

const apikey = 'SomarEvolution@2026';
const baseUrl = 'https://evolution.somar.ia.br';

https.get(`${baseUrl}/instance/fetchInstances`, {
  headers: { apikey },
  rejectUnauthorized: false
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const instances = JSON.parse(data);
      console.log(`Encontradas ${instances.length} instâncias.`);
      
      instances.forEach(inst => {
        const req = https.request(`${baseUrl}/instance/delete/${inst.name}`, {
          method: 'DELETE',
          headers: { apikey },
          rejectUnauthorized: false
        }, (delRes) => {
          console.log(`Deletada ${inst.name} - Status: ${delRes.statusCode}`);
        });
        req.end();
      });
    } catch(e) {
      console.log('Erro no JSON', data);
    }
  });
});
