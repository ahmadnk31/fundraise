import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Quote, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function SuccessStories() {
  const navigate = useNavigate();

  const stories = [
    {
      name: "Sarah Martinez",
      location: "Austin, TX",
      campaignTitle: "Help Sarah Beat Cancer",
      category: "Medical",
      raised: 85000,
      goal: 75000,
      image: "/placeholder.svg",
      quote: "The support from the FundRaise community gave me hope during my darkest days. I couldn't have gotten through my treatment without everyone's help.",
      supporters: 432,
      outcome: "Successfully completed treatment and is now cancer-free"
    },
    {
      name: "Marcus Johnson",
      location: "Detroit, MI",
      campaignTitle: "Rebuild Our Community Center",
      category: "Community",
      raised: 120000,
      goal: 100000,
      image: "/placeholder.svg",
      quote: "Our community center was more than a building - it was the heart of our neighborhood. Thanks to FundRaise, we rebuilt it stronger than ever.",
      supporters: 867,
      outcome: "Community center reopened and now serves 200+ families daily"
    },
    {
      name: "Emma Chen",
      location: "Seattle, WA",
      campaignTitle: "Education for Rural Schools",
      category: "Education",
      raised: 45000,
      goal: 40000,
      image: "/placeholder.svg",
      quote: "Every dollar raised means another child in rural areas gets access to quality education. The platform made it so easy to reach supporters globally.",
      supporters: 523,
      outcome: "Provided educational resources to 12 rural schools"
    }
  ];

  const handleViewMore = () => {
    navigate('/success-stories');
  };

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Success Stories</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Real people, real campaigns, real impact. See how our platform has helped change lives and communities.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {stories.map((story, index) => (
            <Card key={index} className="overflow-hidden hover:shadow-lg transition-all duration-300">
              <div className="relative">
                <img 
                  src={story.image} 
                  alt={story.campaignTitle}
                  className="w-full h-48 object-cover"
                />
                <Badge className="absolute top-4 left-4 bg-primary text-white">
                  {story.category}
                </Badge>
              </div>
              
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {story.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold">{story.name}</h3>
                    <p className="text-sm text-muted-foreground">{story.location}</p>
                  </div>
                </div>

                <h4 className="font-semibold text-lg mb-3">{story.campaignTitle}</h4>

                <div className="flex items-center gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      ${(story.raised / 1000).toFixed(0)}K
                    </div>
                    <div className="text-xs text-muted-foreground">Raised</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{story.supporters}</div>
                    <div className="text-xs text-muted-foreground">Supporters</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {Math.round((story.raised / story.goal) * 100)}%
                    </div>
                    <div className="text-xs text-muted-foreground">of Goal</div>
                  </div>
                </div>

                <div className="relative mb-4">
                  <Quote className="absolute -top-2 -left-2 w-6 h-6 text-primary/30" />
                  <p className="text-sm text-muted-foreground italic pl-4">
                    "{story.quote}"
                  </p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-800">
                    <strong>Outcome:</strong> {story.outcome}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button 
            variant="outline" 
            size="lg" 
            onClick={handleViewMore}
            className="group"
          >
            View More Success Stories
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        <div className="mt-16 bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">Ready to Write Your Success Story?</h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Join thousands of successful campaigners who have turned their dreams into reality with FundRaise.
          </p>
          <Button 
            size="lg" 
            className="bg-gradient-primary hover:opacity-90"
            onClick={() => navigate('/create-campaign')}
          >
            Start Your Campaign
          </Button>
        </div>
      </div>
    </section>
  );
}
