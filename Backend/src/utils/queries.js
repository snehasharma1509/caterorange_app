const DB_COMMANDS = {
    CUSTOMER_INSERT: `
        INSERT INTO customer 
        (customer_name, customer_email, customer_password, customer_phonenumber, access_token) 
        VALUES ($1, $2, $3, $4, $5) 
        RETURNING *`,  
    CUSTOMER_EMAIL_SELECT: `
        SELECT * FROM customer 
        WHERE customer_email = $1`,
    CUSTOMER_SET_PASSWORD:`UPDATE customer 
        SET customer_password = $2, access_token = $3
        WHERE customer_email = $1`,
    CUSTOMER_SET_ACCESSTOKEN: `UPDATE customer 
        SET access_token = $2
        WHERE customer_email = $1`,
    GETCORPORATECATEGORY : 
        `select * from category`,
    ADDADDRESS: `
       UPDATE customer 
        SET customer_address = $1
        WHERE customer_id = $2 
    `,
    ADD_CORPORATECART:`
        INSERT INTO corporate_cart  (customer_id, cart_order_details,total_amount) 
        VALUES ($1, $2, $3) 
        RETURNING *
    `,
    GETCARTS:`
        SELECT * FROM corporate_cart WHERE customer_id = $1
    `,
    CUSTOMER_TOKEN_SELECT: `
    SELECT * FROM customer 
    WHERE access_token = $1`,
//     GETPRICE: `
//     SELECT (jsonb_element->>'price')::numeric AS price
//     FROM corporate_cart,
//          jsonb_array_elements(cart_order_details::jsonb) AS jsonb_element
//     WHERE corporatecart_id = $1
//       AND jsonb_element->>'date' = $2;
//   `,
GETPRICE: `
SELECT 
  jsonb_element->>'price' AS price,
  jsonb_element->>'quantity' AS quantity,
  total_amount
FROM corporate_cart,
     jsonb_array_elements(cart_order_details::jsonb) AS jsonb_element
WHERE corporatecart_id = $1
  AND jsonb_element->>'date' = $2;
`
,
  UPDATEQUANTITY: `
  UPDATE corporate_cart
  SET total_amount = $4,
      cart_order_details = (
        SELECT jsonb_agg(
          CASE
            WHEN jsonb_element->>'date' = $2 THEN
              jsonb_set(jsonb_element, '{quantity}', to_jsonb($3::text), false)
            ELSE
              jsonb_element
          END
        )
        FROM jsonb_array_elements(cart_order_details::jsonb) AS jsonb_element
      )
  WHERE corporatecart_id = $1;
`,
DELETECARTITEM:`
UPDATE corporate_cart
SET total_amount=$3,cart_order_details = (
    SELECT jsonb_agg(item) 
    FROM jsonb_array_elements(cart_order_details::jsonb) AS item
    WHERE (item->>'date')::text != $2
)
WHERE corporatecart_id = $1;

`,
DELETECARTROW:`
            DELETE FROM corporate_cart
            WHERE corporatecart_id = $1
              AND (cart_order_details IS NULL OR jsonb_array_length(cart_order_details::jsonb) = 0);
        `,
INSERT_CART_TO_ORDER:` INSERT INTO corporate_orders
        ( order_details ,customer_id , total_amount , payment_id , customer_address , payment_status , corporateorder_generated_id) 
        VALUES ($1, $2, $3, $4, $5, $6 ,$7) 
        RETURNING *`,
  GET_CATEGORY_NAME: `
      SELECT category_name FROM category WHERE category_id= $1
  `

};


module.exports = { DB_COMMANDS };