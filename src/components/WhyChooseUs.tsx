import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Zap, Globe, HeadphonesIcon, CreditCard, Users } from "lucide-react";

export function WhyChooseUs() {
  const features = [
    {
      icon: <Shield className="w-8 h-8 text-primary" />,
      title: "Secure & Trusted",
      description: "Your funds are protected with bank-level security and fraud protection.",
      highlights: ["SSL encryption", "Fraud protection", "Secure payments"]
    },
    {
      icon: <Zap className="w-8 h-8 text-primary" />,
      title: "Fast & Easy",
      description: "Create campaigns in minutes and start receiving donations immediately.",
      highlights: ["Quick setup", "Instant donations", "Mobile optimized"]
    },
    {
      icon: <Globe className="w-8 h-8 text-primary" />,
      title: "Global Reach",
      description: "Accept donations from supporters worldwide in multiple currencies.",
      highlights: ["190+ countries", "Multiple currencies", "Local payment methods"]
    },
    {
      icon: <CreditCard className="w-8 h-8 text-primary" />,
      title: "Low Fees",
      description: "Keep more of what you raise with our transparent, low-cost fee structure.",
      highlights: ["2.9% + $0.30 per donation", "No setup fees", "No monthly fees"]
    },
    {
      icon: <Users className="w-8 h-8 text-primary" />,
      title: "Expert Support",
      description: "Get help from our dedicated team whenever you need it.",
      highlights: ["24/7 support", "Campaign optimization", "Success coaching"]
    },
    {
      icon: <HeadphonesIcon className="w-8 h-8 text-primary" />,
      title: "Community Driven",
      description: "Join a community of changemakers and connect with like-minded supporters.",
      highlights: ["Social sharing tools", "Supporter engagement", "Campaign discovery"]
    }
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Why Choose FundRaise?</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We're more than just a fundraising platform. We're your partner in making a difference.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-2 hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                </div>
                
                <p className="text-muted-foreground mb-4">{feature.description}</p>
                
                <div className="flex flex-wrap gap-2">
                  {feature.highlights.map((highlight, highlightIndex) => (
                    <Badge key={highlightIndex} variant="secondary" className="text-xs">
                      {highlight}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-8">
            <h3 className="text-2xl font-bold mb-4">Trusted by Millions</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">99.8%</div>
                <div className="text-sm text-muted-foreground">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">24/7</div>
                <div className="text-sm text-muted-foreground">Support</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">A+</div>
                <div className="text-sm text-muted-foreground">Security Rating</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">5★</div>
                <div className="text-sm text-muted-foreground">User Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
