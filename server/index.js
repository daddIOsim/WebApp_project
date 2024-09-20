'use strict';

const express = require('express');
const morgan = require('morgan'); // logging middleware
const cors = require('cors');

const passport = require('passport'); // auth middleware


const jsonwebtoken = require('jsonwebtoken');

const jwtSecret = 'U05vrkhSW8K0sVScAEQYIhW7qzlHULM6P8nAiE3TxRquCtEjLZiHvta22bRnStoU';
const expireTime = 60; //seconds

//const LocalStrategy = require('passport-local').Strategy; // username and password for login
const LocalStrategy = require('passport-local'); // username and password for login
const session = require('express-session'); // enable sessions
const { check, validationResult } = require('express-validator'); // for validation

const dbDAO = require('./db_dao'); // module for accessing the DB.  NB: use ./ syntax for files in the same dir
const userDao = require('./dao-user'); // module for accessing the user info in the DB


// init express
const app = express();
const port = 3001;

const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
};
app.use(cors(corsOptions));

// set-up the middlewares
app.use(morgan('dev'));
app.use(express.json()); // To automatically decode incoming json

/*** Set up Passport ***/
// set up the "username and password" login strategy
// by setting a function to verify username and password
passport.use(new LocalStrategy(
  function (username, password, done) {
    userDao.getUser(username, password).then((user) => {
      if (!user)
        return done(null, false, { message: 'Incorrect username or password.' });

      return done(null, user);
    })
  }
));

// serialize and de-serialize the user (user object <-> session)
// we serialize only the user id and store it in the session
passport.serializeUser((user, done) => {
  done(null, user.user_id);
});

// starting from the data in the session, we extract the current (logged-in) user
passport.deserializeUser((id, done) => {
  userDao.getUserById(id)
    .then(user => {
      done(null, user);
    })
    .catch(err => {
      done(err, null);
    });
});




// custom middleware: check if a given request is coming from an authenticated user
const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated())
    return next();

  return res.status(401).json({ error: 'Not authenticated' });
}

// set up the session
app.use(session({
  // by default, Passport uses a MemoryStore to keep track of the sessions
  secret: '6xvL4xkAAbG49hcXf5GIYSvkDICiUAR6EdR5dLdwW7hMzUjjMUe9t6M5kSAYxsvX',   // change this random string, should be a secret value
  resave: false,
  saveUninitialized: false
}));

// then, init passport
app.use(passport.initialize());
app.use(passport.session());



/*** Users APIs ***/

// POST /sessions 
// login
app.post('/api/sessions', function (req, res, next) {
  passport.authenticate('local', (err, user, info) => {
    if (err)
      return next(err);
    if (!user) {
      // display wrong login messages
      return res.status(401).json(info);
    }
    // success, perform the login
    req.login(user, (err) => {
      if (err)
        return next(err);

      // req.user contains the authenticated user, we send all the user info back
      // this is coming from userDao.getUser()
      return res.json(req.user);
    });
  })(req, res, next);
});


app.delete('/api/sessions/current', (req, res) => {
  req.logout(() => { res.end(); });
});

// GET /sessions/current
// check whether the user is logged in or not
app.get('/api/sessions/current', (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).json(req.user);
  }
  else
    res.status(401).json({ error: 'Unauthenticated user!' });;
});




// APIs

app.get('/api/concerts', (req, res) => {
  dbDAO.listConcerts()
    .then(concerts => res.json(concerts))
    .catch(() => res.status(500).end());
});

app.get('/api/concerts/:id', [
  check('id').isInt().withMessage('Concert ID must be an integer'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const result = await dbDAO.getConcertById(req.params.id);
    if (result.error)
      res.status(404).json();
    else
      res.json(result);
  } catch (err) {
    res.status(500).end();
  }
});

app.get('/api/concerts/:id/seats', [
  check('id').isInt().withMessage('Concert ID must be an integer'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const result = await dbDAO.getSeatsFromConcert(req.params.id);
    if (result.error)
      res.status(404).json();
    else
      res.json(result);
  } catch (err) {
    res.status(500).end();
  }
});

app.delete('/api/reservations/:id',
  isLoggedIn,
  [
    check('id').isInt().withMessage('Reservation ID must be an integer'),
    check('user_id').isInt().withMessage('User ID must be an integer')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const reservationId = req.params.id;
    const userId = req.body.user_id;


    try {
      if (!reservationId || !userId) {
        throw new Error('Missing reservationId or userId');
      }

      await dbDAO.deleteReservationById(reservationId, userId);
      res.status(204).end();
    } catch (err) {
      console.error("Error deleting reservation:", err.message || err);

      if (err.message && err.message.includes("No reservation found")) {
        res.status(404).json({ error: "Reservation not found or not authorized" });
      } else {
        res.status(500).json({ error: "An error occurred while deleting the reservation" });
      }
    }
  });

