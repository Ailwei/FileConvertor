const { buildDriver } = require('./helperTests/helpersTest.cjs');
const browserTests = require('./specificTests/browserTest.cjs');
const loginTests = require('./specificTests/loginTest.cjs');

describe('Browse the Landing Page', function () {
  let driver;
  this.timeout(60000);

  before(async function () {
    driver = await buildDriver();
    browserTests.setDriver(driver);
    loginTests.setDriver(driver);
  });

  after(async function () {
    await driver.quit();
  });

  describe('Landing Page Tests', function () {
    browserTests.browserTests();
    loginTests.loginTests();
  });
});
