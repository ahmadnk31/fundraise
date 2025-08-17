import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Share2, Heart, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export function HowItWorks() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/create-campaign');
    } else {
      navigate('/register');
    }
  };

  const steps = [
    {
      icon: <PlusCircle className="w-12 h-12 text-primary" />,
      title: "Create Your Campaign",
      description: "Tell your story, set your goal, and upload photos. Our easy-to-use tools help you create a compelling campaign in minutes.",
      details: ["Add photos and videos", "Write your story", "Set fundraising goal", "Choose campaign duration"]
    },
    {
      icon: <Share2 className="w-12 h-12 text-primary" />,
      title: "Share with Friends",
      description: "Share your campaign on social media, email, and messaging apps. The more people who see it, the more support you'll receive.",
      details: ["Social media integration", "Email sharing tools", "Custom campaign links", "Mobile-friendly sharing"]
    },
    {
      icon: <Heart className="w-12 h-12 text-primary" />,
      title: "Receive Support",
      description: "Watch as your community rallies behind your cause. Receive donations, comments, and encouragement from supporters worldwide.",
      details: ["Real-time notifications", "Supporter comments", "Progress tracking", "Thank your donors"]
    },
    {
      icon: <DollarSign className="w-12 h-12 text-primary" />,
      title: "Get Your Funds",
      description: "Withdraw your funds directly to your bank account. Our secure platform ensures you get your money quickly and safely.",
      details: ["Secure bank transfers", "Fast processing", "Transparent fees", "24/7 support"]
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-background to-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Starting a fundraising campaign is simple. Follow these four easy steps to turn your dreams into reality.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {steps.map((step, index) => (
            <Card key={index} className="relative border-2 hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-background border-2 border-primary rounded-full w-8 h-8 flex items-center justify-center">
                    <span className="text-primary font-bold">{index + 1}</span>
                  </div>
                </div>
                
                <div className="mt-4 mb-6 flex justify-center">
                  {step.icon}
                </div>
                
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground mb-4">{step.description}</p>
                
                <ul className="text-sm text-muted-foreground space-y-1">
                  {step.details.map((detail, detailIndex) => (
                    <li key={detailIndex} className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-primary rounded-full"></div>
                      {detail}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button 
            size="lg" 
            className="bg-gradient-primary hover:opacity-90 text-lg px-8 py-3"
            onClick={handleGetStarted}
          >
            Start Your Campaign Today
          </Button>
          <p className="text-sm text-muted-foreground mt-2">
            It's free to start and only takes a few minutes
          </p>
        </div>
      </div>
    </section>
  );
}
