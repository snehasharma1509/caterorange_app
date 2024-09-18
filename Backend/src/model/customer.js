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
const add_cart = async (customer_id, cart_order_details, total_amount) =>{
    try{
       const result = await client.query(
    DB_COMMANDS.ADD_CORPORATECART,[customer_id, cart_order_details, total_amount ])
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
const updateQuantity=async(corporatecart_id,date,quantity) =>{
    try {
        logger.info('adding update quantity.',{corporatecart_id,date,quantity});
        const data=await client.query(DB_COMMANDS.GETPRICE,[corporatecart_id,date])
        console.log('price',data.rows[0])
        const price=data.rows[0].price
        const total=data.rows[0].total_amount
        const quant=data.rows[0].quantity
        const balance_amount=total-(price*quant)
        const total_amount=(price*quantity)+balance_amount
        console.log('amount',total_amount)
        const res = await client.query(DB_COMMANDS.UPDATEQUANTITY,[corporatecart_id,date,quantity,total_amount]);
        console.log('in updatequary',res)
       

        return res;
    } catch (err) {
        logger.error('Error fetching carts:', err);
        throw new Error('Error fetching carts from the database');
    }
}
const deleteCart = async (corporatecart_id, date) => {
    try {
        logger.info('Delete quantity.', { corporatecart_id, date });

        // Step 1: Get the price and quantity for the item to be removed
        const data = await client.query(DB_COMMANDS.GETPRICE, [corporatecart_id, date]);
        if (data.rows.length === 0) {
            throw new Error('Item not found in cart');
        }

        const { price, quantity, total_amount } = data.rows[0];
        const amount = price * quantity;
        console.log(amount)
        const new_total_amount = total_amount - amount;
        console.log(new_total_amount)

        // Step 2: Update cart_order_details and total_amount
        await client.query(DB_COMMANDS.DELETECARTITEM, [corporatecart_id, date, new_total_amount]);

        // Step 3: Check if cart_order_details is empty after the update and delete if necessary
        const result = await client.query(DB_COMMANDS.DELETECARTROW, [corporatecart_id]);

        console.log('DELETE SUCCESS', result);

        return result;
    } catch (err) {
        logger.error('Error deleting from cart:', err);
        throw new Error('Error deleting from the database');
    }
};

const insertCorporateOrderDetails = async (corporateorder_id, details) => {
    const query = `
      INSERT INTO corporateorder_details 
      (corporateorder_id, processing_date, delivery_status, category_id, quantity, active_quantity, media, delivery_details)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;
    
    const values = [
      corporateorder_id,
      details.processing_date,
      details.delivery_status,
      details.category_id,
      details.quantity,
      details.active_quantity,
      details.media ? JSON.stringify(details.media) : null,
      JSON.stringify(details.delivery_details)
    ];
  
    const result = await client.query(query, values);
    return result.rows[0];
  };


   // Function to get order_details and corporateorder_generated_id
   const getOrderDetailsById = async (customer_id) => {
    const query = `
      SELECT corporateorder_generated_id, order_details 
      FROM corporate_orders 
      WHERE customer_id = $1
    `;
    
    const values = [customer_id];
    
    try {
      const result = await client.query(query, values);
      return result.rows[0]; // Return the first matching row
    } catch (error) {
      throw new Error('Error retrieving corporate order details: ' + error.message);
    }
  }

  const insertCartToOrder= async(order_details , customer_id , total_amount , payment_id , customer_address , payment_status , corporateorder_generated_id)=>{
    try {
        logger.info('in model', corporateorder_generated_id)
        const result = await client.query(
            DB_COMMANDS.INSERT_CART_TO_ORDER,
            [order_details , customer_id , total_amount , payment_id , customer_address , payment_status , corporateorder_generated_id]
        );
        
        logger.info('Cart Data added to orders table in model',result);
        return result.rows[0]; // Return true if any row was updated
    } catch (err) {
        logger.error('Error transfering cart to orders in model', { error: err.message});
        throw err;
    }
  }

module.exports = {
    createCustomer,
    findCustomerEmail,
    updateCustomerPassword,
    updateAccessToken,
    getCorporateCategories,
    add_cart,
    getCarts,
    findCustomerToken,
    updateQuantity,
    deleteCart,
    getOrderDetailsById,
    insertCorporateOrderDetails,
    insertCartToOrder
};
