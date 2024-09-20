'use strict';

const express = require('express');
const morgan = require('morgan'); // logging middleware
const cors = require('cors');

const { expressjwt: jwt } = require('express-jwt');

const jwtSecret = 'U05vrkhSW8K0sVScAEQYIhW7qzlHULM6P8nAiE3TxRquCtEjLZiHvta22bRnStoU';

// THIS IS FOR DEBUGGING ONLY: when you start the server, generate a valid token to do tests, and print it to the console
//This is used to create the token
//const jsonwebtoken = require('jsonwebtoken');
//const expireTime = 60; //seconds
//const token = jsonwebtoken.sign( { access: 'premium', authId: 1234 }, jwtSecret, {expiresIn: expireTime});
//console.log(token);

// init express
const app = express();
const port = 3002;

const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
};
app.use(cors(corsOptions));

// set-up the middlewares
app.use(morgan('dev'));
app.use(express.json()); // To automatically decode incoming json

// Check token validity
app.use(jwt({
  secret: jwtSecret,
  algorithms: ["HS256"],
  // token from HTTP Authorization: header
})
);


// To return a better object in case of errors
app.use(function (err, req, res, next) {
  console.log("DEBUG: error handling function executed");
  if (err.name === 'UnauthorizedError') {
    // Example of err content:  {"code":"invalid_token","status":401,"name":"UnauthorizedError","inner":{"name":"TokenExpiredError","message":"jwt expired","expiredAt":"2024-05-23T19:23:58.000Z"}}
    res.status(401).json({ errors: [{ 'param': 'Server', 'msg': 'Authorization error', 'path': err.code }] });
  } else {
    next();
  }
});

// POST /api/discount
app.post('/api/discount', (req, res) => {
  const isLoyal = req.auth.isLoyal;
  const rowNumbers = req.body.rowNumbers; // Array of row numbers

  // Validate input
  if (typeof isLoyal !== 'number' || !Array.isArray(rowNumbers)) {
    return res.status(400).json({ error: 'Invalid input data' });
  }

  // Calculate the sum of row numbers
  const sumOfRowNumbers = rowNumbers.reduce((acc, curr) => acc + curr, 0);

  let discount;

  // Calculate the discount based on the loyalty status
  if (isLoyal === 1) {
    // Loyal customers do not divide by 3
    discount = sumOfRowNumbers;
  } else if (isLoyal === 0) {
    // Non-loyal customers divide by 3
    discount = sumOfRowNumbers / 3;
  } else {
    return res.status(400).json({ error: 'Invalid value for isLoyal. It must be 0 or 1.' });
  }

  // Add a random number between 5 and 20
  const randomFactor = Math.random() * 15 + 5;
  discount += randomFactor;

  // Round the discount and clip it between 5% and 50%
  discount = Math.round(discount);
  if (discount < 5) discount = 5;
  if (discount > 50) discount = 50;

  // Send the discount back as a JSON response
  res.json({ discount });
});/*** Other express-related instructions ***/

// Activate the server
app.listen(port, () => {
  console.log(`qa-server listening at http://localhost:${port}`);
});