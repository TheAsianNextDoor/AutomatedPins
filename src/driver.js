import 'chromedriver';
import {
    Builder,
    // eslint-disable-next-line no-unused-vars
    WebDriver,
} from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';


/**
 * The private WebDriver instance
 */
let webDriver = { message: 'WebDriver has not been initialized yet' };

/**
 * Returns the instance of the initialized Chrome webDriver
 * @returns {WebDriver}
 */
export const getDriver = () => webDriver;

/**
 * Sets the private webdriver variable
 * @param {WebDriver} driver
 * @returns {void}
 */
export const setDriver = (driver) => {
    if (!(driver instanceof WebDriver)) {
        throw new Error(`driver was not an instance of WebDriver: ${driver}`);
    }
    webDriver = driver;
};

/**
 * Creates an instance of the chrome webdriver and sets the private webdriver variable
 * @returns {Promise<WebDriver>}
 */
export const initializeDriver = async () => {
    const options = new chrome.Options()
        .setPageLoadStrategy('eager')
        .addArguments('start-maximized');
    const service = new chrome.ServiceBuilder();
    // service.loggingTo('')
    const newDriver = new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .setChromeService(service)
        .build();
    setDriver(newDriver);
    return newDriver;
};

/**
 * Kills the webdriver instance, thus closing chrome
 * @returns
 */
export const killDriver = () => getDriver().quit();
