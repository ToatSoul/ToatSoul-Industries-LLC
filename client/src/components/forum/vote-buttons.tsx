import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoteButtonsProps {
  score: number;
  onVote?: (value: number) => void;
  userVote?: number;
  vertical?: boolean;
  disabled?: boolean;
}

export function VoteButtons({ 
  score, 
  onVote, 
  userVote, 
  vertical = false,
  disabled = false 
}: VoteButtonsProps) {
  const handleUpvote = () => {
    if (disabled || !onVote) return;
    onVote(userVote === 1 ? 0 : 1); // Toggle between upvote and no vote
  };
  
  const handleDownvote = () => {
    if (disabled || !onVote) return;
    onVote(userVote === -1 ? 0 : -1); // Toggle between downvote and no vote
  };
  
  if (vertical) {
    return (
      <div className="flex flex-col items-center">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "p-0 h-6 w-6 rounded-full", 
            userVote === 1 ? "text-primary hover:text-primary" : "text-gray-400 hover:text-primary"
          )}
          onClick={handleUpvote}
          disabled={disabled}
        >
          <ChevronUp className="h-5 w-5" />
        </Button>
        <span className={cn(
          "text-gray-900 font-medium my-1",
          score > 0 ? "text-green-600" : score < 0 ? "text-red-600" : ""
        )}>
          {score}
        </span>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "p-0 h-6 w-6 rounded-full", 
            userVote === -1 ? "text-destructive hover:text-destructive" : "text-gray-400 hover:text-destructive"
          )}
          onClick={handleDownvote}
          disabled={disabled}
        >
          <ChevronDown className="h-5 w-5" />
        </Button>
      </div>
    );
  }
  
  return (
    <div className="flex items-center">
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "p-0 h-8 w-8 rounded-full", 
          userVote === 1 ? "text-primary hover:text-primary" : "text-gray-400 hover:text-primary"
        )}
        onClick={handleUpvote}
        disabled={disabled}
      >
        <ChevronUp className="h-5 w-5" />
      </Button>
      <span className={cn(
        "text-gray-900 font-medium mx-2",
        score > 0 ? "text-green-600" : score < 0 ? "text-red-600" : ""
      )}>
        {score}
      </span>
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "p-0 h-8 w-8 rounded-full", 
          userVote === -1 ? "text-destructive hover:text-destructive" : "text-gray-400 hover:text-destructive"
        )}
        onClick={handleDownvote}
        disabled={disabled}
      >
        <ChevronDown className="h-5 w-5" />
      </Button>
    </div>
  );
}
