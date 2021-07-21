const express = require('express');
const dotenv = require('dotenv');
dotenv.config({ path: './config/.env' });

const cosRoute = require('./routes/cosRoute');

// Initialise Express
const app = express();
app.use(express.json());

// Routes
app.use('/api/cos/', cosRoute);

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
