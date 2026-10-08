const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config(); // loads values from the .env file into process.env

const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

connectDB();

const app = express();

// CORS lets the React app (port 5173) call this API (port 5000). Browsers block it otherwise.
app.use(cors());
// This middleware reads JSON sent in the request body and puts it in req.body
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ success: true, message: 'DineEase API is running' });
});

// Route -> Controller -> Model -> MongoDB
app.use('/api/restaurants', require('./routes/restaurantRoutes'));
app.use('/api/tables', require('./routes/tableRoutes'));
app.use('/api/reservations', require('./routes/reservationRoutes'));
app.use('/api/stats', require('./routes/statsRoutes'));

// These two must come last
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
