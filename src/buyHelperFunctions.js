import readline from 'readline';
import { exit } from 'process';
import LotuCollections from './websites/lotu/lotuCollections';
import {
    parseDate,
    ensureFutureDateTime,
} from './utilities/dateUtils';
import ArtistryCollections from './websites/artistry/artistryCollections';
import {
    stringWithColor,
    logStringWithColor,
} from './utilities/stringUtils';
import NikeCollections from './websites/nike/nikeCollections';
import { config } from './config';

/**
 * List of supported websites
 */
export const supportedWebsites = [
    'lotu',
    'pookster',
    'artistry',
    'nike',
];

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

/**
 * Ensures that the website is on the supported list
 *
 * @param {string} website The website to buy something from
 */
export const ensureSupportedWebsite = (website) => {
    if (!supportedWebsites.some((site) => site === website)) {
        console.log(`\n'${website}' ${stringWithColor('IS NOT A SUPPORTED WEBSITE', 'redBright')}\
        \nPlease enter one of the following: ${supportedWebsites}\
        \nExiting Script\n`);
        exit(0);
    }
};

/**
 * Ensures that the every item in the website Array is on the supported list
 *
 * @param {string[]} websiteArray The website to buy something from
 */
export const ensureSupportedWebsiteArray = (websiteArray) => {
    if (!websiteArray.some((website) => supportedWebsites.includes(website))) {
        console.log(`\n'${websiteArray}' ${
            stringWithColor('ONE OF THESE WEBSITES IS NOT A SUPPORTED WEBSITE', 'redBright')
        }\nPlease ensure the config file's website keys is\
        one of the following: ${JSON.stringify(supportedWebsites, null, 4)}
        \nExiting Script\n`);
        exit(0);
    }
};

/**
 * Kills script if the user is not defined
 *
 * @param {string} user The user key to match in the config file
 */
export const ensureUserIsDefined = (user) => {
    if (!Object.keys(config).some((key) => key === user)) {
        logStringWithColor(
            `User: "${user}" is not defined in .src/config.js\nDouble check config file`,
            'redBright',
        );
        exit(0);
    }
};

export const ensureDateIsCorrect = (passedDate) => {
    const finalQuestion = `Is this date correct? ${
        stringWithColor(passedDate, 'magenta')
    }\nEnter y/yes or n/no\n`;
    console.log(finalQuestion);

    return rl.on('line', (input) => {
        if (input === 'y' || input === 'yes') {
            console.log('Continuing script');
            rl.close();
        } else if (input === 'n' || input === 'no') {
            console.log('Exiting Script\n');
            exit(0);
        } else {
            console.log('Enter a valid input');
        }
    });
};

/**
 * Control flow for Lotu website checkout
 *
 * @param {Object} user Commander user option
 * @returns {void}
 */
const lotuPurchase = async (user, item) => {
    const lotuCollections = new LotuCollections();
    await lotuCollections.navTo();
    let lotuProduct;
    try {
        await lotuCollections.refreshPageLocatingTileByName(item);
        lotuProduct = await lotuCollections.clickTileLinkByName(item);
    } catch (e) {
        throw new Error(stringWithColor(`Tile name: ${item} \
            \ndid not match anything on Lotu page \n\n${e}`, 'red'));
    }
    const shopifyInfo = await lotuProduct.clickBuyButton();
    const shopifyShipping = await shopifyInfo.expressCheckout(config[user]);
    const shopifyPayment = await shopifyShipping.clickContinueToPayment();
    await shopifyPayment.expressPay(config[user]);
};

/**
 * Control flow for artistry website checkout
 *
 * @param {Object} user Commander user option
 * @returns {void}
 */
const artistryPurchase = async (user, item) => {
    const artistryCollections = new ArtistryCollections();
    await artistryCollections.navTo();
    let artistryProduct;
    try {
        await artistryCollections.refreshPageLocatingTileByName(item);
        artistryProduct = await artistryCollections.clickTileByName(item);
    } catch (e) {
        throw new Error(stringWithColor(`Tile name did not match anything on Artistry page \n\n${e}`, 'red'));
    }
    const artistryShoppingCart = await artistryProduct.clickAddToCart();
    const shopifyInfo = await artistryShoppingCart.clickCheckout();
    const shopifyShipping = await shopifyInfo.expressCheckout(config[user]);
    const shopifyPayment = await shopifyShipping.clickContinueToPayment();
    await shopifyPayment.expressPay(config[user]);
};

