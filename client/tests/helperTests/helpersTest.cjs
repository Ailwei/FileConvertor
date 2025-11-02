const { Builder, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const chromedriver = require('chromedriver');

async function buildDriver() {
  const options = new chrome.Options()
    .addArguments('--headless=new')
    .addArguments('--no-sandbox')
    .addArguments('--disable-dev-shm-usage')
    .addArguments('--disable-gpu')
    .addArguments('--remote-debugging-port=9222')
    .addArguments(`--user-data-dir=/tmp/chrome-${Date.now()}`);

  const service = new chrome.ServiceBuilder(chromedriver.path).build();
  chrome.setDefaultService(service);

  return new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();
}

async function findElement(driver, locator) {
  const element = await driver.wait(until.elementLocated(locator), 10000);
  await driver.wait(until.elementIsVisible(element), 10000);
  return element;
}

async function click(driver, target) {
  let element;
  if (typeof target === 'object' && typeof target.click === 'function') {
    element = target;
  } else {
    element = await driver.wait(until.elementLocated(target), 10000);
    await driver.wait(until.elementIsVisible(element), 10000);
  }
  await element.click();
}

module.exports = { buildDriver, findElement, click };
