const { Builder, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const chromedriver = require('chromedriver');

async function buildDriver() {
  const userDataDir = `/tmp/chrome-${Date.now()}`;
  const options = new chrome.Options()
    .addArguments('--headless=new')         
    .addArguments('--no-sandbox')             
    .addArguments('--disable-dev-shm-usage')
    .addArguments('--disable-gpu')
    .addArguments(`--user-data-dir=${userDataDir}`);

  const service = new chrome.ServiceBuilder(chromedriver.path);
   return new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .setChromeService(service)
    .build();

}
async function findElement(driver, locator){
  const element = await driver.wait(until.elementLocated(locator), 5000);
  await driver.wait(until.elementIsVisible(element), 5000);
  return element;
}
async function click(driver, target) {
  let element;
  if (typeof target === 'object' && typeof target.click === 'function') {
    element = target;
  } else {
    element = await driver.wait(until.elementLocated(target), 5000);
    await driver.wait(until.elementIsVisible(element), 5000);
  }
  await element.click();
}


module.exports = { buildDriver, findElement, click};
