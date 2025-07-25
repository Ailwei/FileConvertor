const { expect } = require('chai');
const { By } = require('selenium-webdriver');
const { findElement } = require('../helperTests/helpersTest.cjs');

let driver;

function setDriver(externalDriver) {
  driver = externalDriver;
}

function browserTests() {
  it('It must find the logo', async function () {
    await driver.get('http://localhost:3000');
    const logoLink = await findElement(driver, By.css('a.d-flex'));
    const logo = await findElement(driver, By.css('img[src="/images/File.png"]'));

    const isDisplayed = await logo.isDisplayed();
    expect(isDisplayed).to.be.true;

  });
  it('it must find text', async function () {
    const logoText = await findElement(driver, By.css('span.d-none'));
    const text = await logoText.getText();
    expect(text).to.include('File Conversion Service');
  });
  it('it must find both Login and Register links', async function () {
    const links = await driver.findElements(By.css('a.nav-link'));
    const texts = await Promise.all(links.map(link => link.getText()));

    expect(texts).to.include('Login');
    expect(texts).to.include('Register');
  });
  it('it must find the header and subheader', async function () {
    const findHeader = await findElement(driver, By.css('h1.display-5'));
    const findSubHeader = await findElement(driver, By.css('p.lead'));

    const headerText = await findHeader.getText();
    const subHeaderText = await findSubHeader.getText();

    expect(headerText).to.include('Convert Files Effortlessly');
    expect(subHeaderText).to.include('Choose the plan that fits your needs');
  });
  it('should verify package cards text', async function () {
    const cards = await driver.findElements(By.css('.row.mt-4.g-4.text-start > .col-md-4'));

    expect(cards.length).to.equal(3);


    const expectedPackages = [
      {
        title: 'Basic Plan',
        price: 'Free',
        descriptionIncludes: 'Convert up to 10 files',
      },
      {
        title: 'Premium',
        price: 'R500/month',
        descriptionIncludes: 'Convert up to 100 files/month',
      },
      {
        title: 'Life Time',
        price: 'R1500/month',
        descriptionIncludes: 'Unlimited file conversions',
      },
    ];

    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      const expected = expectedPackages[i];

      const titleEl = await card.findElement(By.css('h5.card-title'));
      const titleText = await titleEl.getText();

      const priceEl = await card.findElement(By.css('p.fw-bold'));
      const priceText = await priceEl.getText();

      const descriptionEls = await card.findElements(By.css('p.card-text'));
      const descriptionTexts = await Promise.all(descriptionEls.map(el => el.getText()));

      expect(titleText).to.equal(expected.title);
      expect(priceText).to.equal(expected.price);

      const hasExpectedDescription = descriptionTexts.some(desc =>
        desc.includes(expected.descriptionIncludes)
      );
      expect(hasExpectedDescription).to.be.true;
    }
  });
  it('it must find the button with text', async function () {
    const buttonText = await findElement(driver, By.xpath("//button[contains(., 'Get Started')]"));
    const text = await buttonText.getText();
    expect(text).to.include('Get Started');

  });
  it('should find the about us section and its content', async function () {
    const aboutSection = await findElement(driver, By.css('#root > div > section.about.py-5 > section > div'));
    const text = await aboutSection.getText();

    expect(text).to.include("File Conversion Service");
    expect(text).to.include("Our mission is to provide a reliable and user-friendly service");
    expect(text).to.include("Thank you for choosing File Conversion Service");
  });
  it("It should find the footer and its contents", async function () {
    const footerSection = await findElement(driver, By.xpath("/html/body/div/div/section[3]"))
    const text = await footerSection.getText();
    expect(text).to.include("© 2024 File Conversion Service");
    expect(text).to.include("Privacy Policy");
    expect(text).to.include("Contact Us");
    expect(text).to.include("Facebook");

  })
}

module.exports = { setDriver, browserTests };
