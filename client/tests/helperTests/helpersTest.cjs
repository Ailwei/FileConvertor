const { Builder, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const chromedriver = require('chromedriver');

async function buildDriver() {
  return new Builder()
    .forBrowser('chrome')
    .setChromeService(new chrome.ServiceBuilder(chromedriver.path))
    .build();
}
async function findElement(driver, locator){
  const element = await driver.wait(until.elementLocated(locator), 5000);
  await driver.wait(until.elementIsVisible(element), 5000);
  return element;
}
async function click(driver, locator){
  const element = await driver.wait(until.elementLocated(locator))
  await driver.wait(until.elementIsVisible(element), 5000);
  await element.click();
}

module.exports = { buildDriver, findElement, click};
