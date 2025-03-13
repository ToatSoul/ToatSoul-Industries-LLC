import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { AvatarWithFallback } from "@/components/ui/avatar-with-fallback";
import { VoteButtons } from "@/components/forum/vote-buttons";
import { formatDistanceToNow } from "date-fns";
import { Comment, User } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";

interface CommentCardProps {
  comment: Comment & {
    author: Omit<User, "password">;
    voteScore: number;
    upvotes: number;
    downvotes: number;
    userVote?: { value: number } | undefined;
  };
  threadId: number;
}

export function CommentCard({ comment, threadId }: CommentCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isVoting, setIsVoting] = useState(false);
  
  const userVoteValue = comment.userVote?.value;
  
  const handleVote = async (value: number) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to vote",
        variant: "destructive",
      });
      return;
    }
    
    if (isVoting) return;
    
    setIsVoting(true);
    
    try {
      await apiRequest("POST", "/api/votes", {
        commentId: comment.id,
        value: value
      });
      
      // Invalidate thread query to refresh comments with updated votes
      queryClient.invalidateQueries({ queryKey: [`/api/threads/${threadId}`] });
      
      toast({
        title: "Vote recorded",
        description: `You have ${value > 0 ? "upvoted" : "downvoted"} this comment`,
      });
    } catch (error: any) {
      toast({
        title: "Error recording vote",
        description: error.message || "Failed to record vote",
        variant: "destructive",
      });
    } finally {
      setIsVoting(false);
    }
  };
  
  return (
    <Card>
      <CardContent className="p-4 md:p-6">
        <div className="flex">
          <div className="mr-4">
            <VoteButtons
              score={comment.voteScore}
              onVote={handleVote}
              userVote={userVoteValue}
              vertical={true}
              disabled={isVoting}
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center mb-2">
              <Link href={`/profile/${comment.author.id}`}>
                <a className="flex items-center">
                  <AvatarWithFallback
                    user={comment.author}
                    className="h-6 w-6 mr-2"
                  />
                  <span className="font-medium text-primary-600 hover:underline">
                    {comment.author.name || comment.author.username}
                  </span>
                </a>
              </Link>
              <span className="mx-2 text-gray-400">•</span>
              <span className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </span>
            </div>
            
            <div className="text-gray-700 whitespace-pre-wrap break-words">
              {comment.content}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
