import React, { useState, useEffect } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Checkbox } from './ui/checkbox';
import { 
  Heart, 
  CreditCard, 
  User, 
  Mail, 
  Phone, 
  Lock,
  Star,
  Gift,
  Users,
  X
} from 'lucide-react';
import { Campaign } from '../types';
import ApiService from '../services/api.service';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/use-toast';
import StripeCheckoutForm from './StripeCheckoutForm';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

interface DonateFormProps {
  campaign: Campaign;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface DonationFormData {
  amount: string;
  donorName: string;
  donorEmail: string;
  donorPhone?: string;
  message?: string;
  isAnonymous: boolean;
  coverFees: boolean;
}

export const DonateForm: React.FC<DonateFormProps> = ({
  campaign,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Amount, 2: Details, 3: Payment
  const [clientSecret, setClientSecret] = useState<string>('');
  const [paymentIntentId, setPaymentIntentId] = useState<string>('');

  const [formData, setFormData] = useState<DonationFormData>({
    amount: '',
    donorName: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : '',
    donorEmail: user?.email || '',
    donorPhone: '',
    message: '',
    isAnonymous: false,
    coverFees: true,
  });

  // Calculate processing fee (2.9% + $0.30)
  const amount = parseFloat(formData.amount) || 0;
  const processingFee = formData.coverFees ? Math.round((amount * 0.029 + 0.30) * 100) / 100 : 0;
  const totalAmount = amount + processingFee;

  // Predefined amounts
  const predefinedAmounts = [25, 50, 100, 200, 500];

  const handleInputChange = (field: keyof DonationFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAmountSelect = (amount: number) => {
    setFormData(prev => ({ ...prev, amount: amount.toString() }));
  };

  const validateStep1 = () => {
    return amount > 0 && amount <= 10000;
  };

  const validateStep2 = () => {
    return formData.donorName.trim() && formData.donorEmail.trim();
  };

  const createPaymentIntent = async () => {
    if (!validateStep2()) return;

    try {
      setLoading(true);
      const response = await ApiService.createPaymentIntent({
        campaignId: campaign.id,
        amount: totalAmount,
        donorName: formData.donorName,
        donorEmail: formData.donorEmail,
      });

      if (response.success && response.data) {
        setClientSecret(response.data.clientSecret);
        setPaymentIntentId(response.data.paymentIntentId);
        setStep(3);
      } else {
        throw new Error('Failed to create payment intent');
      }
    } catch (error) {
      console.error('Payment intent error:', error);
      toast({
        title: "Error",
        description: "Failed to initialize payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async () => {
    try {
      setLoading(true);

      const donationData = {
        campaignId: campaign.id,
        amount: amount,
        donorName: formData.isAnonymous ? 'Anonymous' : formData.donorName,
        donorEmail: formData.donorEmail,
        donorPhone: formData.donorPhone,
        message: formData.message,
        isAnonymous: formData.isAnonymous,
        paymentIntentId: paymentIntentId,
      };

      const response = await ApiService.createDonation(donationData);

      if (response.success) {
        toast({
          title: "Thank you for your donation!",
          description: `Your donation of $${amount.toFixed(2)} has been processed successfully.`,
        });

        onSuccess();
        onClose();
      } else {
        throw new Error('Failed to create donation record');
      }
    } catch (error) {
      console.error('Donation creation error:', error);
      toast({
        title: "Error",
        description: "Payment succeeded but failed to record donation. Please contact support.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const stripeOptions: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#3b82f6',
      },
    },
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                <Heart className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Support this campaign</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{campaign.title}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="px-6 py-4 border-b">
          <div className="flex items-center justify-between text-sm">
            <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                step >= 1 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'
              }`}>
                1
              </div>
              <span className="ml-2">Amount</span>
            </div>
            <div className={`h-1 flex-1 mx-4 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`} />
            <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                step >= 2 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'
              }`}>
                2
              </div>
              <span className="ml-2">Details</span>
            </div>
            <div className={`h-1 flex-1 mx-4 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-300'}`} />
            <div className={`flex items-center ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                step >= 3 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'
              }`}>
                3
              </div>
              <span className="ml-2">Payment</span>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto">
          {step === 1 && (
            <div className="p-6 space-y-6">
              <div>
                <Label htmlFor="amount">Donation Amount</Label>
                <div className="mt-2 space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    {predefinedAmounts.map((amount) => (
                      <Button
                        key={amount}
                        type="button"
                        variant={formData.amount === amount.toString() ? "default" : "outline"}
                        onClick={() => handleAmountSelect(amount)}
                        className="h-12"
                      >
                        ${amount}
                      </Button>
                    ))}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold">$</span>
                    <Input
                      type="number"
                      min="1"
                      max="10000"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => handleInputChange('amount', e.target.value)}
                      placeholder="Enter custom amount"
                      className="text-2xl font-bold h-12"
                    />
                  </div>
                </div>
              </div>

              {amount > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="coverFees"
                      checked={formData.coverFees}
                      onCheckedChange={(checked) => handleInputChange('coverFees', checked as boolean)}
                    />
                    <Label htmlFor="coverFees" className="text-sm">
                      Cover processing fees so more goes to the campaign (+${processingFee.toFixed(2)})
                    </Label>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span>Donation</span>
                      <span>${amount.toFixed(2)}</span>
                    </div>
                    {formData.coverFees && (
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Processing fees</span>
                        <span>${processingFee.toFixed(2)}</span>
                      </div>
                    )}
                    <Separator className="my-2" />
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>${totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="donorName">Full Name *</Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="donorName"
                      type="text"
                      value={formData.donorName}
                      onChange={(e) => handleInputChange('donorName', e.target.value)}
                      placeholder="Enter your name"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="donorEmail">Email Address *</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="donorEmail"
                      type="email"
                      value={formData.donorEmail}
                      onChange={(e) => handleInputChange('donorEmail', e.target.value)}
                      placeholder="Enter your email"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="donorPhone">Phone Number (Optional)</Label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="donorPhone"
                    type="tel"
                    value={formData.donorPhone}
                    onChange={(e) => handleInputChange('donorPhone', e.target.value)}
                    placeholder="Enter your phone number"
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="message">Message (Optional)</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  placeholder="Leave a message of support"
                  maxLength={500}
                  rows={4}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isAnonymous"
                  checked={formData.isAnonymous}
                  onCheckedChange={(checked) => handleInputChange('isAnonymous', checked as boolean)}
                />
                <Label htmlFor="isAnonymous" className="text-sm">
                  Make this donation anonymous
                </Label>
              </div>
            </div>
          )}

          {step === 3 && clientSecret && (
            <div className="p-6">
              <Elements options={stripeOptions} stripe={stripePromise}>
                <StripeCheckoutForm
                  clientSecret={clientSecret}
                  amount={totalAmount}
                  onSuccess={handlePaymentSuccess}
                  onError={(error) => {
                    console.error('Payment error:', error);
                    toast({
                      title: "Payment Failed",
                      description: error.message,
                      variant: "destructive",
                    });
                  }}
                />
              </Elements>
            </div>
          )}
        </div>

        {/* Form Navigation */}
        <div className="p-6 border-t bg-gray-50 dark:bg-gray-800">
          <div className="flex justify-between">
            <div>
              {step > 1 && step < 3 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                  disabled={loading}
                >
                  Back
                </Button>
              )}
            </div>
            <div>
              {step === 1 && (
                <Button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!validateStep1()}
                >
                  Continue
                </Button>
              )}
              {step === 2 && (
                <Button
                  type="button"
                  onClick={createPaymentIntent}
                  disabled={loading || !validateStep2()}
                  className="min-w-32"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Proceed to Payment
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
