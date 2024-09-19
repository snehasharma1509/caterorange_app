require('dotenv').config();
const logger = require('../config/logger');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const customer_model = require('../model/customer'); // Fixed import
const { body, validationResult } = require('express-validator');
const client = require('../config/db.js');

const SECRET_KEY = process.env.SECRET_KEY;

// Register function
const register = async (req, res) => {
    try {
        const { customer_name, customer_email , customer_password,  customer_phonenumber,confirm_password } = req.body;
        
        const minNameLength = 3;
        const maxNameLength = 50;
        const minPasswordLength = 8;
        const maxPasswordLength = 20;
        const maxEmailLength = 50;

        // Validate all required fields
        if (!customer_name || !customer_email  || !customer_password || !confirm_password) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        // Validate name format and length
        const nameRegex = /^[a-zA-Z\s]+$/;
        if (!nameRegex.test(customer_name) || customer_name.length < minNameLength || customer_name.length > maxNameLength) {
            return res.status(400).json({ success: false, message: `Name must be between ${minNameLength}-${maxNameLength} characters and contain only alphabets` });
        }

        // Validate email format and length
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(customer_email ) || customer_email .length > maxEmailLength) {
            return res.status(400).json({ success: false, message: 'Invalid email format or too long' });
        }

        // Check if email is already in use
        const existingUserByEmail = await customer_model.findCustomerEmail(customer_email );
        if (existingUserByEmail) {
            logger.error('Email already in use', { customer_email  });
            return res.status(400).json({ success: false, message: 'Email already in use' });
        }

        // Validate password length and complexity
        const passwordRegex =  /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%?&])[A-Za-z\d@$!%?&]{8,}$/;
        if (customer_password.length < minPasswordLength || customer_password.length > maxPasswordLength || !passwordRegex.test(customer_password)) {
            return res.status(400).json({ success: false, message: 'Password must be between 8-20 characters, and include uppercase, lowercase, number, and special character' });
        }

        // Check if passwords match
        if (customer_password !== confirm_password) {
            return res.status(400).json({ success: false, message: 'Passwords do not match' });
        }

        // Hash password before storing
        const hashedPassword = await bcrypt.hash(customer_password, 10);

        // Generate JWT token
        const token = jwt.sign({ email: customer_email  }, SECRET_KEY, { expiresIn: '24h' });

     
        const newCustomer = await customer_model.createCustomer(
            customer_name,
            customer_email ,
            hashedPassword,
            customer_phonenumber,
            token
        );

        logger.info('Customer registered successfully', { customer_email  });

        return res.json({
            success: true,
            message: 'Customer registered successfully',
            token,
            customer: newCustomer
        });
    } catch (err) {
        logger.error('Error during customer registration', { error: err.message });
        return res.status(500).json({ error: err.message });
    }
};
const login = [
    // Validate and sanitize input fields
    body('customer_email')
        .isEmail().withMessage('Please provide a valid email address.')
        .normalizeEmail(),
    body('customer_password')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.')
        .trim(),

    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { customer_email, customer_password } = req.body;

            // Fetch user data from the database
            const customer = await customer_model.findCustomerEmail(customer_email);

            if (!customer) {
                logger.warn('Invalid login attempt', { customer_email });
                return res.status(400).json({success:false, message: 'Invalid email or password' });
            }

            // Compare the password
            const isPasswordValid = await bcrypt.compare(customer_password, customer.customer_password);

            if (!isPasswordValid) {
                logger.warn('Invalid login attempt', { customer_email });
                return res.status(400).json({ success:false, message: 'Invalid email or password' });
            }

            // Verify the existing token or generate a new one
            let token;
            try {
                token = jwt.verify(customer.access_token, SECRET_KEY);
                var uat = customer.access_token;
                logger.info('Token verified successfully', { token });
            } catch (err) {
                uat = jwt.sign({ email: customer_email }, SECRET_KEY, { expiresIn: '24h' });
                await customer_model.updateAccessToken(customer_email, uat);
                logger.info('New token generated', { token: uat });
            }
            
            res.json({
                success: true,
                message: 'Login successful',
                token: uat
            });
        } catch (err) {
            logger.error('Error during user login', { error: err.message });
            res.status(500).json({ error: err.message });
        }
    }
];

