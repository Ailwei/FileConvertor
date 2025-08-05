const { expect } = require('chai');
const { findElement, click } = require('../helperTests/helpersTest.cjs');
const { By} = require('selenium-webdriver');
const path = require('path');
const { subscriptionTests } = require('./subscriptionTests.cjs');


let driver;

function setDriver(externalDriver) {
    driver = externalDriver;
}
function convertFilesTests() {
    it('should NOT convert file if user is not subscribed', async function () {
    await driver.get('http://localhost:3000/dashboard');

    const openModalBtn = await findElement(driver, By.xpath('//*[@id="basic-navbar-nav"]/div/button[1]'), 5000);
    await click(driver, openModalBtn);

    const modal = await findElement(driver, By.css('div.modal-content'), 5000);

    const fileInput = await findElement(driver, By.id('file'), 5000);
    const filePath = path.resolve(__dirname, '../../tests/testsFiles/image1.jpeg');
    await fileInput.sendKeys(filePath);

    const formatSelect = await findElement(driver, By.id('format'), 5000);
    await formatSelect.sendKeys('PNG');

    const convertBtn = await findElement(driver, By.css('button[type="submit"]'), 5000);
    await convertBtn.click();
 
    const bodyText = await findElement(driver, By.css('div.alert'), 5000)
    const text = await bodyText.getText();

    expect(text).to.include('Subscribe before converting file');
    const closeForm = await findElement(driver, By.css('button.close'), 5000);
    await closeForm.click();

});
it('it should convert files', async function() {
    const openModalBtn = await findElement(driver, By.xpath('//*[@id="basic-navbar-nav"]/div/button[1]'), 5000);
    await click(driver, openModalBtn);

    const modal = await findElement(driver, By.css('div.modal-content'), 5000);

    const fileInput = await findElement(driver, By.id('file'), 5000);
    const filePath = path.resolve(__dirname, '../../tests/testsFiles/image1.jpeg');
    await fileInput.sendKeys(filePath);

    const formatSelect = await findElement(driver, By.id('format'), 5000);
    await formatSelect.sendKeys('PNG');

    const convertBtn = await findElement(driver, By.css('button[type="submit"]'), 5000);
    await convertBtn.click();
 
    const bodyText = await findElement(driver, By.css('div.alert'), 5000)
    const text = await bodyText.getText();
    

    expect(text).to.include('File converted successfully');
    const closeForm = await findElement(driver, By.css('button.close'), 5000);
    await closeForm.click();

})
    

}
module.exports = {
    setDriver, convertFilesTests
}
