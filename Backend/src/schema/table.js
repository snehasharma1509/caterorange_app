module.exports = {
    customerTable: `
        CREATE TABLE IF NOT EXISTS customer (
            customer_id SERIAL PRIMARY KEY,
            customer_name VARCHAR(600) NOT NULL,  -- Adjusted length
            customer_email VARCHAR(600) NOT NULL UNIQUE,  -- Adjusted length
            customer_password VARCHAR(600) NOT NULL,  -- Use TEXT for passwords and hash them
            customer_phonenumber BIGINT,  -- Adjusted to VARCHAR for international numbers
            customer_address JSON,
            createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            lastLoginAt TIMESTAMP WITH TIME ZONE,
            access_token TEXT,
            wallet_amount INTEGER DEFAULT 0,
            group_id INTEGER  -- Add foreign key constraint if needed
        )
    `,
    createCategoryTable: `
          CREATE TABLE IF NOT EXISTS category (
            category_id SERIAL PRIMARY KEY,
            category_name VARCHAR(255) NOT NULL,
            category_description text,
            category_price integer NOT NULL,
            category_media TEXT
          );`,
        addressTable:`
          CREATE TABLE IF NOT EXISTS addresses (
      address_id SERIAL PRIMARY KEY,
      tag VARCHAR(50),
      line1 VARCHAR(255) NOT NULL,
      line2 VARCHAR(255),
      pincode INTEGER,
      group_id INTEGER,
      location POINT
    );
        `,
    corporateCartTable:`
     CREATE TABLE IF NOT EXISTS corporate_cart (
      corporatecart_id SERIAL PRIMARY KEY,
      customer_id INTEGER,
      category_id INTEGER,
      processing_date DATE,
      quantity INTEGER,
      FOREIGN KEY (customer_id) REFERENCES customer(customer_id),
      FOREIGN KEY (category_id) REFERENCES category(category_id)
    );
    `,
    corporateOrderDetailsTable:`
    CREATE TABLE IF NOT EXISTS corporateorder_details (
      details_id SERIAL PRIMARY KEY,
      processing_date DATE UNIQUE,
      status VARCHAR(50),
      category_id INTEGER,
      quantity INTEGER,
      FOREIGN KEY (category_id) REFERENCES category(category_id)
    );
  `
};
