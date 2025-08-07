import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  Lock, 
  Eye, 
  CreditCard, 
  FileText, 
  Users,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

export function TrustAndSafety() {
  const securityFeatures = [
    {
      icon: <Shield className="w-8 h-8 text-green-600" />,
      title: "Bank-Level Security",
      description: "Your personal and financial information is protected with industry-leading encryption."
    },
    {
      icon: <Lock className="w-8 h-8 text-green-600" />,
      title: "Secure Payments",
      description: "All transactions are processed through PCI-compliant payment processors."
    },
    {
      icon: <Eye className="w-8 h-8 text-green-600" />,
      title: "Campaign Review",
      description: "Every campaign is reviewed by our team to ensure authenticity and compliance."
    },
    {
      icon: <FileText className="w-8 h-8 text-green-600" />,
      title: "Fraud Protection",
      description: "Advanced fraud detection systems monitor all transactions and activities."
    }
  ];

  const protections = [
    {
      title: "Money Back Guarantee",
      description: "If a campaign is found to be fraudulent, we'll work to refund your donation.",
      icon: <CreditCard className="w-6 h-6 text-primary" />
    },
    {
      title: "Identity Verification",
      description: "Campaign creators must verify their identity before withdrawing funds.",
      icon: <Users className="w-6 h-6 text-primary" />
    },
    {
      title: "Transparent Reporting",
      description: "Campaign progress and fund usage are tracked and reported to donors.",
      icon: <FileText className="w-6 h-6 text-primary" />
    }
  ];

  const safetyTips = [
    "Always read the full campaign description before donating",
    "Look for campaigns with updates and clear progress reports",
    "Check if the campaign creator has verified their identity",
    "Be cautious of campaigns asking for immediate large donations",
    "Report suspicious campaigns to our support team"
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Trust & Safety</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Your security and peace of mind are our top priorities. Learn how we protect you and your donations.
          </p>
        </div>

        {/* Security Features */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-center mb-8">Security Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {securityFeatures.map((feature, index) => (
              <Card key={index} className="text-center border-2 hover:border-green-200 transition-colors">
                <CardContent className="p-6">
                  <div className="flex justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h4 className="font-semibold mb-2">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Donor Protection */}
        <div className="mb-16">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-center mb-8">Donor Protection</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {protections.map((protection, index) => (
                <div key={index} className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    {protection.icon}
                    <h4 className="font-semibold">{protection.title}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">{protection.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Safety Tips */}
        <div className="mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <h3 className="text-xl font-bold">Safety Tips for Donors</h3>
                </div>
                <ul className="space-y-3">
                  {safetyTips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm">{tip}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="w-6 h-6 text-yellow-600" />
                  <h3 className="text-xl font-bold">Report Concerns</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  If you notice anything suspicious or have concerns about a campaign, 
                  please report it to our team immediately.
                </p>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    Report a Campaign
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="w-4 h-4 mr-2" />
                    Contact Support
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-8">Trusted & Certified</h3>
          <div className="flex flex-wrap justify-center items-center gap-8 mb-8">
            <Badge variant="outline" className="px-4 py-2 text-lg">
              <Shield className="w-5 h-5 mr-2" />
              SSL Secured
            </Badge>
            <Badge variant="outline" className="px-4 py-2 text-lg">
              <CreditCard className="w-5 h-5 mr-2" />
              PCI Compliant
            </Badge>
            <Badge variant="outline" className="px-4 py-2 text-lg">
              <FileText className="w-5 h-5 mr-2" />
              SOC 2 Certified
            </Badge>
            <Badge variant="outline" className="px-4 py-2 text-lg">
              <Eye className="w-5 h-5 mr-2" />
              GDPR Compliant
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Learn more about our security practices in our{" "}
            <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a> and{" "}
            <a href="/terms" className="text-primary hover:underline">Terms of Service</a>.
          </p>
        </div>
      </div>
    </section>
  );
}
