const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { check, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');

// Create an instance of express app
const app = express();

// Use bodyParser middleware to parse incoming request bodies
app.use(bodyParser.json());

// Use helmet middleware to add security headers
app.use(helmet());

// Use cors middleware to allow cross-origin requests
app.use(cors());

// Define a sample array of data to work with
let data = [  { id: 1, name: 'John Doe', age: 25 },  { id: 2, name: 'Jane Smith', age: 30 },];

// Define a sample array of users to work with
let users = [  { id: 1, username: 'user1', password: 'p' },  { id: 2, username: 'user2', password: 'password2' },];

// Define a JWT secret key
const secretKey = 'mysecretkey';

// Define an authentication middleware to verify JWT tokens
const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Authentication fai.' });
  }
};

// Define input validation rules using express-validator
const validationRules = [  check('name').not().isEmpty(),  check('age').not().isEmpty().isNumeric(),];

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

// GET method - Retrieve all data
app.get('/api/data', authenticate, (req, res) => {
  res.json(data);
});

// GET method - Retrieve a specific item
app.get('/api/data/:id', authenticate, (req, res) => {
  const id = parseInt(req.params.id);
  const item = data.find((item) => item.id === id);

  if (item) {
    res.json(item);
  } else {
    res.sendStatus(404);
  }
});

// POST method - Create a new item
app.post('/api/data', authenticate, validationRules, (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const item = req.body;
  item.id = data.length + 1;
  data.push(item);
  res.json(item);
});

// PUT method - Update an existing item
app.put('/api/data/:id', authenticate, validationRules, (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const id = parseInt(req.params.id);
  const itemIndex = data.findIndex((item) => item.id === id);

  if (itemIndex !== -1) {
    data[itemIndex] = req.body;
    data[itemIndex].id = id;
    res.json(data[itemIndex]);
  } else {
    res.sendStatus(404);
  }
});

// DELETE method - Delete an existing item
app.delete('/api/data/:id', authenticate, (req, res) => {
    const id = parseInt(req.params.id);
    const itemIndex = data.findIndex((item) => item.id === id);
    
    if (itemIndex !== -1) {
    data.splice(itemIndex, 1);
    res.sendStatus(204);
    } else {
    res.sendStatus(404);
    }
    });
    
    // POST method - Authenticate user and generate JWT token
    app.post('/api/authenticate', limiter, (req, res) => {
    const { username, password } = req.body;
    const user = users.find((user) => user.username === username);
    
    if (!user) {
    return res.status(401).json({ message: 'no user' });
    }
    pass=bcrypt.hashSync(user.password,2)
    passw=bcrypt.hashSync(password,2)
    if (!bcrypt.compareSync(password, pass)) {
    return res.status(401).json({ message: 'Authentication password' });
    }
    
    const token = jwt.sign({ id: user.id, username: user.username }, secretKey, {
    expiresIn: '1h',
    });
    
    res.json({ token });
    });
    
    // Error handling middleware
    app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong.' });
    });
    
    // Start the server
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
    console.log("Server started on port ",port);
    });
