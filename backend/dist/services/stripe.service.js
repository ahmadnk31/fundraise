import Stripe from 'stripe';
if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is required');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-07-30.basil'
});
export class StripeService {
    /**
     * Create a payment intent for a donation
     */
    async createPaymentIntent(amount, currency = 'usd', metadata) {
        try {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(amount * 100), // Convert to cents
                currency,
                automatic_payment_methods: {
                    enabled: true,
                },
                metadata,
            });
            return paymentIntent;
        }
        catch (error) {
            console.error('Stripe payment intent creation error:', error);
            throw new Error('Failed to create payment intent');
        }
    }
    /**
     * Confirm a payment intent
     */
    async confirmPaymentIntent(paymentIntentId) {
        try {
            const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId);
            return paymentIntent;
        }
        catch (error) {
            console.error('Stripe payment intent confirmation error:', error);
            throw new Error('Failed to confirm payment intent');
        }
    }
    /**
     * Retrieve a payment intent
     */
    async getPaymentIntent(paymentIntentId) {
        try {
            const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
            return paymentIntent;
        }
        catch (error) {
            console.error('Stripe payment intent retrieval error:', error);
            throw new Error('Failed to retrieve payment intent');
        }
    }
    /**
     * Create a customer
     */
    async createCustomer(email, name) {
        try {
            const customer = await stripe.customers.create({
                email,
                name,
            });
            return customer;
        }
        catch (error) {
            console.error('Stripe customer creation error:', error);
            throw new Error('Failed to create customer');
        }
    }
    /**
     * Handle webhook events
     */
    constructEvent(payload, signature) {
        if (!process.env.STRIPE_WEBHOOK_SECRET) {
            throw new Error('STRIPE_WEBHOOK_SECRET is required');
        }
        try {
            return stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET);
        }
        catch (error) {
            console.error('Stripe webhook signature verification error:', error);
            throw new Error('Invalid webhook signature');
        }
    }
    /**
     * Process webhook event
     */
    async processWebhookEvent(event) {
        console.log('Processing Stripe webhook event:', event.type);
        switch (event.type) {
            case 'payment_intent.succeeded':
                const paymentIntent = event.data.object;
                console.log('Payment succeeded:', paymentIntent.id);
                // Handle successful payment
                return { success: true, paymentIntentId: paymentIntent.id };
            case 'payment_intent.payment_failed':
                const failedPayment = event.data.object;
                console.log('Payment failed:', failedPayment.id);
                // Handle failed payment
                return { success: false, paymentIntentId: failedPayment.id };
            default:
                console.log('Unhandled event type:', event.type);
                return { success: true, message: 'Event received but not handled' };
        }
    }
}
export const stripeService = new StripeService();
//# sourceMappingURL=stripe.service.js.map