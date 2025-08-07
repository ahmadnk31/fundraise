import Stripe from 'stripe';
export declare class StripeService {
    /**
     * Create a payment intent for a donation
     */
    createPaymentIntent(amount: number, currency?: string, metadata?: Record<string, string>): Promise<Stripe.Response<Stripe.PaymentIntent>>;
    /**
     * Confirm a payment intent
     */
    confirmPaymentIntent(paymentIntentId: string): Promise<Stripe.Response<Stripe.PaymentIntent>>;
    /**
     * Retrieve a payment intent
     */
    getPaymentIntent(paymentIntentId: string): Promise<Stripe.Response<Stripe.PaymentIntent>>;
    /**
     * Create a customer
     */
    createCustomer(email: string, name?: string): Promise<Stripe.Response<Stripe.Customer>>;
    /**
     * Handle webhook events
     */
    constructEvent(payload: string | Buffer, signature: string): Stripe.Event;
    /**
     * Process webhook event
     */
    processWebhookEvent(event: Stripe.Event): Promise<{
        success: boolean;
        paymentIntentId: string;
        message: string;
    } | {
        success: boolean;
        message: string;
        paymentIntentId?: undefined;
    }>;
}
export declare const stripeService: StripeService;
