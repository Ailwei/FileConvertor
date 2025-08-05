const { expect } = require('chai');
const { findElement, click } = require('../helperTests/helpersTest.cjs');
const { By } = require('selenium-webdriver');


let driver;
function setDriver(externalDriver) {
    driver = externalDriver;
}

function subscriptionTests() {
    it('it must suscripe if there is no susbription', async function () {
        const findPackage = await findElement(driver, By.css('button.mt-2.btn.btn-primary'), 5000);
        await findPackage.click()
        const subcriptionForm = await findElement(driver, By.css('div.modal-content'), 5000);
        const findFullname = await findElement(driver, By.id('fullname'), 5000);
        const fullnameValue = await findFullname.getAttribute('value');
        expect(fullnameValue).to.equal('muundi users');

        const findEmail = await findElement(driver, By.id('email'), 5000);
        const emailValue = await findEmail.getAttribute('value');
        expect(emailValue).to.equal('mkusers@test.com');

        const addressInput = await findElement(driver, By.id('address'), 5000);
        await addressInput.sendKeys('1001 pretoria 085656');
        const cityInput = await findElement(driver, By.id('city'), 5000);
        await cityInput.sendKeys('Pretoria');
        const codeInput = await findElement(driver, By.id('postalCode'), 5000);
        await codeInput.sendKeys('0865');
        const selectCoutry = await findElement(driver, By.id('country'), 5000);
        await selectCoutry.sendKeys('South Africa')

        const stripeIframes = await driver.findElements(By.css('iframe[name^="__privateStripeFrame"]'));

        await driver.switchTo().frame(stripeIframes[0]);
        const cardInput = await findElement(driver, By.css('input[name="cardnumber"]'), 5000);
        await cardInput.sendKeys('4242 4242 4242 4242');

        await driver.switchTo().defaultContent();
        await driver.switchTo().frame(stripeIframes[1]);
        const dateInput = await findElement(driver, By.css('input[name="exp-date"]'), 5000);
        await dateInput.sendKeys('09/29');

        await driver.switchTo().defaultContent();
        if (stripeIframes.length > 2) {
            await driver.switchTo().frame(stripeIframes[2]);
            const cvcInput = await findElement(driver, By.css('input[name="cvc"]'), 5000);
            await cvcInput.sendKeys('123');
        }

        await driver.switchTo().defaultContent();

        await driver.sleep(3000);

        let payBtn;
        try {
            payBtn = await findElement(driver, By.css('button[type="submit"]'), 5000);
        } catch (e) {
            try {
                payBtn = await findElement(driver, By.css('button:contains("Pay")', 5000));
            } catch (e2) {
                payBtn = await findElement(driver, By.css('form button.btn.btn-primary'), 5000);
            }
        }

        await driver.executeScript("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", payBtn);
        await driver.sleep(1000);

        await driver.wait(async () => {
            try {
                return await payBtn.isDisplayed() && await payBtn.isEnabled();
            } catch (e) {
                return false;
            }
        }, 5000);

        try {
            await driver.executeScript("arguments[0].click();", payBtn);
        } catch (e) {
            const actions = driver.actions();
            await actions.move({ origin: payBtn }).click().perform();
        }

        await driver.sleep(5000);

    })
} module.exports = {
    setDriver,
    subscriptionTests
}