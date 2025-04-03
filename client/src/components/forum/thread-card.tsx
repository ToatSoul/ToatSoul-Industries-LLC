import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AvatarWithFallback } from "@/components/ui/avatar-with-fallback";
import { VoteButtons } from "@/components/forum/vote-buttons";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Eye, Paperclip } from "lucide-react";
import { Thread, User, Tag, File } from "@shared/schema";

interface ThreadCardProps {
  thread: Thread & {
    author: Omit<User, "password">;
    voteScore: number;
    commentCount: number;
    tags?: Tag[];
    files?: File[];
  };
  onVote?: (value: number) => void;
  userVote?: number;
}

export function ThreadCard({ thread, onVote, userVote }: ThreadCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start">
          {/* Voting buttons */}
          <div className="mr-4">
            <VoteButtons 
              score={thread.voteScore} 
              onVote={onVote} 
              userVote={userVote} 
              vertical={true}
            />
          </div>
          
          {/* Thread content */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
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
            
            <h3 className="mt-2 text-xl font-semibold text-gray-900">
              <Link href={`/thread/${thread.id}`} className="hover:text-primary">
                {thread.title}
              </Link>
            </h3>
            
            <p className="mt-2 text-gray-600 line-clamp-2">
              {thread.content}
            </p>
            
            {/* Thread meta */}
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <div className="flex items-center text-sm text-gray-500">
                <Link href={`/profile/${thread.author.id}`} className="flex items-center">
                  <AvatarWithFallback 
                    user={thread.author} 
                    className="h-6 w-6 mr-2"
                  />
                  <span>By <span className="font-medium text-primary-600 hover:underline">{thread.author.name || thread.author.username}</span></span>
                </Link>
              </div>
              
              <div className="text-sm text-gray-500 flex items-center">
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {formatDistanceToNow(new Date(thread.createdAt), { addSuffix: true })}
              </div>
              
              <div className="text-sm text-gray-500 flex items-center">
                <MessageSquare className="h-4 w-4 mr-1" />
                {thread.commentCount} {thread.commentCount === 1 ? 'comment' : 'comments'}
              </div>
              
              <div className="text-sm text-gray-500 flex items-center">
                <Eye className="h-4 w-4 mr-1" />
                {thread.views} {thread.views === 1 ? 'view' : 'views'}
              </div>
            </div>
            
            {/* Files */}
            {thread.files && thread.files.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center text-sm text-gray-500">
                  <Paperclip className="h-4 w-4 mr-1" />
                  <span className="font-medium">
                    Attachments ({thread.files.length}):
                  </span>
                  <div className="ml-2 flex flex-wrap gap-2">
                    {thread.files.map((file, index) => (
                      <a 
                        key={file.id} 
                        href={`/api/files/${file.id}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:underline"
                      >
                        {file.originalFilename}
                        {index < thread.files!.length - 1 && ","}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