/**
 * Control flow for Nike website checkout
 *
 * @param {Object} user Commander user option
 * @returns {void}
 */
const nikePurchase = async (user, item) => {
    const nikeCollections = new NikeCollections();
    await nikeCollections.navTo();
    let nikeProduct;
    try {
        await nikeCollections.refreshPageLocatingTileByName(item);
        nikeProduct = await nikeCollections.clickTileByName(item);
    } catch (e) {
        throw new Error(stringWithColor(`Tile name did not match anything on Nike page \n\n${e}`, 'red'));
    }
    await nikeProduct.clickSize(8, 'male');
    const nikeShoppingCart = await nikeProduct.clickAddToCart();
    let nikeInfo = await nikeShoppingCart.clickShoppingCart();
    nikeInfo = await nikeShoppingCart.clickCheckout();
    const nikeShipping = await nikeInfo.expressCheckout(config[user]);
    const nikePayment = await nikeShipping.clickContinueToPayment();
    await nikePayment.expressPay(config[user]);
};

/**
 * Control flow for pookster website checkout
 *
 * @param {Object} config Commander config
 * @returns {void}
 */
const pooksterPurchase = async () => {

};

const scritchPurchase = async () => {

};

/**
 * Enum for website purchase control flow
 *
 * @param {string} user the name of the user in the config file
 * @param {string} item the tile text of the item to purchase
 */
export const executePurchase = {
    lotu: async (user, item) => lotuPurchase(user, item),
    artistry: async (user, item) => artistryPurchase(user, item),
    pookster: async (user, item) => pooksterPurchase(user, item),
    scritch: async (user, item) => scritchPurchase(user, item),
    nike: async (user, item) => nikePurchase(user, item),
};

/**
 * Kills script if the provided options are not correct
 * Pre check for buyItemCommand and buyAllItemsForUserCommand
 *
 * @param {Object} options Commander options and config options
 * @returns {void}
 */
export const preCheckOptionsForSingleUser = (options) => {
    const {
        dateTime,
        now,
        website,
        user,
    } = options;

    // if no dateTime or now option passed in
    if (!dateTime && !now) {
        logStringWithColor(
            '\nMust pass in either dateTime or \'now\' flag. Did not pass either',
            'red',
        );
        exit(0);
    }

    // if dateTime and now option passed in
    if (dateTime && now) {
        logStringWithColor(
            '\nMust pass in either dateTime or \'now\' flag. Passed in both',
            'red',
        );
        exit(0);
    }

    // Ensure datTime is in iso 8601 format and in the future if passed
    if (dateTime) {
        const parsedDate = parseDate(dateTime);
        ensureFutureDateTime(parsedDate);
    }

    ensureSupportedWebsite(website);
    ensureUserIsDefined(user);
};


/**
 * Kills script if the provided options are not correct
 * Pre check for buyEntireConfig command
 *
 * @param {Object} options Commander options and config options
 * @returns {void}
 */
export const preCheckOptionsForMultiUser = (options) => {
    const {
        dateTime,
        now,
        websites,
    } = options;

    // if no dateTime or now option passed in
    if (!dateTime && !now) {
        logStringWithColor(
            '\nMust pass in either dateTime or \'now\' flag. Did not pass either',
            'red',
        );
        exit(0);
    }

    // if dateTime and now option passed in
    if (dateTime && now) {
        logStringWithColor(
            '\nMust pass in either dateTime or \'now\' flag. Passed in both',
            'red',
        );
        exit(0);
    }

    // Ensure datTime is in iso 8601 format and in the future if passed
    if (dateTime) {
        const parsedDate = parseDate(dateTime);
        ensureFutureDateTime(parsedDate);
    }

    ensureSupportedWebsiteArray(websites);
};

/**
 * Takes commander and config file strings and arranges them into a commander parsable
 * options array
 *
 * @param {Object} param0 Args to append into commander parse-able array
 * @returns {string[]}
 */
export const buildCommanderOptions = ({
    website,
    user,
    dateTime,
    now,
}) => {
    const commanderOptions = [];
    if (website) {
        commanderOptions.push(
            '--website',
            website,
        );
    }
    if (user) {
        commanderOptions.push(
            '--user',
            user,
        );
    }
    if (dateTime) {
        commanderOptions.push(
            '--date-time',
            dateTime,
        );
    }
    if (now) {
        commanderOptions.push('--now');
    }

    return commanderOptions;
};
