import commander from 'commander';
import {
    parseISO,
    sub,
} from 'date-fns';
import sleep from 'sleep-promise';
import {
    executePurchase,
    preCheckOptionsForSingleUser,
} from './buyHelperFunctions';
import { initializeDriver } from './driver';
import {
    scheduleAsyncFunction,
    executeAsyncFunction,
} from './utilities/scheduleUtils';

commander
    .description('Purchase an item from a website at a given date and time in the future or immediately')
    .requiredOption(
        '-w, --website <website>',
        'The website to execute the purchase on',
    )
    .requiredOption(
        '-u, --user <user>',
        'Users to purchase item with',
    )
    .requiredOption(
        '-i, --item <item>',
        'The tile text of the item to purchase',
    )
    .option(
        '-dt, --date-time <dateTime>',
        'The date and time to start running the script',
    )
    .option(
        '-n, --now',
        'If true executes buy immediately',
    )
    .parse(process.argv);

preCheckOptionsForSingleUser(commander.opts());

const {
    user,
    website,
    item,
    dateTime,
    now,
} = commander;

// parse iso8601 string into Date Object for scheduleAsyncFunction
const parsedDateTime = parseISO(dateTime);

(async () => {
    if (dateTime) {
        // schedule driver initialization 15 seconds before inputted time
        await scheduleAsyncFunction(
            async () => initializeDriver(),
            sub(
                parsedDateTime,
                { seconds: 15 },
            ),
        );

        // schedule script start 1 second before inputted time
        await scheduleAsyncFunction(
            async () => executePurchase[website](user, item),
            sub(
                parsedDateTime,
                { seconds: 2 },
            ),
            true,
        );
    } else if (now) {
        // sleep 5 seconds to give user time to double check config
        await sleep(5000);
        await initializeDriver();
        await executeAsyncFunction(async () => executePurchase[website](user, item));
    }
})();
