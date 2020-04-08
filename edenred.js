const puppeteer = require('puppeteer')
const config = require('./config')

const USERNAME = config.username
const PASSWORD = config.password
let run = async function(){
  const browser = await puppeteer.launch(
    {
        headless: false
    }
  )
  const page = await browser.newPage();
  await page.goto('https://www.myedenred.be/');

  await page.waitForSelector('div.profil', {visible: true})
  const profiles = await page.$$('div.profil')
  await profiles[1].click()
  await page.waitForNavigation()

  await page.type('#username', USERNAME);
  await page.type('#password', PASSWORD);

  await page.$eval('#form', form => form.submit());

  await page.waitForNavigation()
  await page.goto('https://www.myedenred.be/#/customer/create-order-electro?product=TRE')

  const repeatButton = await page.waitForSelector('button.modalCreateOrderElectroButtonDuplicateLastOrder', {visible: true})
  await repeatButton.click()

  // Wachten tot bestelling geladen is
  await page.waitForSelector('.titreNumber', {visible: true})
      
  const bestelling = await page.waitForXPath('//*[@id="createOrderPageStep3"]/div/div[1]/div[3]/table/tbody/tr', {visible: true})
  const cellen = await bestelling.$$eval('td', tds => { return tds.map(td => td.textContent).join(', ') })
  const aantal = await bestelling.$eval('.titreNumber', input => { return input.value })
  const waarde = await bestelling.$eval('.titreValue', input => { return input.value })
  console.log(`${aantal} bonnen van ${waarde} euro voor: ${cellen}`)

  const submitButton = await page.$('#validateCommand')
  submitButton.click()

  const submitDefinitiefButton = await page.waitForXPath('//*[@id="validateOrderPage"]/section[2]/div/div[3]/div[2]/button', {visible: true})
  submitDefinitiefButton.click();
};

run()