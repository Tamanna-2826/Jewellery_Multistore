
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
console.log({
    stripe,
    key: process.env.STRIPE_SECRET_KEY,
    host: process.env.PG_HOST
});
module.exports = stripe;
