import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function Pricing() {
  const feeStructure = [
    {
      type: "Platform Fee",
      rate: "2.9% + $0.30",
      description: "Per donation received",
      tooltip: "This covers payment processing, platform maintenance, and customer support"
    },
    {
      type: "Payout Fee",
      rate: "Free",
      description: "Bank transfers",
      tooltip: "We don't charge for transferring your funds to your bank account"
    },
    {
      type: "Setup Fee",
      rate: "Free",
      description: "Create unlimited campaigns",
      tooltip: "No upfront costs - start fundraising immediately"
    }
  ];

  const included = [
    "Unlimited campaign creation",
    "Social media sharing tools",
    "Mobile-optimized campaigns",
    "Real-time analytics",
    "Donor management",
    "Email notifications",
    "24/7 customer support",
    "Fraud protection",
    "Mobile app access",
    "Custom campaign URLs"
  ];

  const comparison = [
    {
      feature: "Campaign Creation",
      us: "Free",
      competitor1: "$29/month",
      competitor2: "5% fee"
    },
    {
      feature: "Platform Fee",
      us: "2.9% + $0.30",
      competitor1: "5% + $0.30",
      competitor2: "3.5% + $0.30"
    },
    {
      feature: "Monthly Fees",
      us: "None",
      competitor1: "$29-$99",
      competitor2: "None"
    },
    {
      feature: "Payout Time",
      us: "2-3 days",
      competitor1: "5-7 days",
      competitor2: "7-14 days"
    }
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            No hidden fees, no monthly subscriptions. You only pay when you receive donations.
          </p>
        </div>

        {/* Main Pricing Card */}
        <div className="max-w-4xl mx-auto mb-16">
          <Card className="border-2 border-primary/20 shadow-lg">
            <CardHeader className="text-center bg-gradient-primary text-white">
              <CardTitle className="text-3xl">Pay As You Go</CardTitle>
              <p className="text-primary-foreground/80">Perfect for campaigns of any size</p>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {feeStructure.map((item, index) => (
                  <div key={index} className="text-center">
                    <div className="bg-muted rounded-lg p-4 mb-3">
                      <div className="text-2xl font-bold text-primary mb-1">{item.rate}</div>
                      <div className="text-sm text-muted-foreground">{item.description}</div>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <h3 className="font-semibold">{item.type}</h3>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="w-4 h-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">{item.tooltip}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-green-800 mb-3">What's Included (Always Free):</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {included.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span className="text-sm text-green-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-center">
                <Button size="lg" className="bg-gradient-primary hover:opacity-90">
                  Start Fundraising for Free
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  No setup fees • No monthly charges • No hidden costs
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Comparison Table */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-center mb-8">How We Compare</h3>
          <div className="overflow-x-auto">
            <table className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-semibold">Feature</th>
                  <th className="text-center p-4 font-semibold">
                    <div className="flex items-center justify-center gap-2">
                      FundRaise
                      <Badge className="bg-primary text-white">Best Value</Badge>
                    </div>
                  </th>
                  <th className="text-center p-4 font-semibold text-muted-foreground">Competitor A</th>
                  <th className="text-center p-4 font-semibold text-muted-foreground">Competitor B</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-4 font-medium">{row.feature}</td>
                    <td className="p-4 text-center">
                      <span className="font-semibold text-primary">{row.us}</span>
                    </td>
                    <td className="p-4 text-center text-muted-foreground">{row.competitor1}</td>
                    <td className="p-4 text-center text-muted-foreground">{row.competitor2}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold text-center mb-8">Pricing FAQ</h3>
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold mb-2">When are fees charged?</h4>
                <p className="text-muted-foreground">
                  Fees are automatically deducted from each donation when it's received. 
                  There are no upfront costs or monthly fees.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold mb-2">How quickly can I access my funds?</h4>
                <p className="text-muted-foreground">
                  Funds are typically available for withdrawal within 2-3 business days 
                  after a donation is made. Bank transfers usually take 1-2 additional days.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold mb-2">Are there any hidden fees?</h4>
                <p className="text-muted-foreground">
                  No hidden fees, ever. The only cost is our transparent platform fee of 
                  2.9% + $0.30 per donation. Everything else is completely free.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
