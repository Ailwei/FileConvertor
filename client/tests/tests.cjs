const { buildDriver } = require('./helperTests/helpersTest.cjs');
const browserTests = require('./specificTests/browserTest.cjs');
const loginTests = require('./specificTests/loginTest.cjs');
const registerTests = require('./specificTests/registerTest.cjs');
const convertFilesTests = require('./specificTests/convertFileTests.cjs');
const subscriptionTests = require('./specificTests/subscriptionTests.cjs');

describe('Browse the Landing Page', function () {
  let driver;
  this.timeout(60000);

  before(async function () {
    driver = await buildDriver();
    browserTests.setDriver(driver);
    loginTests.setDriver(driver);
    registerTests.setDriver(driver);
    convertFilesTests.setDriver(driver);
    subscriptionTests.setDriver(driver);
  });

  after(async function () {
    await driver.quit();
  });

  describe('Landing Page Tests', function () {
    browserTests.browserTests();
  });
  describe('Register Form Tests', function () {
    registerTests.registerTests();

  });
  describe('Login Form Tests', function () {
    loginTests.loginTests();

  });
  describe('Convert files', function () {
    convertFilesTests.convertFilesTests();

  });
  describe('Subscribe to a package', function () {
    subscriptionTests.subscriptionTests();

  });
});
