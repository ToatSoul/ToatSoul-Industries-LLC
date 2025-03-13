import { useState } from "react";
import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AvatarWithFallback } from "@/components/ui/avatar-with-fallback";
import { VoteButtons } from "@/components/forum/vote-buttons";
import { CommentCard } from "@/components/forum/comment-card";
import { CommentForm } from "@/components/forum/comment-form";
import { useAuth } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Eye, PaperclipIcon, ChevronLeft } from "lucide-react";

export default function ThreadDetail() {
  const [, params] = useRoute("/thread/:id");
  const { user } = useAuth();
  const { toast } = useToast();
  const [isVoting, setIsVoting] = useState(false);
  
  const threadId = params?.id ? parseInt(params.id, 10) : 0;
  
  const { 
    data: thread, 
    isLoading, 
    isError 
  } = useQuery({
    queryKey: [`/api/threads/${threadId}`],
    enabled: !!threadId,
  });
  
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
        threadId,
        value
      });
      
      // Invalidate thread query to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/threads/${threadId}`] });
      
      toast({
        title: "Vote recorded",
        description: `You have ${value > 0 ? "upvoted" : "downvoted"} this thread`,
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
  
  // Render loading state
  if (isLoading) {
    return (
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow overflow-hidden p-6">
          <div className="animate-pulse">
            <div className="flex items-start">
              <div className="mr-4 flex flex-col items-center">
                <div className="h-4 w-4 bg-gray-200 rounded mb-1"></div>
                <div className="h-5 w-8 bg-gray-200 rounded mb-1"></div>
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
              </div>
              
              <div className="flex-1">
                <div className="h-4 w-20 bg-gray-200 rounded mb-3"></div>
                <div className="h-8 w-3/4 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-2/3 bg-gray-200 rounded mb-6"></div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8">
          <div className="h-6 w-32 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow animate-pulse p-6">
                <div className="flex">
                  <div className="mr-4 h-10 w-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }
  
  // Render error state
  if (isError || !thread) {
    return (
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          <p className="font-medium">Failed to load thread</p>
          <p>The thread may have been deleted or is temporarily unavailable.</p>
        </div>
        
        <Button variant="outline" asChild>
          <Link href="/forums">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Forums
          </Link>
        </Button>
      </main>
    );
  }
  
  return (
    <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Button variant="outline" className="mb-4" asChild>
        <Link href={thread.categoryId ? `/forums/category/${thread.categoryId}` : "/forums"}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Forums
        </Link>
      </Button>
      
      {/* Thread content */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <div className="flex items-start">
            {/* Voting buttons */}
            <div className="mr-4">
              <VoteButtons 
                score={thread.voteScore} 
                onVote={handleVote} 
                userVote={thread.userVote?.value}
                vertical={true}
                disabled={isVoting}
              />
            </div>
            
            {/* Thread content */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap gap-2 mb-3">
                {thread.tags?.map(tag => (
                  <Badge 
                    key={tag.id} 
                    style={{ backgroundColor: tag.color, color: 'white' }}
                    className="rounded-full text-xs font-medium px-2.5 py-0.5"
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-4">{thread.title}</h1>
              
              <div className="flex flex-wrap items-center text-sm text-gray-500 mb-6 gap-4">
                <div className="flex items-center">
                  <Link href={`/profile/${thread.author.id}`}>
                    <a className="flex items-center">
                      <AvatarWithFallback 
                        user={thread.author} 
                        className="h-6 w-6 mr-2"
                      />
                      <span>By <span className="font-medium text-primary-600 hover:underline">{thread.author.name || thread.author.username}</span></span>
                    </a>
                  </Link>
                </div>
                
                <div className="flex items-center">
                  <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {formatDistanceToNow(new Date(thread.createdAt), { addSuffix: true })}
                </div>
                
                <div className="flex items-center">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  {thread.comments.length} {thread.comments.length === 1 ? 'comment' : 'comments'}
                </div>
                
                <div className="flex items-center">
                  <Eye className="h-4 w-4 mr-1" />
                  {thread.views} {thread.views === 1 ? 'view' : 'views'}
                </div>
              </div>
              
              <div className="prose prose-sm sm:prose max-w-none mb-6 whitespace-pre-wrap break-words">
                {thread.content}
              </div>
              
              {/* Files */}
              {thread.files && thread.files.length > 0 && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center text-sm text-gray-700">
                    <PaperclipIcon className="h-4 w-4 mr-2" />
                    <span className="font-medium">Attachments ({thread.files.length}):</span>
                  </div>
                  <ul className="mt-2 space-y-2">
                    {thread.files.map(file => (
                      <li key={file.id} className="flex items-center text-sm">
                        <svg className="h-4 w-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <a
                          href={`/api/files/${file.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:underline"
                        >
                          {file.originalFilename}
                          <span className="ml-2 text-gray-500">({Math.round(file.size / 1024)} KB)</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Comments section */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Comments ({thread.comments.length})
        </h2>
        
        {thread.comments.length > 0 ? (
          <div className="space-y-4 mb-8">
            {thread.comments.map(comment => (
              <CommentCard 
                key={comment.id} 
                comment={comment}
                threadId={thread.id}
              />
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-6 text-center mb-8">
            <p className="text-gray-600">No comments yet. Be the first to add a comment!</p>
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Add a Comment
          </h3>
          <CommentForm threadId={thread.id} />
        </div>
      </div>
    </main>
  );
}
