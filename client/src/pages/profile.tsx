import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { AvatarWithFallback } from "@/components/ui/avatar-with-fallback";
import { Skeleton } from "@/components/ui/skeleton";
import { ThreadCard } from "@/components/forum/thread-card";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/lib/auth";

export default function Profile() {
  const [, params] = useRoute("/profile/:id");
  const { user: currentUser } = useAuth();
  
  const userId = params?.id ? parseInt(params.id, 10) : 0;
  const isOwnProfile = currentUser?.id === userId;
  
  const { 
    data: profile, 
    isLoading, 
    isError 
  } = useQuery({
    queryKey: [`/api/users/${userId}`],
    enabled: !!userId,
  });
  
  if (isLoading) {
    return (
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col md:flex-row md:items-center">
              <Skeleton className="h-20 w-20 rounded-full mr-6" />
              <div className="mt-4 md:mt-0 flex-1">
                <Skeleton className="h-8 w-40 mb-2" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3 mt-2" />
          </CardContent>
        </Card>
        
        <div className="mt-6">
          <Skeleton className="h-10 w-64 mb-6" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-40 w-full" />
            ))}
          </div>
        </div>
      </main>
    );
  }
  
  if (isError || !profile) {
    return (
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-medium">User not found</p>
          <p>The user profile you're looking for doesn't exist or has been deleted.</p>
        </div>
        
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/forums">Back to Forums</Link>
        </Button>
      </main>
    );
  }
  
  const { user, threads } = profile;
  
  return (
    <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center">
            <AvatarWithFallback user={user} className="h-20 w-20 mr-6" />
            <div className="mt-4 md:mt-0">
              <CardTitle className="text-2xl">{user.name || user.username}</CardTitle>
              <CardDescription>
                Member since {formatDistanceToNow(new Date(threads[0]?.createdAt || Date.now()), { addSuffix: true })}
              </CardDescription>
            </div>
            
            {isOwnProfile && (
              <div className="mt-4 md:mt-0 md:ml-auto">
                <Button variant="outline" asChild>
                  <Link href="/settings">Edit Profile</Link>
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-primary-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-primary-600">{threads.length}</div>
              <div className="text-sm text-primary-800">Threads</div>
            </div>
            <div className="bg-primary-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-primary-600">{user.reputation || 0}</div>
              <div className="text-sm text-primary-800">Reputation</div>
            </div>
            <div className="bg-primary-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-primary-600">
                {threads.reduce((sum, thread) => sum + thread.commentCount, 0)}
              </div>
              <div className="text-sm text-primary-800">Comments</div>
            </div>
            <div className="bg-primary-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-primary-600">
                {threads.reduce((sum, thread) => sum + thread.views, 0)}
              </div>
              <div className="text-sm text-primary-800">Views</div>
            </div>
          </div>
          
          {user.bio && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">About</h3>
              <p className="text-gray-600 whitespace-pre-wrap">{user.bio}</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="mt-8">
        <Tabs defaultValue="threads">
          <TabsList>
            <TabsTrigger value="threads">Threads</TabsTrigger>
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          </TabsList>
          <TabsContent value="threads" className="mt-6">
            {threads.length > 0 ? (
              <div className="space-y-4">
                {threads.map(thread => (
                  <ThreadCard key={thread.id} thread={thread} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <h3 className="text-lg font-medium text-gray-900">No threads yet</h3>
                <p className="mt-1 text-gray-500">
                  {isOwnProfile 
                    ? "You haven't created any threads yet." 
                    : "This user hasn't created any threads yet."}
                </p>
                {isOwnProfile && (
                  <Button asChild className="mt-4">
                    <Link href="/new-thread">Create a Thread</Link>
                  </Button>
                )}
              </div>
            )}
          </TabsContent>
          <TabsContent value="activity" className="mt-6">
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-500">
                Activity feed is not available yet. Check back soon!
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
