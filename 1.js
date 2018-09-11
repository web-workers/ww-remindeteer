const puppeteer = require("puppeteer");

// IIFE is back!
// Also, everything is asynchronous.
(async () => {
    // Create a Puppeteer Browser instance.
    const browser = await puppeteer.launch({
        headless: false,
        slowMo: 200,
        devtools: true
    });

    // All this code runs in node
    console.log("I am in Node.");

    // Get all the open browser pages
    const pages = await browser.pages();

    // There's only one on startup.
    const page = pages[0];

    // eval code runs in the browser. Check the console in Dev Tools!
    page.evaluate(() => {
        console.log("I am in the Browser!!!");
    });
})();
