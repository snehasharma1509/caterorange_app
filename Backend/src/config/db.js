const dotenv = require('dotenv');
dotenv.config();
const { Client } = require('pg');
const logger = require('./logger');
const schema = require('../schema/table');


// Create a new client instance using environment variables
const config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
};

const client = new Client(config);
client.connect()
    .then(async () => {
        logger.info('Connected to the database successfully');
        // Create tables
        await client.query(schema.customerTable);
        await client.query(schema.createCategoryTable);
        await client.query(schema.addressTable);
        await client.query(schema.paymentTable);
        await client.query(schema.corporateCartTable);
        await client.query(schema.corporateOrdersTable);
        await client.query(schema.corporateOrderDetailsTable);

        logger.info('Tables created successfully or already exist');
    })
    .catch(err => logger.error('Failed to connect to the database', { error: err.stack }));

module.exports = client;