const forgotPassword = [
    body('customer_email')
        .isEmail().withMessage('Please provide a valid email address.')
        .normalizeEmail(),
    body('customer_password')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.')
        .trim(),
    body('confirm_password')
        .custom((value, { req }) => {
            if (value !== req.body.customer_password) {
                throw new Error('Passwords do not match');
            }
            return true;
        }),

    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { customer_email, customer_password,confirm_password } = req.body;

            const existingUserByEmail = await customer_model.findCustomerEmail(customer_email);
            if (!existingUserByEmail) {
                logger.error('You are not registered yet, please register', { customer_email });
                return res.status(400).json({ success: false, message: 'Invalid email , check email once or register' });
            }
            
            // Hash the new password
            const hashedPassword = await bcrypt.hash(customer_password, 12);
            let token;
            try {
                token = jwt.verify(customer.access_token, SECRET_KEY);
                var uat = customer.access_token;
                logger.info('Token verified successfully', { token });
            } catch (err) {
                uat = jwt.sign({ email: customer_email }, SECRET_KEY, { expiresIn: '24h' });
                logger.info('New token generated', { token: uat });
            }

            
            const customer = await customer_model.updateCustomerPassword(customer_email, hashedPassword,uat);

            if (!customer) {
                logger.warn('Error updating password', { customer_email });
                return res.status(400).json({ message: 'Error updating password' });
            }

            res.json({
                success: true,
                message: 'Login successfully with new Password',
                token: uat

            });
        } catch (err) {
            logger.error('Error during password update', { error: err.message });
            res.status(500).json({ error: err.message });
        }
    }
];

const google_auth = async (req, res) => {
    try {
        const { customer_name, customer_email } = req.body;

        const existingCustomer = await customer_model.findCustomerEmail(customer_email);

        if (!existingCustomer) {
            // Register new customer
            const token = jwt.sign({ email: customer_email }, SECRET_KEY, { expiresIn: '24h' });
            const newCustomer = await customer_model.createCustomer(
                customer_name,
                customer_email,
                null,  // password
                null,  // phone number
                token
            );

            logger.info('Customer registered successfully through Google', { customer_email });

            return res.json({
                success: true,
                message: 'Customer registered successfully',
                token,
                customer: newCustomer
            });
        } else {
            // Login existing customer
            let token = existingCustomer.access_token;
            try {
                jwt.verify(token, SECRET_KEY);
            } catch (err) {
                // If token is invalid or expired, create a new one
                token = jwt.sign({ email: customer_email }, SECRET_KEY, { expiresIn: '24h' });
                await customer_model.updateAccessToken(customer_email, token);
                logger.info('Login successful through Google and token updated', { token });
            }

            return res.json({
                success: true,
                message: 'Login successful through Google',
                token,
                customer: existingCustomer
            });
        }
    } catch (err) {
        logger.error('Error during Google OAuth', { error: err.message });
        return res.status(500).json({ error: 'An error occurred during authentication' });
    }
};

