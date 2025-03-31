import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";

export default function NewBlogPost() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const createPost = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/blog", {
        method: "POST",
        body: JSON.stringify({
          title,
          content,
          published: true
        })
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Blog post created successfully"
      });
      setLocation("/blog");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createPost.mutate();
  };

  return (
    <main className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">New Blog Post</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Title</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Content</label>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            className="min-h-[300px]"
          />
        </div>
        <Button type="submit" disabled={createPost.isPending}>
          {createPost.isPending ? "Creating..." : "Create Post"}
        </Button>
      </form>
    </main>
  );
}
import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

export default function NewBlogPost() {
  const [, setLocation] = useLocation();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const post = await apiRequest("/api/blog", {
        method: "POST",
        body: JSON.stringify({
          title,
          content,
          published: true
        })
      });

      await queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
      setLocation(`/blog/${post.slug}`);
    } catch (error) {
      console.error("Failed to create blog post:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">New Blog Post</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-2">
            Title
          </label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="content" className="block text-sm font-medium mb-2">
            Content
          </label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            className="h-64"
          />
        </div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Publishing..." : "Publish Post"}
        </Button>
      </form>
    </main>
  );
}
