import Button from '../../controls/button';
import Input from '../../controls/input';
import Select from '../../controls/select';
import { by } from '../../utilities/byUtils';
import ShopifyShipping from './shopifyShipping';
import { stringWithColor } from '../../utilities/stringUtils';
import NikeShopping from './nikeShipping';

export default class NikeInformation {
    constructor() {
        const checkoutPrefix = 'checkout_shipping_address_';
        this.emailBy = by.id('email');
        this.phoneNumberBy = by.id('phoneNumber');
        this.emailOrPhoneBy = by.id('checkout_email_or_phone');
        this.firstNameBy = by.id(`firstName`);
        this.lastNameBy = by.id(`lastName`);
        this.addressBy = by.id(`address1`);
        this.cityBy = by.id(`city`);
        this.stateBy = by.id(`state`);
        this.zipBy = by.id(`postalCode`);
        this.continueToShippingBy = by.xpath(`//button[contains(text(), "Save & Continue")]`);

        // Controls
        this.email = new Input(this.emailBy);
        this.phoneNumber = new Input(this.phoneNumberBy);
        this.emailOrPhone = new Input(this.emailOrPhoneBy);
        this.firstName = new Input(this.firstNameBy);
        this.lastName = new Input(this.lastNameBy);
        this.address = new Input(this.addressBy);
        this.city = new Input(this.cityBy);
        this.state = new Select(this.stateBy);
        this.zip = new Input(this.zipBy);
        this.continueToShippingButton = new Button(this.continueToShippingBy);
    }

    /**
     * Enters the given info into the provided fields
     * @param {Object} param0 Config object for filling out page
     *
     * @returns {Promise<ShopifyShipping>}
     */
    expressCheckout = async ({
        email,
        firstName,
        lastName,
        address,
        city,
        state,
        zip,
    }) => {
        if (
            !email
            || !firstName
            || !lastName
            || !address
            || !city
            || !state
            || !zip
        ) {
            throw new Error(stringWithColor('Must pass in all checkout fields, check config.js', 'red'));
        }
        await this.email.sendKeys(email);
        await this.firstName.sendKeysAndTabOff(firstName);
        await this.lastName.sendKeysAndTabOff(lastName);
        await this.address.sendKeysAndTabOff(address);
        await this.city.sendKeysAndTabOff(city);
        await this.state.sendKeysNatively(state);
        await this.zip.sendKeysAndTabOff(zip);
        await this.continueToShippingButton.click();
        return new NikeShipping();
    }
}