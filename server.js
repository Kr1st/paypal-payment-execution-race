const express = require('express');
const rp = require('request-promise');
const bodyParser = require('body-parser')
const uuid = require('uuid/v1');
const config = require('config');

// Add your credentials:
// Add your client ID and secret
const CLIENT = config.get('paypal.client');
const SECRET =  config.get('paypal.secret');
const PAYPAL_API =  config.get('paypal.url');
const PAYPAL_ENV = config.get('paypal.env');
const REPEATS = 7;
const port = 3000;

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))
app.set('view engine', 'ejs');


app.get('/', function (req, res) {
  res.render('index', 
  { 
    env: PAYPAL_ENV
  });
});

// Set up the payment:
// 1. Set up a URL to handle requests from the PayPal button
app.post('/my-api/create-payment/', async function(req, res) {
    // 2. Call /v1/payments/payment to set up the payment
    const requestOptions = {
        method: 'POST',
        uri: `${PAYPAL_API}/v1/payments/payment`,
        auth:{
            user: CLIENT,
            pass: SECRET
        }, body: {
            intent: 'sale',
            payer:
            {
              payment_method: 'paypal'
            },
            transactions: [
            {
              amount:
              {
                total: '0.66',
                currency: 'USD'
              }
            }],
            redirect_urls:
            {
              return_url: 'https://www.mysite.com',
              cancel_url: 'https://www.mysite.com'
            }
          },
        json: true
    };

    try {
        const payment = await rp(requestOptions);
        res.json({
              id: payment.id
        });
    } catch (err) {
        console.error(err);
        return res.sendStatus(500);
    }
});


// Execute the payment:
// 1. Set up a URL to handle requests from the PayPal button.
app.post('/my-api/execute-payment/', async function(req, res) {
  // 2. Get the payment ID and the payer ID from the request body.
  const paymentID = req.body.paymentID;
  const payerID = req.body.payerID;

  const range =[...Array(REPEATS).keys()];
  try {
    // we create multiple requests
    const requests = range.map(async () => {
      const paypalRequestId = uuid();
      try {
        const requestOptions = {
          method: 'POST',
          uri: `${PAYPAL_API}/v1/payments/payment/${paymentID}/execute`,
          auth:{
              user: CLIENT,
              pass: SECRET
          },
          headers: {
            'PAYPAL-REQUEST-ID': paypalRequestId,
          },
          body: {
              payer_id: payerID,
            },
          json: true
        };
        await rp(requestOptions)
      } catch (err) {
        console.error(`Request with uuid: ${paypalRequestId} failed: `, err);
      }
    });
    // and await them  
    await Promise.all(requests);
    res.json({
      status: 'success'
    });
  } catch (err) {
      console.error(err);
  }
});
  
app.listen(port, function()
  {
    console.log('Server listening at http://localhost:3000/');
  });