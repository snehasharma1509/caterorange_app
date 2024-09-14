const logger = require('../config/logger.js');
const { DB_COMMANDS} = require('../utils/queries.js');
const client = require('../config/db.js');

const createCustomer = async (customer_name, customer_email, customer_password, customer_phonenumber, access_token) => {
    try {
        console.log('in model',access_token)
        const result = await client.query(
            DB_COMMANDS.CUSTOMER_INSERT,
            [customer_name, customer_email, customer_password, customer_phonenumber, access_token]
        );
        logger.info('User data added successfully', { customer_email });
        return result.rows[0];  // Return the created customer
    } catch (err) {
        logger.error('Error adding user data', { error: err.message, customer_email });
        throw err;
    }
};


const findCustomerEmail = async (customer_email) => {
    try {
        const result = await client.query(DB_COMMANDS.CUSTOMER_EMAIL_SELECT, [customer_email]);
        if (result.rows.length === 0) {
            logger.error('No customer found with email:', customer_email);
            return null;
        }
        logger.info('result in model',result.rows[0])
        return result.rows[0];  // Return the customer details, or undefined if not found
    } catch (err) {
        logger.error('Error querying the database for customer_email', { error: err.message });
        throw err;
    }
};


const findCustomerToken = async (access_token) => {
    try {
        const result = await client.query(DB_COMMANDS.CUSTOMER_TOKEN_SELECT, [access_token]);
        if (result.rows.length === 0) {
            logger.error('No customer found with token:',access_token);
            return null;
        }
        return result.rows[0];  // Return the customer details, or undefined if not found
    } catch (err) {
        logger.error('Error querying the database for access_token', { error: err.message });
        throw err;
    }
};


const updateCustomerPassword = async (customer_email, hashedPassword,token) => {
    try {
        const result = await client.query(
            DB_COMMANDS.CUSTOMER_SET_PASSWORD,
            [customer_email, hashedPassword,token]
        );
        logger.info('Customer password updated successfully', { customer_email });
        return result.rowCount > 0; // Return true if any row was updated
    } catch (err) {
        logger.error('Error updating customer password', { error: err.message, customer_email });
        throw err;
    }
};

const updateAccessToken= async(customer_email, access_token)=>{
    try {
        const result = await client.query(
            DB_COMMANDS.CUSTOMER_SET_ACCESSTOKEN,
            [customer_email, access_token]
        );
        logger.info('Customer Token updated successfully', { customer_email });
        return result.rowCount > 0; // Return true if any row was updated
    } catch (err) {
        logger.error('Error updating customer token', { error: err.message, customer_email });
        throw err;
    }
}

const getCorporateCategories = async () => {
    try {
        const res = await client.query(DB_COMMANDS.GETCORPORATECATEGORY);
        return res.rows;
        logger.info('Corporate categories fetched successfully')
    } catch (err) {
        throw new Error('Error fetching categories from the database');
    }
};
const add_cart = async (customer_id, category_id, processing_date, quantity) =>{
    try{
       const result = await client.query(
    DB_COMMANDS.ADD_CORPORATECART,[customer_id, category_id, processing_date, quantity])
    logger.info('cart data added successfully');
    return result.rows[0];
} catch (err) {
    logger.error('Error adding cart data in model', { error: err.message });
    throw err;
}
}

const getCarts = async ( customer_id ) => {
    try {
        logger.info('Fetching corporate carts...');
        const res = await client.query(DB_COMMANDS.GETCARTS,[customer_id]);
        
        if (res.rowCount === 0) {
            logger.info('No carts found');
        } else {
            logger.info(`Corporate carts fetched successfully: ${res.rowCount} carts`);
            logger.info('Carts data:', res.rows);
        }

        return res.rows;
    } catch (err) {
        logger.error('Error fetching carts:', err);
        throw new Error('Error fetching carts from the database');
    }
};


module.exports = {
    createCustomer,
    findCustomerEmail,
    updateCustomerPassword,
    updateAccessToken,
    getCorporateCategories,
    add_cart,
    getCarts,
    findCustomerToken
};
