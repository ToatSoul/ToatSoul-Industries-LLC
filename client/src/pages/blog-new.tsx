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