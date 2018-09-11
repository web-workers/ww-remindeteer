const puppeteer = require("puppeteer");
const moment = require("moment");

// IIFE is back!
(async () => {
    // Create a Puppeteer Browser instance.
    const browser = await puppeteer.launch({
        headless: false,
        slowMo: 200,
        devtools: true
    });

    //  Pass the browser to each task
    //let lastCommit = await checkGitHub(browser);
    let isDescriptionMissing = await checkMeetup(browser);

    console.log(
        "Next WW MEETUP Description is missing? ",
        isDescriptionMissing ? "Yep. Get on it." : "All Good."
    );
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
    let commitDate = await page.evaluate(selector => {
        // Plain ol' JavaScript
        let dateTime = document
            .querySelector(selector)
            .getAttribute("datetime");

        // evaluate must return a promise.
        return Promise.resolve(dateTime);
    }, SELECTOR_LAST_COMMIT);

    // Return the commit date to the main function.
    return Promise.resolve(commitDate);
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

    // Wait for the event data to load.
    await meetupPage.waitForSelector("div.eventCard");

    // Search for the next Web Workers event and get a link to the event page.
    // GOTCHA: evaluate() must return a serializable value.
    let wwLink = await meetupPage.evaluate(() => {
        // Grab all the event links and convert the NodeList to an Array
        let links = Array.from(document.querySelectorAll("a.eventCard--link"));

        // Filter out anything that's not Web Workers
        let wwLinks = links.filter(link =>
            link.innerText.includes("Memphis Web Workers User Group")
        );

        // If we find a link, return it.
        if (wwLinks && wwLinks.length > 0) {
            // Just get the next one in line.
            // We'll worry about the others next month :)
            return Promise.resolve(wwLinks[0].href); // don't forget RETURN!!!
        } else {
            Promise.reject(null);
        }
    });

    console.log(wwLink);

    // If a link exists...
    if (wwLink) {
        // ... go to it!
        await meetupPage.goto(wwLink);
        // Wait for the event description field to appear
        await meetupPage.waitForSelector(".event-description");

        // Search the description for the default phrase.
        // Return 'true' if the default phrase is there.
        const isDescriptionMissing = await meetupPage.evaluate(() => {
            let details = document.querySelector(".event-description")
                .innerText;
            if (details.includes("Agenda and location TBA")) {
                return Promise.resolve(true);
            } else {
                return Promise.resolve(false);
            }
        });

        // Resolve 'true' if a custom description of the meetup is missing.
        if (isDescriptionMissing) {
            return Promise.resolve(true);
        } else {
            return Promise.resolve(false);
        }
    } else {
        // If no Web Workers link was found, return false. We've got time.
        return Promise.resolve(false);
    }
}
