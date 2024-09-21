const express = require('express');
const client = require('./config/dbConfig');
const cors=require('cors')     
const logger = require('./config/logger');
const { createTables } = require('./controller/tableController');
const { createDatabase } = require('./config/config');
require('dotenv').config();
const sha256 = require('sha256');
const axios = require('axios');
const uniqid = require('uniqid');
const crypto = require('crypto');
const { jwtDecode } =require('jwt-decode')
const jwt=require('jsonwebtoken')
const allRoutes = require('./routes/customerRoutes.js');
const adminRoutes = require('./routes/adminRoutes');
const paymentRoutes = require('./routes/paymentRoutes.js');
const addressRoutes = require('./routes/addressRoutes');
const eventRoutes = require('./routes/eventorderRoutes.js');
const corporateorderRoutes = require('./routes/corporateorderRoutes.js');
const categoryRoutes= require('./routes/categoryRoutes.js');
const customerRoutes= require('./routes/customerRoutes.js');


const app = express();
app.use(express.json());
const corsOptions = {
  origin: 'http://localhost:3000', // Update with your frontend origin
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));


app.use('/', adminRoutes);
app.use('/',addressRoutes)
app.use('/',paymentRoutes)
app.use('/',categoryRoutes);
app.use('/',customerRoutes)

app.use('/', corporateorderRoutes);

const initializeApp = async () => {
  try {
    await createDatabase();
    logger.info('Database created or already exists');

    await client.connect();
    logger.info('Connected to the Caterorange DB');

    await createTables();
    logger.info('Tables created successfully');

    app.use(express.json());

    app.listen(process.env.PORT, () => {
      logger.info(`Server is running on port ${process.env.PORT}`);
    });
  } catch (err) {
    logger.error('Initialization error:', err.message);
    process.exit(1);
  }
};
const PHONEPE_HOST_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox";
const MERCHANT_ID = "PGTESTPAYUAT86";
const SALT_KEY = "96434309-7796-489d-8924-ab56988a6076";
const SALT_INDEX = 1;

//Routes
//app.use('/p', paymentroutes);


//     const { userid, amount } = req.body;
//     //console.log("hello")
//     const amountinrupee = amount * 100
//     const payload = {
//       "merchantId": MERCHANT_ID,
//       "merchantTransactionId": merchantTransactionId,
//       "merchantUserId": userid,
//       "amount": amountinrupee,
//       "redirectUrl": `http://localhost:7000/redirect-url/${merchantTransactionId}`,
//       "redirectMode": "REDIRECT",
//       "callbackUrl": "https://webhook.site/callback-url",
//       "mobileNumber": "9999999999",
//       "paymentInstrument": {
//         "type": "PAY_PAGE"
//       }
//     };
  
//     const bufferObj = Buffer.from(JSON.stringify(payload), "utf8");
//     const base64EncodedPayload = bufferObj.toString("base64");
  
//     const xVerify = crypto
//       .createHash('sha256')
//       .update(base64EncodedPayload + payEndpoint + SALT_KEY)
//       .digest('hex') + "###" + SALT_INDEX;
  
//     const options = {
//       method: 'post',
//       url: PHONEPE_HOST_URL + payEndpoint,
//       headers: {
//         accept: 'application/json',
//         'Content-Type': 'application/json',
//         "X-VERIFY": xVerify
//       },
//       data: {
//         request: base64EncodedPayload
//       }
//     };
//     console.log("1")
//     axios
//       .request(options)
//       .then(function (response) {
//           console.log("2")
//         console.log(response.data);
//         const url = response.data.data.instrumentResponse.redirectInfo.url;
//         res.json({ redirectUrl: url }); 
//       })
//       .catch(function (error) {
//         console.error(error);
//         res.status(500).send(error.message);
//       });
//   });
  
