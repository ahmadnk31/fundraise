import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Heart, HeartOff, Loader2, Users } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/use-toast';
import ApiService from '../services/api.service';
import { FollowStatus } from '../types';

interface FollowButtonProps {
  campaignId: string;
  onFollowChange?: (isFollowing: boolean, followCount: number) => void;
  compact?: boolean; // New prop for compact display
}

export const FollowButton: React.FC<FollowButtonProps> = ({ campaignId, onFollowChange, compact = false }) => {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [followStatus, setFollowStatus] = useState<FollowStatus>({ isFollowing: false });
  const [followCount, setFollowCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const fetchFollowStatus = async () => {
    if (!isAuthenticated) {
      setInitialLoading(false);
      return;
    }

    try {
      const [statusResponse, countResponse] = await Promise.all([
        ApiService.getFollowStatus(campaignId),
        ApiService.getFollowCount(campaignId),
      ]);

      if (statusResponse.success && statusResponse.data) {
        setFollowStatus(statusResponse.data);
      }

      if (countResponse.success && countResponse.data) {
        setFollowCount(countResponse.data.followCount);
      }
    } catch (error) {
      console.error('Error fetching follow status:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchFollowCount = async () => {
    try {
      const response = await ApiService.getFollowCount(campaignId);
      if (response.success && response.data) {
        setFollowCount(response.data.followCount);
      }
    } catch (error) {
      console.error('Error fetching follow count:', error);
    }
  };

  useEffect(() => {
    fetchFollowStatus();
    if (!isAuthenticated) {
      // Still fetch follow count for display even if not authenticated
      fetchFollowCount();
    }
  }, [campaignId, isAuthenticated]);

  const handleFollow = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to follow this campaign",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      if (followStatus.isFollowing) {
        const response = await ApiService.unfollowCampaign(campaignId);
        if (response.success) {
          setFollowStatus({ isFollowing: false });
          const newCount = Math.max(0, followCount - 1);
          setFollowCount(newCount);
          onFollowChange?.(false, newCount);
          toast({
            title: "Unfollowed",
            description: "You have unfollowed this campaign",
          });
        }
      } else {
        const response = await ApiService.followCampaign({ campaignId });
        if (response.success) {
          setFollowStatus({ isFollowing: true, followId: response.data?.id });
          const newCount = followCount + 1;
          setFollowCount(newCount);
          onFollowChange?.(true, newCount);
          toast({
            title: "Following",
            description: "You are now following this campaign",
          });
        }
      }
    } catch (error) {
      console.error('Error updating follow status:', error);
      toast({
        title: "Error",
        description: "Failed to update follow status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <Button 
        variant="outline" 
        disabled 
        className={compact ? "h-10 w-10 p-0" : "flex-1"}
        size={compact ? "sm" : "default"}
      >
        <Loader2 className={`w-4 h-4 animate-spin ${!compact ? 'mr-2' : ''}`} />
        {!compact && 'Loading...'}
      </Button>
    );
  }

  if (compact) {
    return (
      <Button
        variant={followStatus.isFollowing ? "default" : "outline"}
        onClick={handleFollow}
        disabled={loading}
        className="h-10 w-10 p-0"
        size="sm"
        title={followStatus.isFollowing ? 'Unfollow' : 'Follow'}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : followStatus.isFollowing ? (
          <Heart className="w-4 h-4 fill-current text-red-500" />
        ) : (
          <Heart className="w-4 h-4" />
        )}
      </Button>
    );
  }

  return (
    <div className="space-y-2">
      <Button
        variant={followStatus.isFollowing ? "default" : "outline"}
        onClick={handleFollow}
        disabled={loading}
        className="w-full"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
        ) : followStatus.isFollowing ? (
          <HeartOff className="w-4 h-4 mr-2" />
        ) : (
          <Heart className="w-4 h-4 mr-2" />
        )}
        {followStatus.isFollowing ? 'Unfollow' : 'Follow'}
      </Button>
      
      {followCount > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          <Users className="w-4 h-4 inline mr-1" />
          {followCount} {followCount === 1 ? 'follower' : 'followers'}
        </div>
      )}
    </div>
  );
};
