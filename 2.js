const puppeteer = require("puppeteer");

// IIFE is back!
(async () => {
    // Create a Puppeteer Browser instance.
    const browser = await puppeteer.launch({
        headless: false,
        slowMo: 200,
        devtools: true
    });

    //  Pass the browser to each task
    let lastCommit = await checkGitHub(browser);
    let isDescriptionMissing = await checkMeetup(browser);
})();

/**
 * Check the Web Worker website to see if it's been updated recently,
 * or is getting super stale.
 *
 * @param {Browser} browser A Puppeteer Browser Instance
 */
async function checkGitHub(browser) {
    // Use the first page made available by the browser
    const pages = await browser.pages();
    const page = pages[0];

    // Go to the WW github repo
    await page.goto("https://github.com/web-workers/webworkers");
}

/**
 * Check to the MEMTECH Meetup.com event page for the next WW meetup.
 * Make sure that an agenda is set in the description.
 *
 * @param {Browser} browser A Puppeteer Browser Instance
 */
async function checkMeetup(browser) {
    // Create a new tab for the Meetup.com page
    const meetupPage = await browser.newPage();

    // Go to the MEMTECH events list
    await meetupPage.goto(
        "https://www.meetup.com/memphis-technology-user-groups/events/"
    );
}
