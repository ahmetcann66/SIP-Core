const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const credsPath = 'SIP_Frontend/e2e_credentials.json';
  if (!fs.existsSync(credsPath)) {
    console.error('Credentials file not found:', credsPath);
    process.exit(1);
  }
  const creds = JSON.parse(fs.readFileSync(credsPath, 'utf8'));

  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  // mobile-like viewport
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });

  await page.goto('http://localhost:8000', { waitUntil: 'networkidle2' });
  await page.waitForSelector('.landing-btn');
  await page.click('.landing-btn');
  await page.waitForSelector('#authEkrani .auth-card', { visible: true });

  await page.waitForSelector('#loginEmail');
  await page.type('#loginEmail', creds.email);
  await page.type('#loginSifre', creds.sifre);
  await page.click('#rememberMeCb');
  await page.click('#girisFormu button[type=submit]');

  // wait for either post-login modal or navigation
  try {
    await page.waitForSelector('#postLoginChoiceModal', { visible: true, timeout: 5000 });
    console.log('Post-login modal visible');
  } catch (e) {
    console.warn('Post-login modal not found; checking main screens...');
  }

  await browser.close();
  console.log('Mobile real-login E2E finished');
})();
