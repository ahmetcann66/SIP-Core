const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async ()=>{
  const outDir = path.resolve(__dirname, 'screenshots');
  if(!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const sleep = (ms) => new Promise(res => setTimeout(res, ms));

  const targets = [
    { name: 'desktop', viewport: { width: 1280, height: 900 }, ua: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36' },
    { name: 'iphone12', viewport: { width: 390, height: 844, isMobile: true, hasTouch: true }, ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1' },
    { name: 'pixel5', viewport: { width: 393, height: 851, isMobile: true, hasTouch: true }, ua: 'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Mobile Safari/537.36' },
    { name: 'iphoneSE', viewport: { width: 375, height: 667, isMobile: true, hasTouch: true }, ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0 Mobile/15A372 Safari/604.1' }
  ];

  const url = process.argv[2] || 'http://localhost:8000';

  for(const t of targets){
    console.log('Capturing', t.name);
    await page.setUserAgent(t.ua);
    await page.setViewport(t.viewport);
    await page.goto(url, { waitUntil: 'networkidle2' });
    await sleep(500);

    // if landing, ensure auth visible for consistent shots
    // navigate to auth anchor
    try{
      await page.goto(url + '/#authEkrani', { waitUntil: 'networkidle2' });
      await sleep(300);
    }catch(e){}

    const file = path.join(outDir, `${t.name}.png`);
    await page.screenshot({ path: file, fullPage: false });
    console.log('Saved', file);
  }

  await browser.close();
  console.log('All screenshots captured.');
})();
