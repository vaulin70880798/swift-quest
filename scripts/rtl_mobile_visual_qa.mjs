import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const BASE_URL = process.env.QA_URL || "http://localhost:3001";
const OUT_DIR = process.env.QA_OUT_DIR || "output/web-game/mobile-iphone16";

const VIEWPORT = {
  width: 430,
  height: 932,
};

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

async function shot(page, fileName) {
  const fullPath = path.join(OUT_DIR, fileName);
  await page.screenshot({ path: fullPath, fullPage: true });
}

async function clickByText(page, label) {
  const locator = page.locator("button", { hasText: label }).first();
  if (await locator.count()) {
    await locator.click();
    return true;
  }
  return false;
}

async function run() {
  ensureDir(OUT_DIR);
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: VIEWPORT,
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    locale: "he-IL",
  });

  const consoleErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });
  page.on("pageerror", (error) => {
    consoleErrors.push(String(error));
  });

  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  await shot(page, "01-welcome.png");

  await clickByText(page, "משחק חדש");
  await page.waitForTimeout(500);
  await shot(page, "02-home.png");

  await clickByText(page, "עולמות");
  await page.waitForTimeout(500);
  await shot(page, "03-world-map.png");

  await clickByText(page, "כניסה למסלול הקורס");
  await page.waitForTimeout(500);
  await shot(page, "04-world-course.png");

  await clickByText(page, "פתח שיעור");
  await page.waitForTimeout(500);
  await shot(page, "05-lesson-intro.png");

  await clickByText(page, "התחל 10 שאלות על המושג הזה");
  await page.waitForTimeout(500);
  await shot(page, "06-battle-before-answer.png");

  const firstOption = page.locator("article button.option-button").first();
  if (await firstOption.count()) {
    await firstOption.click();
    await page.waitForTimeout(500);
    await shot(page, "07-explanation-modal.png");
  }

  const overflowMetrics = await page.evaluate(() => {
    const root = document.documentElement;
    const body = document.body;
    return {
      innerWidth: window.innerWidth,
      rootScrollWidth: root.scrollWidth,
      bodyScrollWidth: body.scrollWidth,
      hasHorizontalOverflow: root.scrollWidth > window.innerWidth || body.scrollWidth > window.innerWidth,
    };
  });

  const checks = {
    baseUrl: BASE_URL,
    viewport: VIEWPORT,
    overflowMetrics,
    consoleErrors,
    passed: !overflowMetrics.hasHorizontalOverflow && consoleErrors.length === 0,
  };

  fs.writeFileSync(path.join(OUT_DIR, "checks.json"), JSON.stringify(checks, null, 2));

  await browser.close();
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

