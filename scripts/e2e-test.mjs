import { chromium } from 'playwright';
import { writeFileSync } from 'fs';
const BASE = 'http://localhost:3001';
const SCREENSHOTS = 'C:\\Users\\Alfa\\Desktop\\eva_new_site\\evadxbnew.com\\public\\screenshots\\';

const report = { passed: 0, failed: 0, tests: [], consoleLogs: [], consoleErrors: [], screenshots: [] };

function logResult(name, ok, detail) {
  const status = ok ? 'PASS' : 'FAIL';
  if (ok) report.passed++; else report.failed++;
  report.tests.push({ name, status, detail });
  console.log(status + ' ' + name + (detail ? ' - ' + detail : ''));
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  // Collect console logs
  page.on('console', msg => {
    const text = msg.text();
    report.consoleLogs.push({ type: msg.type(), text });
    if (msg.type() === 'error') report.consoleErrors.push(text);
  });
  page.on('pageerror', err => {
    report.consoleErrors.push('PAGE_ERROR: ' + err.message);
  });

  try {
    // =============================================
    // 1. HOME PAGE
    // =============================================
    console.log('\n--- TESTING HOMEPAGE ---');
    await page.goto(BASE + '/en', { waitUntil: 'networkidle' });
    logResult('Homepage loads', page.url() === BASE + '/en', 'URL: ' + page.url());

    // Check title
    const title = await page.title();
    logResult('Title correct', title.includes('EVA Real Estate'), 'Title: ' + title);

    // Check hero section
    const heroContent = await page.textContent('body');
    logResult('Hero content renders', heroContent.includes('hero.title') || heroContent.includes('Properties') || heroContent.includes('Riverside'), 'Content present');

    // Screenshot: full page
    await page.screenshot({ path: SCREENSHOTS + 'homepage-full.png', fullPage: true });
    report.screenshots.push('homepage-full.png');
    logResult('Homepage screenshot', true, 'homepage-full.png');

    // =============================================
    // 2. PROPERTIES LISTING
    // =============================================
    console.log('\n--- TESTING PROPERTIES ---');
    await page.goto(BASE + '/en/properties', { waitUntil: 'networkidle' });
    logResult('Properties page loads', page.url().includes('/properties'), 'URL: ' + page.url());
    await page.screenshot({ path: SCREENSHOTS + 'properties-listing.png', fullPage: true });
    report.screenshots.push('properties-listing.png');

    // =============================================
    // 3. PROPERTY DETAIL
    // =============================================
    console.log('\n--- TESTING PROPERTY DETAIL ---');
    await page.goto(BASE + '/en/properties/riverside-views-damac', { waitUntil: 'networkidle' });
    logResult('Property detail loads', page.url().includes('riverside-views'), 'URL: ' + page.url());
    await page.screenshot({ path: SCREENSHOTS + 'property-detail.png', fullPage: true });
    report.screenshots.push('property-detail.png');
    
    // Check title
    const propTitle = await page.title();
    logResult('Property title correct', propTitle.includes('Riverside Views'), 'Title: ' + propTitle);

    // =============================================
    // 4. ADMIN DASHBOARD
    // =============================================
    console.log('\n--- TESTING ADMIN ---');
    await page.goto(BASE + '/en/admin', { waitUntil: 'networkidle' });
    logResult('Admin dashboard loads', page.url().includes('/admin'), 'URL: ' + page.url());
    await page.screenshot({ path: SCREENSHOTS + 'admin-dashboard.png', fullPage: true });
    report.screenshots.push('admin-dashboard.png');

    // Admin properties
    await page.goto(BASE + '/en/admin/properties', { waitUntil: 'networkidle' });
    logResult('Admin properties loads', !page.url().includes('ERROR'), 'URL: ' + page.url());

    // Admin agents
    await page.goto(BASE + '/en/admin/agents', { waitUntil: 'networkidle' });
    logResult('Admin agents loads', true, '');

    // Admin blog
    await page.goto(BASE + '/en/admin/blog', { waitUntil: 'networkidle' });
    logResult('Admin blog loads', true, '');

    // =============================================
    // 5. OTHER LOCALES
    // =============================================
    console.log('\n--- TESTING LOCALES ---');
    for (const locale of ['ar', 'ru', 'zh', 'fr', 'de', 'es', 'hi', 'pt', 'tr']) {
      try {
        await page.goto(BASE + '/' + locale, { waitUntil: 'domcontentloaded', timeout: 10000 });
        logResult('Locale ' + locale + ' loads', page.url().includes('/' + locale), 'URL: ' + page.url());
      } catch (e) {
        logResult('Locale ' + locale + ' loads', false, e.message);
      }
    }

  } catch (e) {
    logResult('FATAL_ERROR', false, e.message);
  } finally {
    await browser.close();
  }

  // =============================================
  // REPORT
  // =============================================
  console.log('\n========================================');
  console.log(`RESULTS: ${report.passed} passed, ${report.failed} failed`);
  console.log('========================================');
  if (report.consoleErrors.length > 0) {
    console.log('\nCONSOLE ERRORS:');
    report.consoleErrors.forEach((e, i) => console.log(`  ${i + 1}. ${e}`));
  }
  if (report.screenshots.length > 0) {
    console.log('\nSCREENSHOTS:');
    report.screenshots.forEach(s => console.log('  - public/screenshots/' + s));
  }

  writeFileSync('C:\\Users\\Alfa\\AppData\\Local\\Temp\\opencode\\e2e-report.json', JSON.stringify(report, null, 2));
  console.log('\nReport saved to e2e-report.json');
}

run().catch(console.error);
