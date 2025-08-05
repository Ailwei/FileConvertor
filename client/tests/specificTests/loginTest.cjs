const { expect } = require('chai');
const { findElement, click} = require('../helperTests/helpersTest.cjs');
const { By, until } = require('selenium-webdriver');

let driver;

function setDriver(externalDriver) {
  driver = externalDriver;
}

function loginTests() {
  describe('Login Form Tests', function () {
    it('should load the login form correctly', async function () {
      await driver.get('http://localhost:3000/login');
      const heading = await findElement(driver, By.css('h2'));
      const text = await heading.getText();
      expect(text).to.equal('Login');
    });

   it('should prevent submission when required fields are empty', async function () {
  await driver.get('http://localhost:3000/login');

  const emailInput = await findElement(driver, By.id('email'));
  const passwordInput = await findElement(driver, By.id('password'));

  const isEmailValid = await driver.executeScript("return arguments[0].checkValidity();", emailInput);
  const isPasswordValid = await driver.executeScript("return arguments[0].checkValidity();", passwordInput);

  expect(isEmailValid).to.be.false;
  expect(isPasswordValid).to.be.false;
});


    it('should show error on incorrect login', async function () {
      await driver.get('http://localhost:3000/login');

      const emailInput = await findElement(driver, By.id('email'));
      const passwordInput = await findElement(driver, By.id('password'));
      const submitBtn = await findElement(driver, By.css('button[type="submit"]'));

      await emailInput.sendKeys('wrong@example.com');
      await passwordInput.sendKeys('badpassword');
      await click(driver, By.css('button[type="submit"]'));

      const alert = await findElement(driver, By.css('div.alert'), 5000);
      const errorText = await alert.getText();
      expect(errorText).to.include('Login failed: User not registered.');
    });
    it('should reset the user password', async function () {
  await driver.get('http://localhost:3000/login');

  const forgotLink = await findElement(driver, By.css('a.text-decoration-none'), 5000);
  const linkText = await forgotLink.getText();
  expect(linkText).to.include('Forgot Password?');

  await forgotLink.click();
  const heading = await findElement(driver, By.css('h1'), 5000);
  const headingText = await heading.getText();
  expect(headingText).to.include('Forgot Password');
});
it('it should reset password with wrong credentials',  async function(){
  const inputFied = await findElement(driver, By.id('email'));
  await inputFied.sendKeys('ailwei@user.com');
  const buttonReset = await findElement(driver, By.xpath('//*[@id="root"]/div/div/form/button'))
  await buttonReset.click();
  const errorMessage = await findElement(driver, By.css('.alert-danger'));
  const text = await errorMessage.getText();
  expect(text).to.include('User not found');
});
it('should show popup alert after password reset request', async function () {
  await driver.get('http://localhost:3000/forgotpassword');

  const emailInput = await findElement(driver, By.id('email'));
  await emailInput.clear();
  await emailInput.sendKeys('mkusers@test.com');

  const resetBtn = await findElement(driver, By.xpath('//*[@id="root"]/div/div/form/button'));
  await resetBtn.click();
  
  try {
    await driver.wait(until.alertIsPresent(''), 5000);
    const alert = await driver.switchTo().alert();
    const alertText = await alert.getText();
    expect(alertText.toLowerCase()).to.include('check your email for reset instructions');
    await alert.accept();
  } catch (error) {
    console.log('No popup alert found, checking for inline message');
    const successMessage = await findElement(driver, By.css('.alert-success, .success-message, .alert-info'), 5000);
    const messageText = await successMessage.getText();
    expect(messageText.toLowerCase()).to.include('check your email');
  }
});




    it('should login with correct credentials and redirect', async function () {
      await driver.get('http://localhost:3000/login');

      const emailInput = await findElement(driver, By.id('email'));
      const passwordInput = await findElement(driver, By.id('password'));

      await emailInput.clear();
      await passwordInput.clear();

      await emailInput.sendKeys('mkusers@test.com');
      await passwordInput.sendKeys('12345');
      await click(driver, By.css('button[type="submit"]'));

      await driver.wait(until.urlContains('/dashboard'), 5000);
      const url = await driver.getCurrentUrl();
      expect(url).to.include('/dashboard');
    });
  });
}

module.exports = { setDriver, loginTests };
