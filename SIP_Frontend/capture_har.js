const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
(async ()=>{
  const outDir = path.resolve(__dirname, 'hars');
  if(!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const records = [];
  page.on('request', req => {
    let pd = null;
    try { pd = req.postData(); if (pd && typeof pd === 'string' && pd.length>2000) pd = pd.slice(0,2000) + '...[truncated]'; } catch(e) { pd = null; }
    records.push({ type: 'request', id: req._requestId || null, url: req.url(), method: req.method(), headers: req.headers(), postData: pd, timestamp: Date.now() });
  });
  page.on('response', async res => {
    let body = null; try { body = await res.text(); if(body && body.length>2000) body = body.slice(0,2000)+'...[truncated]'; } catch(e){}
    records.push({ type: 'response', url: res.url(), status: res.status(), headers: res.headers(), text: body, timestamp: Date.now() });
  });

  const url = process.argv[2] || 'http://localhost:8000/#authEkrani';
  await page.setViewport({ width: 393, height: 851 });
  await page.goto(url, { waitUntil: 'networkidle2' });
  // perform login using e2e credentials
  try{
    await page.waitForSelector('#loginEmail', { timeout: 2000 });
    await page.type('#loginEmail', 'e2e_user_1779583871552@example.com');
    await page.type('#loginSifre', 'Pass123!');
    const btn = await page.$x("//button[contains(normalize-space(string(.)), 'Giriş Yap')]");
    if(btn && btn.length) await btn[0].click();
  }catch(e){}

  await page.waitForTimeout(2000);
  const outFile = path.join(outDir, `har-${Date.now()}.json`);
  fs.writeFileSync(outFile, JSON.stringify(records, null, 2), 'utf8');
  console.log('Wrote', outFile);
  await browser.close();
})();
