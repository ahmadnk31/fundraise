import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Share2, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { FollowButton } from "./FollowButton";

interface CampaignCardProps {
  title: string;
  description: string;
  image: string;
  raised: number;
  goal: number;
  daysLeft: number;
  donorCount: number;
  category: string;
  trending?: boolean;
  id?: string;
}

export function CampaignCard({
  title,
  description,
  image,
  raised,
  goal,
  daysLeft,
  donorCount,
  category,
  trending = false,
  id
}: CampaignCardProps) {
  const navigate = useNavigate();
  
  const progress = (raised / goal) * 100;
  const isNearGoal = progress >= 80;
  
  // Generate a slug-like ID if not provided
  const campaignId = id || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const handleCardClick = () => {
    navigate(`/campaign/${campaignId}`);
  };

  const handleDonate = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/campaign/${campaignId}?donate=true`);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/campaign/${campaignId}`;
    if (navigator.share) {
      navigator.share({
        title,
        text: description,
        url,
      });
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(url).then(() => {
        // TODO: Show toast notification
        console.log('Link copied to clipboard');
      });
    }
  };

  return (
    <Card 
      className="group overflow-hidden border-0 shadow-card hover:shadow-success transition-all duration-300 bg-gradient-card cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="relative overflow-hidden">
        <div className="aspect-video bg-gradient-to-r from-primary/20 to-primary-glow/20 flex items-center justify-center">
          <div className="text-6xl opacity-30">🎯</div>
        </div>
        {trending && (
          <Badge className="absolute top-3 left-3 bg-warning text-warning-foreground">
            <TrendingUp className="w-3 h-3 mr-1" />
            Trending
          </Badge>
        )}
        <Badge className="absolute top-3 right-3 bg-background/90 text-foreground">
          {category}
        </Badge>
      </div>
      
      <CardHeader className="pb-3">
        <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-muted-foreground text-sm line-clamp-2">
          {description}
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-primary">
              ${raised.toLocaleString()} raised
            </span>
            <span className="text-muted-foreground">
              of ${goal.toLocaleString()}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
          {isNearGoal && (
            <p className="text-xs text-success font-medium">
              Almost there! {Math.round(100 - progress)}% to go
            </p>
          )}
        </div>
        
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{donorCount} donors</span>
          <span>{daysLeft} days left</span>
        </div>
        
        <div className="flex gap-2">
          <Button 
            className="flex-1 bg-gradient-primary hover:opacity-90"
            onClick={handleDonate}
          >
            Donate Now
          </Button>
          <div 
            onClick={(e) => e.stopPropagation()}
          >
            <FollowButton
              campaignId={campaignId}
              compact={true}
              onFollowChange={(isFollowing, count) => {
                console.log(`Campaign ${campaignId} follow status: ${isFollowing}, followers: ${count}`);
              }}
            />
          </div>
          <Button 
            variant="outline" 
            
            onClick={handleShare}
          >
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}