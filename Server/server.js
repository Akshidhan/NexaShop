const express = require('express')
const mongoose = require('mongoose')
const app = express()
const cors = require('cors');
const dotenv = require('dotenv')
const connectDB = require('./config/dbConn')
const cookieParser = require('cookie-parser')

dotenv.config()

const PORT = process.env.PORT || 3000

connectDB()

// Special route for Stripe webhooks needs raw body
app.use('/payments/webhook', express.raw({ type: 'application/json' }));

// Standard middleware for other routes
app.use(express.json())
app.use(cookieParser())

app.use(cors({
    origin: [
      process.env.CLIENT_URL,
      'https://incandescent-haupia-6edb58.netlify.app',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
}));


//routes
app.use('/', require('./routes/root'));
app.use('/auth', require('./routes/authRouter'))
app.use('/products', require('./routes/productRoutes'));
app.use('/users', require('./routes/userRoutes'))
app.use('/cart', require('./routes/cartRoutes'))
app.use('/category', require('./routes/categoryRouter'))
app.use('/reviews', require('./routes/reviewRoutes'));
app.use('/payments', require('./routes/paymentRoutes'));
app.use('/orders', require('./routes/orderRoutes'));
app.use('/count', require('./routes/countRoutes'));

mongoose.connection.once('open', () => {
  console.log('MongoDB connection established');
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
