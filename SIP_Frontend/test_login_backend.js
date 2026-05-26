const http = require('http');
const data = JSON.stringify({ email: 'e2e_user_1779583871552@example.com', sifre: 'Pass123!' });
const opts = { hostname: 'localhost', port: 8080, path: '/api/students/login', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } };
const req = http.request(opts, res => {
  console.log('STATUS', res.statusCode);
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', ()=>{ console.log('BODY', body); process.exit(0); });
});
req.on('error', e => { console.error('ERR', e.message); process.exit(2); });
req.write(data); req.end();
