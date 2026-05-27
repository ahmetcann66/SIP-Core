(async () => {
  try {
    const base = 'http://localhost:8080';
    const email = `e2e_user_${Date.now()}@example.com`;
    const body = { isim: 'E2E Tester', email, sifre: 'Pass123!' };

    console.log('Registering user:', email);
    let res = await fetch(base + '/api/students/register', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
    });
    console.log('Register status:', res.status);
    const regText = await res.text();
    console.log('Register response:', regText);

    console.log('Attempting login...');
    res = await fetch(base + '/api/students/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, sifre: body.sifre })
    });
    console.log('Login status:', res.status);
    const json = res.status === 200 ? await res.json() : await res.text();
    console.log('Login response:', json);

    const fs = require('fs');
    fs.writeFileSync('e2e_credentials.json', JSON.stringify({ email, sifre: body.sifre }, null, 2));
    console.log('Saved credentials to e2e_credentials.json');
  } catch (e) {
    console.error('Integration test failed', e);
    process.exit(2);
  }
})();