const customer_info = async (req, res) => {
  // Extract token from Authorization header
  const token = req.headers['token'];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  try {
    // Verify and decode the token
    const decoded = jwt.verify(token,SECRET_KEY); // Your JWT secret
    // Extract user ID or other information from decoded token
    const customer_email = decoded.email; // Adjust based on your token payload

    // Fetch user data from the database
    const result = await client.query('SELECT customer_name, customer_phonenumber FROM customer WHERE customer_email = $1', [customer_email]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const { customer_name, customer_phonenumber } = result.rows[0];
    return res.json({ customer_name, customer_phonenumber, customer_email });
  } catch (error) {
    console.error('Error verifying token or fetching user info:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const GetCorporateCategory = async (req, res) => {
    try {
        const categories = await customer_model.getCorporateCategories();
        return res.json({
            success: true,
            categories
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
const add_Corporate_Cart = async (req,res) =>{
    try {
        const { cart_order_details,total_amount } = req.body;

        // Check for the token in the headers
        const token = req.headers['token'];

        // Verify the token and extract the user email
        let verified_data;
        try {
            verified_data = jwt.verify(token, SECRET_KEY);
        } catch (err) {
            logger.error('Token verification failed:', err.message);
            return res.status(401).json({ success: false, message: 'Invalid or expired token' });
        }

        const customer_email = verified_data.email;

        // Fetch the user ID from the database using the email
        const customer = await customer_model.findCustomerEmail(customer_email);
        if (!customer) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const customer_id = customer.customer_id;
        const newCart = await customer_model.add_cart(customer_id, cart_order_details, total_amount);

        if (!newCart) {
            throw new Error('cart creation failed');
        }


        // Log the blog creation
        logger.info('cart added successfully');
        // Respond with the newly created blog details
        res.json({
            success: true,
            message: 'cart created successfully ',
            blog: newCart
        });
    } catch (err) {
        logger.error('Error during cart creation', { error: err.message });
        res.status(500).json({ success: false, message: 'Error during cart creation', error: err.message });
    }
}

const getCorporateCart = async (req,res)=>{
    try{
    const token = req.headers['token'];
    let verified_data;
    try {
        verified_data = jwt.verify(token, SECRET_KEY);
    } catch (err) {
        logger.error('Token verification failed:', err.message);
        return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }

    const customer_email = verified_data.email;

    // Fetch the user ID from the database using the email
    const customer = await customer_model.findCustomerEmail(customer_email);
    if (!customer) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }

    const customer_id = customer.customer_id;
        const carts= await customer_model.getCarts( customer_id )
       
        return res.json(
            carts
        );
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
   
}

const getCustomerDetails= async(req, res)=>{
    try{
        const token = req.headers['token'];
        let verified_data;
        try {
            verified_data = jwt.verify(token, SECRET_KEY);
        } catch (err) {
            logger.error('Token verification failed:', err.message);
            return res.status(401).json({ success: false, message: 'Invalid or expired token' });
        }
    
        const customer_email = verified_data.email;
    
        // Fetch the user ID from the database using the email
        const customer = await customer_model.findCustomerEmail(customer_email);
        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }
    const data={
        Name:customer.customer_name,
        PhoneNumber: customer.customer_phonenumber,
        email:customer.customer_email,
        address:customer.customer_address,
        id:customer.customer_id
    }
       
            return res.json(
                data
            );
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
}

const updateCartItem= async(req,res) =>{
    try {
        const corporatecart_id=req.params.corporatecart_id;
        const {date,quantity}=req.body; 

        const result = await customer_model.updateQuantity(corporatecart_id,date,quantity);
        return res.json({
            success: true
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
const deleteCartItem = async (req, res) => {
    try {
      
      const corporatecart_id = req.params.corporatecart_id;
      const { date } = req.body;  // Destructure date from req.body
  
      if (!date) {
        return res.status(400).json({ error: 'Date is required' });
      }
  
      const result = await customer_model.deleteCart(corporatecart_id, date);
      console.log('Success in controller for delete data');
      return res.json({
        success: true
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  
  const addCorporateOrderDetails = async (req, res) => {
    const { corporateorder_id,  processing_date,delivery_status,category_id,quantity,active_quantity,media, delivery_details} = req.body;
  
    try {
     
     console.log('hi ',{corporateorder_id,  processing_date,delivery_status,category_id,quantity,active_quantity,media, delivery_details})
  
        // Insert into the database using the model
        const insertedDetail = await customer_model.insertCorporateOrderDetails(corporateorder_id, processing_date,delivery_status,category_id,quantity,active_quantity,media, delivery_details );
  
    res.status(201).json({
      success: true,
      message: 'Order details added successfully',
      data: insertedDetail
    });}
     catch (error) {
      console.error('Error adding order details:', error);
      res.status(500).json({ message: 'Server error', error });
    }
  }

  const getOrderDetails = async (req, res) => {
    // Extract order ID from request params

    try {
        const token = req.headers['token'];

        // Verify the token and extract the user email
        let verified_data;
        try {
            verified_data = jwt.verify(token, SECRET_KEY);
        } catch (err) {
            logger.error('Token verification failed:', err.message);
            return res.status(401).json({ success: false, message: 'Invalid or expired token' });
        }

        const customer_email = verified_data.email;

        // Fetch the user ID from the database using the email
        const customer = await customer_model.findCustomerEmail(customer_email);
        if (!customer) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const customer_id = customer.customer_id;
      const order = await customer_model.getOrderDetailsById(customer_id);
      

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      // Send back only corporateorder_generated_id and order_details
      res.status(200).json({
       
        data:order
      });
    } catch (error) {
      console.error('Error retrieving order details:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  const transferCartToOrder = async (req, res) => {
    const { order_details , customer_id , total_amount , payment_id , customer_address , payment_status , corporateorder_generated_id } = req.body;
    try {
      // Insert the cart data into event_orders
      const order = await customer_model.insertCartToOrder(order_details , customer_id , total_amount , payment_id , customer_address , payment_status , corporateorder_generated_id );
    
      return res.json({
        success: true,
        order
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  const getcategorynameById= async(req, res)=>{
     const { categoryId }= req.body;

     try{
        const categoryname= await customer_model.getcategoryname(categoryId);
        return res.json({
            success: true,
            categoryname
          });
        } catch (err) {
          res.status(500).json({ error: err.message });
        }
  }


module.exports = {
    register,
    login,
    forgotPassword,
    google_auth,
    customer_info,
    GetCorporateCategory,
    add_Corporate_Cart,
    getCorporateCart,
    getCustomerDetails,
    updateCartItem,
    deleteCartItem,
    addCorporateOrderDetails,
    getOrderDetails,
    transferCartToOrder,
    getcategorynameById
};
