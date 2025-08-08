import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription } from './ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { InfoIcon, CreditCard, Clock, CheckCircle } from 'lucide-react';
import ApiService from '../services/api.service';

interface ManualPayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId: string;
  campaignTitle: string;
  availableBalance: number;
}

interface PayoutInstructions {
  title: string;
  description: string;
  steps: string[];
  supportedMethods: Array<{
    method: string;
    name: string;
    description: string;
    requiredFields: string[];
    processingTime: string;
  }>;
  fees: {
    platformFee: string;
    processingFee: string;
    minimumPayout: string;
  };
  note: string;
}

export function ManualPayoutModal({ isOpen, onClose, campaignId, campaignTitle, availableBalance }: ManualPayoutModalProps) {
  const [instructions, setInstructions] = useState<PayoutInstructions | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<'instructions' | 'form' | 'success'>('instructions');
  const [formData, setFormData] = useState({
    amount: '',
    paymentMethod: '',
    accountHolder: '',
    bankName: '',
    accountNumber: '',
    routingNumber: '',
    paypalEmail: '',
    address: '',
  });
  const [submitResult, setSubmitResult] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      fetchInstructions();
      setStep('instructions');
      setFormData({
        amount: '',
        paymentMethod: '',
        accountHolder: '',
        bankName: '',
        accountNumber: '',
        routingNumber: '',
        paypalEmail: '',
        address: '',
      });
    }
  }, [isOpen]);

  const fetchInstructions = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getManualPayoutInstructions();
      if (response.success) {
        setInstructions(response.data);
      }
    } catch (error) {
      console.error('Error fetching instructions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.amount || !formData.paymentMethod || !formData.accountHolder) {
      alert('Please fill in all required fields');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (amount < 10) {
      alert('Minimum payout amount is $10.00');
      return;
    }

    if (amount > availableBalance) {
      alert(`Amount cannot exceed available balance of $${availableBalance.toLocaleString()}`);
      return;
    }

    try {
      setSubmitting(true);
      const response = await ApiService.createManualPayout({
        campaignId,
        amount: formData.amount,
        paymentMethod: formData.paymentMethod as 'bank_transfer' | 'paypal' | 'check',
        accountDetails: {
          accountHolder: formData.accountHolder,
          bankName: formData.bankName || undefined,
          accountNumber: formData.accountNumber || undefined,
          routingNumber: formData.routingNumber || undefined,
          paypalEmail: formData.paypalEmail || undefined,
          address: formData.address || undefined,
        },
      });

      if (response.success) {
        setSubmitResult(response.data);
        setStep('success');
      }
    } catch (error: any) {
      console.error('Error submitting payout:', error);
      alert(error.response?.data?.message || 'Failed to submit payout request');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedMethod = instructions?.supportedMethods.find(m => m.method === formData.paymentMethod);

  const calculateFees = () => {
    if (!formData.amount || !instructions) return null;
    const amount = parseFloat(formData.amount);
    const platformFee = amount * 0.05;
    const processingFee = amount * 0.03;
    const netAmount = amount - platformFee - processingFee;
    return { amount, platformFee, processingFee, netAmount };
  };

  const fees = calculateFees();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Request Manual Payout
          </DialogTitle>
          <DialogDescription>
            Request a payout for "{campaignTitle}"
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="py-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading payout information...</p>
          </div>
        )}

        {!loading && instructions && step === 'instructions' && (
          <div className="space-y-4">
            <Alert>
              <InfoIcon className="h-4 w-4" />
              <AlertDescription>
                {instructions.description}
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Process Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-2 text-sm">
                  {instructions.steps.map((step, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-5 h-5 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-semibold">
                        {index + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {instructions.supportedMethods.map((method) => (
                <Card key={method.method} className="relative">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{method.name}</CardTitle>
                    <CardDescription className="text-xs">
                      {method.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {method.processingTime}
                      </div>
                      <div>
                        <strong>Required:</strong>
                        <ul className="mt-1 space-y-1">
                          {method.requiredFields.map((field) => (
                            <li key={field} className="text-muted-foreground">
                              • {field.replace(/([A-Z])/g, ' $1').toLowerCase()}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Fees & Limits</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span>Platform Fee:</span>
                  <span>{instructions.fees.platformFee}</span>
                </div>
                <div className="flex justify-between">
                  <span>Processing Fee:</span>
                  <span>{instructions.fees.processingFee}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Minimum Payout:</span>
                  <span>{instructions.fees.minimumPayout}</span>
                </div>
              </CardContent>
            </Card>

            <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
              <strong>Note:</strong> {instructions.note}
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={() => setStep('form')}>
                Continue to Form
              </Button>
            </div>
          </div>
        )}

        {step === 'form' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount">Payout Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  min="10"
                  max={availableBalance}
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Available: ${availableBalance.toLocaleString()}
                </p>
              </div>
              <div>
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select value={formData.paymentMethod} onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    {instructions?.supportedMethods.map((method) => (
                      <SelectItem key={method.method} value={method.method}>
                        {method.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {fees && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Payout Summary</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span>Requested Amount:</span>
                    <span>${fees.amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Platform Fee (5%):</span>
                    <span>-${fees.platformFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Processing Fee (3%):</span>
                    <span>-${fees.processingFee.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-semibold">
                    <span>You'll Receive:</span>
                    <span>${fees.netAmount.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            <div>
              <Label htmlFor="accountHolder">Account Holder Name</Label>
              <Input
                id="accountHolder"
                value={formData.accountHolder}
                onChange={(e) => setFormData({ ...formData, accountHolder: e.target.value })}
                placeholder="Full name on account"
              />
            </div>

            {selectedMethod && (
              <div className="space-y-4">
                {formData.paymentMethod === 'bank_transfer' && (
                  <>
                    <div>
                      <Label htmlFor="bankName">Bank Name</Label>
                      <Input
                        id="bankName"
                        value={formData.bankName}
                        onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                        placeholder="Bank of America"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="accountNumber">Account Number</Label>
                        <Input
                          id="accountNumber"
                          value={formData.accountNumber}
                          onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                          placeholder="1234567890"
                        />
                      </div>
                      <div>
                        <Label htmlFor="routingNumber">Routing Number</Label>
                        <Input
                          id="routingNumber"
                          value={formData.routingNumber}
                          onChange={(e) => setFormData({ ...formData, routingNumber: e.target.value })}
                          placeholder="123456789"
                        />
                      </div>
                    </div>
                  </>
                )}

                {formData.paymentMethod === 'paypal' && (
                  <div>
                    <Label htmlFor="paypalEmail">PayPal Email</Label>
                    <Input
                      id="paypalEmail"
                      type="email"
                      value={formData.paypalEmail}
                      onChange={(e) => setFormData({ ...formData, paypalEmail: e.target.value })}
                      placeholder="your@email.com"
                    />
                  </div>
                )}

                {formData.paymentMethod === 'check' && (
                  <div>
                    <Label htmlFor="address">Mailing Address</Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="123 Main St, City, State, ZIP"
                      rows={3}
                    />
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep('instructions')}>
                Back
              </Button>
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Request'}
              </Button>
            </div>
          </div>
        )}

        {step === 'success' && submitResult && (
          <div className="space-y-4 text-center">
            <div className="flex justify-center">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Payout Request Submitted!</h3>
              <p className="text-muted-foreground">
                Your payout request has been submitted for review.
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Request Details</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span>Request ID:</span>
                  <span className="font-mono">{submitResult.payoutId?.substring(0, 8)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Amount:</span>
                  <span>${submitResult.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Net Amount:</span>
                  <span className="font-semibold">${submitResult.netAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <Badge variant="secondary">{submitResult.status}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Processing Time:</span>
                  <span>{submitResult.estimatedProcessingTime}</span>
                </div>
              </CardContent>
            </Card>

            <div className="text-sm text-muted-foreground">
              You will receive email updates about the status of your payout request.
            </div>

            <Button onClick={onClose} className="w-full">
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
