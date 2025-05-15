const Payment = require('../models/payment.model');
const Order = require('../models/order.model');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create a payment intent for an order
const createPaymentIntent = async (req, res) => {
    const { orderId } = req.body;
    
    try {
        const order = await Order.findById(orderId).populate('user');
        if (!order) return res.status(404).json({ message: 'Order not found' });
        if (order.paymentStatus === 'paid') {
            return res.status(400).json({ message: 'Order already paid' });
        }

        const idempotencyKey = order._id.toString() + Date.now();

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(order.total * 100),
            currency: 'usd',
            customer: order.user.stripeCustomerId,
            metadata: { 
                orderId: order._id.toString(),
                userId: order.user._id.toString() 
            },
            description: `Payment for Order #${order.orderNumber}`
        }, {
            idempotencyKey
        });

        const payment = new Payment({
            orderId: order._id,
            userId: order.user._id,
            total: order.total,
            currency: 'usd',
            status: 'pending',
            stripePaymentIntentId: paymentIntent.id,
            method: 'card',
        });

        await payment.save();
        
        await Order.findByIdAndUpdate(orderId, { 
            stripePaymentIntentId: paymentIntent.id 
        });

        res.status(201).json({ 
            clientSecret: paymentIntent.client_secret,
            paymentId: payment._id 
        });

    } catch (err) {
        if (err.type === 'StripeInvalidRequestError') {
            return res.status(400).json({ 
                message: 'Payment processing error',
                error: err.message 
            });
        }
        res.status(500).json({ 
            message: 'Server error', 
            error: err.message 
        });
    }
};

// Get payment by orderId
const getPaymentByOrder = async (req, res) => {
    const { orderId } = req.params;
    try {
        const payment = await Payment.findOne({ orderId });
        if (!payment) return res.status(404).json({ message: 'Payment not found' });
        res.json(payment);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Get all payments for a user
const getPaymentsByUser = async (req, res) => {
    const { userId } = req.params;
    try {
        const payments = await Payment.find({ userId });
        res.json(payments);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Stripe webhook handler (to be used in a route, e.g. /webhook)
const handleStripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.rawBody, 
            sig, 
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error(`Webhook signature verification failed`, err);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        switch (event.type) {
            case 'payment_intent.succeeded':
                const paymentIntent = event.data.object;
                
                await Payment.findOneAndUpdate(
                    { stripePaymentIntentId: paymentIntent.id },
                    { 
                        status: 'succeeded',
                        updatedAt: new Date() 
                    },
                    { session }
                );

                await Order.findByIdAndUpdate(
                    paymentIntent.metadata.orderId,
                    { 
                        paymentStatus: 'paid',
                        paidAt: new Date() 
                    },
                    { session }
                );
                break;

            case 'payment_intent.payment_failed':
                await Payment.findOneAndUpdate(
                    { stripePaymentIntentId: event.data.object.id },
                    { 
                        status: 'failed',
                        updatedAt: new Date() 
                    },
                    { session }
                );
                break;
        }

        await session.commitTransaction();
        res.json({ received: true });

    } catch (err) {
        await session.abortTransaction();
        console.error('Webhook processing failed:', err);
        res.status(500).json({ error: 'Webhook processing failed' });
    } finally {
        session.endSession();
    }
};



module.exports = {
    createPaymentIntent,
    getPaymentByOrder,
    getPaymentsByUser,
    handleStripeWebhook
};
