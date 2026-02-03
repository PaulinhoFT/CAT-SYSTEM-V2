const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Test index.html
  await page.goto('http://localhost:8000/index.html');
  await page.screenshot({ path: '/home/jules/verification/index_final.png', fullPage: true });

  // Test add-procedure.html
  await page.goto('http://localhost:8000/add-procedure.html');
  await page.screenshot({ path: '/home/jules/verification/add_final.png', fullPage: true });

  await browser.close();
})();
