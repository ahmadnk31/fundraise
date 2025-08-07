import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { 
 
  MessageSquare, 
  Send, 
  Reply, 
  Edit, 
  Trash2, 
  Loader2,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/use-toast';
import ApiService from '../services/api.service';
import { Comment, CreateCommentRequest, UpdateCommentRequest } from '../types';

interface CommentsSectionProps {
  campaignId: string;
}

export const CommentsSection: React.FC<CommentsSectionProps> = ({ campaignId }) => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
  const [loadingReplies, setLoadingReplies] = useState<Set<string>>(new Set());

  const fetchComments = async (pageNum = 1, append = false) => {
    try {
      setLoading(!append);
      const response = await ApiService.getComments(campaignId, {
        page: pageNum,
        limit: 10,
      });

      if (response.success && response.data) {
        const newComments = response.data.comments;
        setComments(prev => append ? [...prev, ...newComments] : newComments);
        setHasMore(response.data.pagination.hasNext);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast({
        title: "Error",
        description: "Failed to load comments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchReplies = async (commentId: string) => {
    if (loadingReplies.has(commentId)) return;

    try {
      setLoadingReplies(prev => new Set([...prev, commentId]));
      
      const response = await ApiService.getReplies(commentId, {
        page: 1,
        limit: 50, // Load more replies at once
      });

      if (response.success && response.data) {
        const replies = response.data.replies;
        
        // Update the comment with its replies
        setComments(prev => updateCommentReplies(prev, commentId, replies));
        
        // Mark as expanded
        setExpandedReplies(prev => new Set([...prev, commentId]));
      }
    } catch (error) {
      console.error('Error fetching replies:', error);
      toast({
        title: "Error",
        description: "Failed to load replies",
        variant: "destructive",
      });
    } finally {
      setLoadingReplies(prev => {
        const newSet = new Set(prev);
        newSet.delete(commentId);
        return newSet;
      });
    }
  };

  const updateCommentReplies = (comments: Comment[], commentId: string, replies: Comment[]): Comment[] => {
    return comments.map(comment => {
      if (comment.id === commentId) {
        return { ...comment, replies };
      }
      if (comment.replies && comment.replies.length > 0) {
        return {
          ...comment,
          replies: updateCommentReplies(comment.replies, commentId, replies),
        };
      }
      return comment;
    });
  };

  const toggleReplies = (commentId: string) => {
    if (expandedReplies.has(commentId)) {
      // Collapse replies
      setExpandedReplies(prev => {
        const newSet = new Set(prev);
        newSet.delete(commentId);
        return newSet;
      });
    } else {
      // Expand replies - fetch if not already loaded
      const comment = findCommentById(comments, commentId);
      if (comment && (!comment.replies || comment.replies.length === 0) && comment.replyCount && comment.replyCount > 0) {
        fetchReplies(commentId);
      } else {
        setExpandedReplies(prev => new Set([...prev, commentId]));
      }
    }
  };

  const findCommentById = (comments: Comment[], commentId: string): Comment | null => {
    for (const comment of comments) {
      if (comment.id === commentId) return comment;
      if (comment.replies) {
        const found = findCommentById(comment.replies, commentId);
        if (found) return found;
      }
    }
    return null;
  };

  useEffect(() => {
    fetchComments();
  }, [campaignId]);

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !isAuthenticated) return;

    try {
      setSubmitting(true);
      const commentData: CreateCommentRequest = {
        campaignId,
        content: newComment.trim(),
      };

      const response = await ApiService.createComment(commentData);

      if (response.success && response.data) {
        setNewComment('');
        // Add the new comment to the local state immediately
        const newCommentWithReplies = {
          ...response.data,
          replies: [],
        };
        setComments(prev => [newCommentWithReplies, ...prev]);
        toast({
          title: "Comment posted",
          description: "Your comment has been posted successfully.",
        });
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      toast({
        title: "Error",
        description: "Failed to post comment",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (parentId: string) => {
    if (!replyText.trim() || !isAuthenticated) return;

    try {
      setSubmitting(true);
      const replyData: CreateCommentRequest = {
        campaignId,
        content: replyText.trim(),
        parentId,
      };

      const response = await ApiService.createComment(replyData);

      if (response.success && response.data) {
        setReplyTo(null);
        setReplyText('');
        
        // Add the reply to the correct parent comment in local state (recursive)
        const addReplyToTree = (comments: Comment[]): Comment[] => {
          return comments.map(comment => {
            if (comment.id === parentId) {
              return {
                ...comment,
                replies: [...(comment.replies || []), response.data],
              };
            }
            if (comment.replies && comment.replies.length > 0) {
              return {
                ...comment,
                replies: addReplyToTree(comment.replies),
              };
            }
            return comment;
          });
        };
        
        setComments(prev => addReplyToTree(prev));
        
        toast({
          title: "Reply posted",
          description: "Your reply has been posted successfully.",
        });
      }
    } catch (error) {
      console.error('Error posting reply:', error);
      toast({
        title: "Error",
        description: "Failed to post reply",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editText.trim()) return;

    try {
      setSubmitting(true);
      const updateData: UpdateCommentRequest = {
        content: editText.trim(),
      };

      const response = await ApiService.updateComment(commentId, updateData);

      if (response.success && response.data) {
        setEditingComment(null);
        setEditText('');
        
        // Update the comment in local state (recursive)
        const updateCommentInTree = (comments: Comment[]): Comment[] => {
          return comments.map(comment => {
            if (comment.id === commentId) {
              return { ...comment, content: response.data.content };
            }
            if (comment.replies && comment.replies.length > 0) {
              return {
                ...comment,
                replies: updateCommentInTree(comment.replies),
              };
            }
            return comment;
          });
        };
        
        setComments(prev => updateCommentInTree(prev));
        
        toast({
          title: "Comment updated",
          description: "Your comment has been updated successfully.",
        });
      }
    } catch (error) {
      console.error('Error updating comment:', error);
      toast({
        title: "Error",
        description: "Failed to update comment",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      const response = await ApiService.deleteComment(commentId);

      if (response.success) {
        // Remove the comment from local state (recursive)
        const removeCommentFromTree = (comments: Comment[]): Comment[] => {
          return comments
            .filter(comment => comment.id !== commentId)
            .map(comment => ({
              ...comment,
              replies: comment.replies ? removeCommentFromTree(comment.replies) : []
            }));
        };
        
        setComments(prev => removeCommentFromTree(prev));
        
        toast({
          title: "Comment deleted",
          description: "Your comment has been deleted successfully.",
        });
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({
        title: "Error",
        description: "Failed to delete comment",
        variant: "destructive",
      });
    }
  };

  const startEdit = (comment: Comment) => {
    setEditingComment(comment.id);
    setEditText(comment.content);
  };

  const cancelEdit = () => {
    setEditingComment(null);
    setEditText('');
  };

  const renderComment = (comment: Comment, depth = 0) => {
    const maxDepth = 6; // Maximum nesting level for visual hierarchy
    const indentClass = depth > 0 ? 'ml-6 border-l-2 border-gray-200 pl-4' : '';
    
    return (
      <div key={comment.id} className={indentClass}>
        <div className="flex gap-3">
          <Avatar className="h-8 w-8 flex-shrink-0">
            {comment.user?.avatar ? (
              <img src={comment.user.avatar} alt={`${comment.user.firstName} ${comment.user.lastName}`} />
            ) : (
              <AvatarFallback className="bg-primary/10">
                {(comment.user?.firstName || 'U').charAt(0)}{(comment.user?.lastName || 'N').charAt(0)}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">
                {comment.user?.firstName} {comment.user?.lastName}
              </span>
              <span className="text-xs text-muted-foreground">
                {new Date(comment.createdAt).toLocaleDateString()}
              </span>
              {!comment.isApproved && (
                <Badge variant="secondary" className="text-xs">
                  Pending approval
                </Badge>
              )}
            </div>
            
            {editingComment === comment.id ? (
              <div className="space-y-2">
                <Textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  placeholder="Edit your comment..."
                  className="min-h-[80px]"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleEditComment(comment.id)}
                    disabled={submitting || !editText.trim()}
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
                  </Button>
                  <Button size="sm" variant="outline" onClick={cancelEdit}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm leading-relaxed">{comment.content}</p>
                
                <div className="flex items-center gap-2">
                  {isAuthenticated && user && user.id !== comment.userId && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                      className="h-6 px-2 text-xs"
                    >
                      <Reply className="w-3 h-3 mr-1" />
                      Reply
                    </Button>
                  )}
                  
                  {/* Toggle Replies Button */}
                  {(comment.replyCount && comment.replyCount > 0) && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleReplies(comment.id)}
                      className="h-6 px-2 text-xs text-gray-600 hover:text-gray-700"
                      disabled={loadingReplies.has(comment.id)}
                    >
                      {loadingReplies.has(comment.id) ? (
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      ) : (
                        <MessageSquare className="w-3 h-3 mr-1" />
                      )}
                      {comment.replyCount}
                    </Button>
                  )}
                  
                 
                  
                  {user && user.id === comment.userId && (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => startEdit(comment)}
                        className="h-6 px-2 text-xs"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteComment(comment.id)}
                        className="h-6 px-2 text-xs text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Delete
                      </Button>
                    </>
                  )}
                </div>
              </>
            )}
            
            {/* Reply Form */}
            {replyTo === comment.id && (
              <div className="space-y-2 mt-3">
                <div className="flex gap-3">
                  <Avatar className="h-6 w-6 flex-shrink-0">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={`${user.firstName} ${user.lastName}`} />
                    ) : (
                      <AvatarFallback className="bg-primary/10 text-xs">
                        {(user?.firstName || 'U').charAt(0)}{(user?.lastName || 'N').charAt(0)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1">
                    <Textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write a reply..."
                      className="min-h-[60px] text-sm"
                    />
                  </div>
                </div>
                <div className="flex gap-2 ml-9">
                  <Button
                    size="sm"
                    onClick={() => handleReply(comment.id)}
                    disabled={submitting || !replyText.trim()}
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Reply'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setReplyTo(null);
                      setReplyText('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Nested Replies */}
        {expandedReplies.has(comment.id) && comment.replies && comment.replies.length > 0 && (
          <div className="space-y-3 mt-3">
            {comment.replies.map(reply => renderComment(reply, Math.min(depth + 1, maxDepth)))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          Comments ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* New Comment Form */}
        {isAuthenticated ? (
          <div className="space-y-3">
            <div className="flex gap-3">
              <Avatar className="h-8 w-8">
                {user?.avatar ? (
                  <img src={user.avatar} alt={`${user.firstName} ${user.lastName}`} />
                ) : (
                  <AvatarFallback className="bg-primary/10">
                    {(user?.firstName || 'U').charAt(0)}{(user?.lastName || 'N').charAt(0)}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex-1">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="min-h-[100px]"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                onClick={handleSubmitComment}
                disabled={submitting || !newComment.trim()}
                className="min-w-24"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Post Comment
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Please log in to post a comment</p>
          </div>
        )}

        <Separator />

        {/* Comments List */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="ml-2">Loading comments...</span>
          </div>
        ) : comments.length > 0 ? (
          <div className="space-y-6">
            {comments.filter(comment => !comment.parentId).map(comment => renderComment(comment, 0))}
            
            {hasMore && (
              <div className="text-center">
                <Button
                  variant="outline"
                  onClick={() => fetchComments(page + 1, true)}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Load more comments
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No comments yet. Be the first to comment!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
