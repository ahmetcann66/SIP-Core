const http = require('http');
const payload = JSON.stringify({ engXp: 42, engLevel: 2, sipXp: 123, sipLevel: 3, sipStreak: 5, sipLastDate: '2026-05-24', ogrenilenKelimeler: JSON.stringify(['hello','world']), kacirilanlar: JSON.stringify([]), sipHistory: JSON.stringify([{q:'sample',ok:true}]), dna: JSON.stringify({profile: 'test'}) });
const opts = { hostname: 'localhost', port: 8080, path: '/api/students/update/7', method: 'PUT', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) } };
const req = http.request(opts, res => {
  console.log('STATUS', res.statusCode);
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', ()=>{ console.log('BODY', body); process.exit(0); });
});
req.on('error', e => { console.error('ERR', e.message); process.exit(2); });
req.write(payload); req.end();