app.post("/pay", async(req, res) => {
  const payEndpoint = "/pg/v1/pay";
  const merchantTransactionId = uniqid();
  const {amount,corporateorder_id } = req.body;
  console.log("hello")
  const token = req.headers["token"]
  const decode = jwt.decode(token);
  console.log(decode);
  const customer_id = decode.id;
  // console.log(token)
  // const response = await customerController.getuserbytoken({ body: { access_token: token } })
  // console.log(response)
  // const customer_id = response.customer_id
  // console.log(customer_id)
  const amountinrupee = amount * 100
  const payload = {
    "merchantId": MERCHANT_ID,
    "merchantTransactionId": merchantTransactionId,
    "merchantUserId": 123,
    "amount": amountinrupee,
    "redirectUrl": `http://localhost:4000/redirect-url/${merchantTransactionId}?customer_id=${customer_id}&corporateorder_id=${corporateorder_id}`,
    "redirectMode": "REDIRECT",
    "callbackUrl": "https://webhook.site/callback-url",
    "mobileNumber": "9999999999",
    "paymentInstrument": {
      "type": "PAY_PAGE"
    }
  };

  const bufferObj = Buffer.from(JSON.stringify(payload), "utf8");
  const base64EncodedPayload = bufferObj.toString("base64");

  const xVerify = crypto
    .createHash('sha256')
    .update(base64EncodedPayload + payEndpoint + SALT_KEY)
    .digest('hex') + "###" + SALT_INDEX;

  const options = {
    method: 'post',
    url: PHONEPE_HOST_URL + payEndpoint,
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
      "X-VERIFY": xVerify
    },
    data: {
      request: base64EncodedPayload
    }
  };
  console.log("1")
  axios
    .request(options)
    .then(function (response) {
        console.log("2")
      console.log(response.data);
      const url = response.data.data.instrumentResponse.redirectInfo.url;
      res.json({ redirectUrl: url }); 
    })
    .catch(function (error) {
      console.error(error);
      res.status(500).send(error.message);
    });
});

app.get('/redirect-url/:merchantTransactionId', async(req, res) => {
  const { merchantTransactionId } = req.params;
  const { customer_id, corporateorder_id  } = req.query;
  console.log(customer_id)
  console.log('The merchant Transaction id is', merchantTransactionId);
  if (merchantTransactionId) {
    const xVerify = sha256(`/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}` + SALT_KEY) + '###' + SALT_INDEX;
    const options = {
      method: 'get',
      url: `https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}`,
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        "X-MERCHANT-ID": MERCHANT_ID,
        "X-VERIFY": xVerify
      },
    };
    axios
      .request(options)
      .then(async function (response) {
        console.log(response.data);
        if (response.data.code === 'PAYMENT_SUCCESS') {
          const paymentData = response.data.data;
          const paymentInstrument = paymentData.paymentInstrument;
         
          const paymentPayload = {
            paymentType: paymentInstrument.type, // PaymentType
            merchantTransactionId: paymentData.merchantTransactionId, // MerchantReferenceId
            phonePeReferenceId: paymentData.transactionId, // PhonePeReferenceId
            paymentFrom: "PhonePe", // From
            instrument: paymentInstrument.cardType || 'N/A', // Instrument (CARD or other)
            bankReferenceNo: paymentInstrument.brn || 'N/A', // BankReferenceNo
            amount: paymentData.amount,
            customer_id,corporateorder_id// Amount
             // Replace this with the actual customer_id (from session or request)
          };

          // Make an Axios POST request to the new API for inserting the payment
          try {
            const response=await axios.post('http://localhost:4000/insert-payment', paymentPayload);
        res.status(200);
          } catch (error) {
            console.error("Error in sending payment data: ", error);
          }

          // Redirect to success page
          res.redirect('http://localhost:3000/success');
          // Redirect to the success page
        } else {
          res.redirect('http://localhost:3000/failure'); // Redirect to a failure page if needed
        }
      })
      .catch(function (error) {
        console.error(error);
        res.status(500).send(error.message);
      });
  } else {
    res.status(400).send({ error: 'Error' });
  }
});
initializeApp();
app.use('/', allRoutes);
app.use('/',eventRoutes);


