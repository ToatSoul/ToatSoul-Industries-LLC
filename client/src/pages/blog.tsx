
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import { Plus } from "lucide-react";

export default function Blog() {
  const { user } = useAuth();
  const { data: posts, isLoading } = useQuery({
    queryKey: ["/api/blog"],
  });

  const { data: isAuthor } = useQuery({
    queryKey: [`/api/blog/authors/${user?.id}`],
    queryFn: async () => {
      if (!user) return false;
      try {
        await fetch(`/api/blog/authors/${user.id}`, {
          credentials: "include"
        });
        return true;
      } catch {
        return false;
      }
    },
    enabled: !!user,
  });

  if (isLoading) {
    return <Skeleton className="h-48 w-full" />;
  }

  return (
    <main className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Company Blog</h1>
        {isAuthor && (
          <Button asChild>
            <Link href="/blog/new">
              <Plus className="h-4 w-4 mr-2" />
              New Post
            </Link>
          </Button>
        )}
      </div>

      <div className="grid gap-6">
        {posts?.map((post) => (
          <article key={post.id} className="border rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-2">
              <Link href={`/blog/${post.slug}`} className="hover:text-primary">
                {post.title}
              </Link>
            </h2>
            <div className="text-sm text-gray-500 mb-4">
              By {post.author.username} • {formatDistanceToNow(new Date(post.createdAt))} ago
            </div>
            <p className="text-gray-600 line-clamp-3">{post.content}</p>
          </article>
        ))}
      </div>
    </main>
  );
}