app.get('/api/user/:id/reservations', isLoggedIn, [
  check('id').isInt().withMessage('User ID must be an integer'),
], async (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const requestedId = parseInt(req.params.id);
  const userId = req.user.user_id; // The ID of the authenticated user

  if (requestedId !== userId) {
    return res.status(403).json({ error: 'Unauthorized: You can only view your own reservations.' });
  }



  try {
    const result = await dbDAO.getReservationsWithSeatsAndConcertInfo(req.params.id);
    if (result.error)
      res.status(404).json();
    else
      res.json(result);
  } catch (err) {
    res.status(500).end();
  }
});

app.post('/api/concerts/:id/book', isLoggedIn, [
  check('id').isInt().withMessage('Concert ID must be an integer'),
  check('userId').isInt().withMessage('User ID must be an integer'),
  check('seatIds').isArray().withMessage('Seat IDs must be an array'),
  check('seatIds.*').isInt().withMessage('Each seat ID must be an integer')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const concertId = req.params.id;
    const userId = req.body.userId;
    const seatIds = req.body.seatIds; // Array of seat IDs to book

    if (!userId || !seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
      return res.status(400).json({ error: 'Invalid input data' });
    }

    // Check if the user already has a reservation for this concert
    const hasReservation = await dbDAO.checkUserReservation(userId, concertId);
    if (hasReservation) {
      return res.status(403).json({ error: 'User already has a reservation for this concert' });
    }

    // Check if the seats are available
    const unavailableSeats = await dbDAO.getOccupiedSeats(concertId, seatIds);

    if (unavailableSeats.length > 0) {
      return res.status(409).json({
        error: 'Some seats are already occupied',
        occupiedSeats: unavailableSeats
      });
    }

    // Attempt to book the seats
    const result = await dbDAO.bookSeats(userId, concertId, seatIds);

    if (result.success) {
      res.status(200).json({ reservationId: result.reservationId, message: 'Seats booked successfully' });
    } else {
      res.status(400).json({ error: 'Failed to book seats' });
    }
  } catch (err) {
    console.error('Error booking seats:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.post('/api/concerts/:id/book-random', isLoggedIn, [
  check('id').isInt().withMessage('Concert ID must be an integer'),
  check('userId').isInt().withMessage('User ID must be an integer'),
  check('numSeats').isInt({ min: 1 }).withMessage('Number of seats must be a positive integer'),
], async (req, res) => {
  // Handle validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const concertId = req.params.id;
    const { userId, numSeats } = req.body;

    // Check if the user already has a reservation for this concert
    const hasReservation = await dbDAO.checkUserReservation(userId, concertId);
    if (hasReservation) {
      return res.status(403).json({ error: 'User already has a reservation for this concert' });
    }

    // Fetch all available seats for the concert
    const availableSeats = await dbDAO.getAvailableSeatsForConcert(concertId);
    if (!availableSeats) {
      throw new Error('Failed to fetch available seats.');
    }

    if (availableSeats.length < numSeats) {
      return res.status(402).json({ error: 'Not enough available seats to book the requested number.' });
    }

    // Randomly select the required number of seats
    const selectedSeats = [];
    for (let i = 0; i < numSeats; i++) {
      const randomIndex = Math.floor(Math.random() * availableSeats.length);
      selectedSeats.push(availableSeats.splice(randomIndex, 1)[0]);
    }

    const seatIds = selectedSeats.map(seat => seat.seat_id);

    // Attempt to book the seats
    const result = await dbDAO.bookSeats(userId, concertId, seatIds);
    if (!result.success) {
      throw new Error('Failed to book seats.');
    }

    res.status(200).json({ message: 'Seats booked successfully', bookedSeats: selectedSeats });
  } catch (err) {
    console.error('Error in /api/concerts/:id/book-random:', err.message || err);
    res.status(500).json({ error: 'Internal server error' });
  }
});




/*** Token ***/

// GET /api/auth-token
app.get('/api/auth-token', isLoggedIn, (req, res) => {
  let isLoyal = req.user.IsLoyal;
  let user_id = req.user.user_id;

  const payloadToSign = {
    isLoyal: isLoyal,
    authId: user_id
  };

  const jwtToken = jsonwebtoken.sign(payloadToSign, jwtSecret, { expiresIn: expireTime });

  res.json({ token: jwtToken, isLoyal: isLoyal });
});




// Activate the server
app.listen(port, () => {
  console.log(`server listening at http://localhost:${port}`);
});


