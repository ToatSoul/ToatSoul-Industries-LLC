import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Category, Tag } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileUpload } from "@/components/forum/file-upload";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useRoute } from "wouter";
import { Checkbox } from "@/components/ui/checkbox";

// Schema for thread creation
const threadFormSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title must not exceed 100 characters"),
  content: z.string().min(20, "Content must be at least 20 characters"),
  categoryId: z.string().min(1, "Please select a category"),
  tagIds: z.array(z.string()).optional(),
});

type ThreadFormValues = z.infer<typeof threadFormSchema>;

export function ThreadForm() {
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  
  // Fetch categories and tags
  const { data: categories = [], isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });
  
  const { data: tags = [], isLoading: tagsLoading } = useQuery<Tag[]>({
    queryKey: ['/api/tags'],
  });
  
  const [, params] = useRoute("/new-thread?category=:categoryId");
  
  const form = useForm<ThreadFormValues>({
    resolver: zodResolver(threadFormSchema),
    defaultValues: {
      title: "",
      content: "",
      categoryId: params?.categoryId || "",
      tagIds: [],
    },
  });
  
  const onSubmit = async (data: ThreadFormValues) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to create a thread",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create thread
      const thread = await apiRequest("POST", "/api/threads", {
        title: data.title,
        content: data.content,
        categoryId: parseInt(data.categoryId, 10),
        tagIds: data.tagIds?.map(id => parseInt(id, 10)) || [],
      });
      
      // Upload files if any
      if (files.length > 0) {
        for (const file of files) {
          const formData = new FormData();
          formData.append("file", file);
          
          await apiRequest("POST", `/api/threads/${thread.id}/files`, formData);
        }
      }
      
      toast({
        title: "Thread created",
        description: "Your thread has been created successfully",
      });
      
      // Navigate to the new thread
      navigate(`/thread/${thread.id}`);
    } catch (error: any) {
      toast({
        title: "Error creating thread",
        description: error.message || "Failed to create thread",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle file uploads
  const handleFileChange = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
  };
  
  if (!user) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Authentication Required</AlertTitle>
        <AlertDescription>
          You need to be logged in to create a thread. Please log in or sign up.
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a New Thread</CardTitle>
        <CardDescription>
          Start a discussion, ask a question, or share resources with the community.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter a descriptive title"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    Be specific and clear about your topic
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isSubmitting || categoriesLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories?.map((category: Category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose the most relevant category for your thread
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="tagIds"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Tags</FormLabel>
                    <FormDescription>
                      Select tags to help categorize your thread
                    </FormDescription>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    {!tagsLoading && tags?.map((tag: Tag) => (
                      <FormField
                        key={tag.id}
                        control={form.control}
                        name="tagIds"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={tag.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(tag.id.toString())}
                                  onCheckedChange={(checked) => {
                                    const value = field.value || [];
                                    const tagId = tag.id.toString();
                                    return checked
                                      ? field.onChange([...value, tagId])
                                      : field.onChange(
                                          value.filter((v) => v !== tagId)
                                        );
                                  }}
                                  disabled={isSubmitting}
                                />
                              </FormControl>
                              <FormLabel
                                className="font-normal"
                                style={{ color: tag.color }}
                              >
                                {tag.name}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your topic, question, or share information..."
                      className="min-h-[200px]"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    You can use markdown for formatting
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div>
              <FormLabel>Attachments</FormLabel>
              <FileUpload
                onChange={handleFileChange}
                multiple={true}
                maxSize={10 * 1024 * 1024} // 10MB
                disabled={isSubmitting}
              />
              <FormDescription>
                Attach files to your thread (max 10MB per file)
              </FormDescription>
            </div>
            
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Creating Thread..." : "Create Thread"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
