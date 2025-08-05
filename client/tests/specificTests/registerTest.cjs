const { expect } = require('chai');
const { findElement, click } = require('../helperTests/helpersTest.cjs');
const { By} = require('selenium-webdriver');

let driver;

function setDriver(externalDriver) {
    driver = externalDriver;
}
function registerTests() {
    it('it should have empty fileds on the register form', async function () {
        await driver.get('http://localhost:3000');
        const registerLink = await findElement(driver, By.css('a.nav-link'), 5000);
        await click(driver,By.css('a.nav-link') )
        await driver.get('http://localhost:3000/signup')
        const form = await findElement(driver, By.css('h2'))
        const text = await form.getText();
        expect(text).to.be.include('Create Account')


        const firstname = await findElement(driver, By.id('firstname'), 5000);
        const isFirstValid = await driver.executeScript("return arguments[0].checkValidity();", firstname);
        const lastname = await findElement(driver, By.id('lastname'), 5000);
        const isLastnameValid = await driver.executeScript("return arguments[0].checkValidity();", lastname);
        const email = await findElement(driver, By.id('email'), 5000);
        const isEmailValid = await driver.executeScript("return arguments[0].checkValidity();", email);
        const password = await findElement(driver, By.id('password'), 5000);
        const isPasswordValid = await driver.executeScript("return arguments[0].checkValidity();", password);


        expect(isFirstValid).to.be.false;
        expect(isLastnameValid).to.be.false;
        expect(isEmailValid).to.be.false;
        expect(isPasswordValid).to.be.false;
    });
    it('it should register with the already existing email', async function () {
        await driver.get('http://localhost:3000/signup');
        const firstname = await findElement(driver, By.id('firstname'), 5000);
        await firstname.sendKeys('Ailwei');
        const lastname = await findElement(driver, By.id('lastname'), 5000);
        await lastname.sendKeys('Maemu');
        const email = await findElement(driver, By.id('email'), 5000);
        await email.sendKeys('mkusers@test.com');
        const password = await findElement(driver, By.id('password'), 5000);
        await password.sendKeys('12345');


        const buttonSubmit = await findElement(driver, By.css('button[type="submit"]'), 5000)
        await buttonSubmit.click();

        const errorText = await findElement(driver, By.css('div.alert.alert-danger'), 5000);
        const text = await errorText.getText();
        

        expect(text).include('User already exists');

    })
    it('it should register with unique email address', async function(){
        await driver.get('http://localhost:3000/signup');
        const firstname = await findElement(driver, By.id('firstname'), 5000);
        await firstname.sendKeys('Ailwei');
        const lastname = await findElement(driver, By.id('lastname'), 5000);
        await lastname.sendKeys('Maemu');
        const email = await findElement(driver, By.id('email'), 5000);
        await email.sendKeys('testusers@test.com');
        const password = await findElement(driver, By.id('password'), 5000);
        await password.sendKeys('12345');


        const buttonSubmit = await findElement(driver, By.css('button[type="submit"]'), 5000)
        await buttonSubmit.click();
        await driver.get('http://localhost:3000/login')

    })

}
module.exports = {
    setDriver, registerTests
}
