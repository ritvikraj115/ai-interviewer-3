const express = require('express');
const connectDB = require('./database');
const User = require('./userSchema');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import the CORS middleware

const app = express();

// Middleware to parse JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use(cors({
  origin: 'https://ai-interviewer-3.vercel.app', // The exact frontend URL
  methods: ['GET', 'POST', 'PUT', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // If you're handling cookies or sessions
}));

// Enable pre-flight requests for all routes
app.options('*', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://ai-interviewer-3.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(204); // No content for preflight requests
});

app.use(bodyParser.json());
app.use(require('./router/auth'))

// Connect to MongoDB
connectDB();

// Route to create a new user

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
