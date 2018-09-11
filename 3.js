const puppeteer = require("puppeteer");
const moment = require("moment");

// IIFE is back!
(async () => {
    // Create a Puppeteer Browser instance.
    const browser = await puppeteer.launch({
        headless: false,
        slowMo: 200
    });

    //  Pass the browser to each task
    let lastCommit = await checkGitHub(browser);
    //let isDescriptionMissing = await checkMeetup(browser);

    console.log(moment(lastCommit).format("MM-DD-YYYY"));
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

    // Go to github.
    await page.goto("https://github.com/web-workers/webworkers");

    // We're going to look for a <relative-time> element on the page.
    const SELECTOR_LAST_COMMIT = "relative-time";

    // Wait until it shows up before doing anything.
    await page.waitForSelector(SELECTOR_LAST_COMMIT);

    // Extract the datetime attribute value from the element.
    // Variables from the node script must be passed into evaluate() as arguments.
    let commitDate = await page.evaluate(
        (selector, logThing) => {
            // Plain ol' JavaScript
            let dateTime = document
                .querySelector(selector)
                .getAttribute("datetime");

            console.log(logThing);

            // evaluate must return a promise.
            return Promise.resolve(dateTime);
        },
        SELECTOR_LAST_COMMIT,
        "Hey Y'all!"
    );

    // Return the commit date to the main function.
    return Promise.resolve(commitDate); // <-- Promise.resolve()!!!
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
