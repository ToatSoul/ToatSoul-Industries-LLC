
import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import { Edit, ChevronLeft } from "lucide-react";

export default function BlogPost() {
  const [, params] = useRoute("/blog/:slug");
  const { user } = useAuth();
  
  interface BlogPostWithAuthor {
    id: number;
    title: string;
    content: string;
    slug: string;
    userId: number;
    published: boolean;
    createdAt: string;
    updatedAt: string;
    author: {
      id: number;
      username: string;
      name: string | null;
    }
  }

  const { data: post, isLoading } = useQuery<BlogPostWithAuthor>({
    queryKey: [`/api/blog/${params?.slug}`],
    enabled: !!params?.slug,
  });

  if (isLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  if (!post) {
    return <div>Post not found</div>;
  }

  return (
    <main className="container mx-auto py-8">
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/blog">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Blog
          </Link>
        </Button>
        
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold">{post.title}</h1>
          {user?.id === post.author.id && (
            <Button asChild>
              <Link href={`/blog/${post.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Post
              </Link>
            </Button>
          )}
        </div>
        
        <div className="text-sm text-gray-500 mt-2">
          By {post.author.username} • {formatDistanceToNow(new Date(post.createdAt))} ago
        </div>
      </div>

      <article className="prose prose-lg max-w-none">
        {post.content}
      </article>
    </main>
  );
}
