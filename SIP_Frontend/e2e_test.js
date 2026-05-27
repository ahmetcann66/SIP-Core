const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  page.setDefaultTimeout(10000);

  console.log('Opening frontend at http://localhost:8000');
  await page.goto('http://localhost:8000', { waitUntil: 'networkidle2' });

  // Click landing entry
  await page.waitForSelector('.landing-btn');
  await page.click('.landing-btn');
  console.log('Clicked landing -> auth');

  // Wait for auth card and animation
  await page.waitForSelector('#authEkrani .auth-card', { visible: true });
  const hasShow = await page.$eval('#authEkrani .auth-card', el => el.classList.contains('show'));
  console.log('authCardAnimated:', hasShow);

  // Fill login inputs
  await page.type('#loginEmail', 'test@example.com');
  await page.type('#loginSifre', 'password');
  await page.click('#rememberMeCb');
  console.log('Filled login + remember');

  // Simulate successful login by populating localOgrenci and calling post-login handlers
  await page.evaluate(() => {
    window.localOgrenci = window.localOgrenci || {};
    Object.assign(window.localOgrenci, { id: 1, isim: 'Test User', email: 'test@example.com', engXp: 0, engLevel: 1, sipXp: 0, sipLevel: 1, sipHistory: [] });
    if (typeof girisSonrasiVeriYukle === 'function') girisSonrasiVeriYukle();
    if (typeof showPostLoginChoice === 'function') showPostLoginChoice();
  });

  await page.waitForSelector('#postLoginChoiceModal', { visible: true });
  console.log('postLoginModal visible');

  // Choose SIP path
  await page.click('#chooseSipBtn');
  await page.waitForSelector('#anaKapiEkrani.active', { timeout: 5000 });
  console.log('navigated to anaKapiEkrani');

  // Open sinav ekran and ensure question pool rendered
  await page.evaluate(() => ekranGoster('sipSinavEkrani'));
  await page.waitForSelector('#sipSinavEkrani.active', { timeout: 5000 });
  console.log('sipSinavEkrani active');

  // call prepare if available and check soru list element
  await page.evaluate(() => { if (typeof sipSoruHavuzuHazirla === 'function') sipSoruHavuzuHazirla(); });
  const listExists = await page.$('#soruHavuzuListe') !== null;
  console.log('soruHavuzuListeExists:', listExists);

  await browser.close();
  console.log('E2E test finished.');
})();
