import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Category } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AvatarWithFallback } from "@/components/ui/avatar-with-fallback";
import { cn } from "@/lib/utils";

// Icons for categories
const getCategoryIcon = (icon?: string | null) => {
  switch (icon) {
    case 'laptop-code':
      return (
        <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      );
    case 'paint-brush':
      return (
        <svg className="w-5 h-5 text-secondary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    case 'globe':
      return (
        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      );
    case 'question-circle':
      return (
        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'bullhorn':
      return (
        <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
        </svg>
      );
    default:
      return (
        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
        </svg>
      );
  }
};

interface CategorySidebarProps {
  activeCategoryId?: number;
}

export function CategorySidebar({ activeCategoryId }: CategorySidebarProps) {
  const [location, navigate] = useLocation();

  const { data: categories = [], isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  // Define a type for top contributors that matches the User schema but with partial fields
  type TopContributor = {
    id: number;
    username: string;
    name: string;
    reputation: number;
    avatarUrl?: string | null;
    // Additional fields that would be in the User type but not used here are omitted
    email?: string;
    password?: string;
    bio?: string | null;
    isAdmin?: boolean;
  };

  // This would normally be a real API call
  const { data: topContributors = [], isLoading: contributorsLoading } = useQuery<TopContributor[]>({
    queryKey: ['/api/users/top-contributors'],
    queryFn: async () => {
      // Since this is a demo, we'll return some mock data
      return [
        { id: 1, username: 'alexjohnson', name: 'Alex Johnson', reputation: 1254, avatarUrl: undefined },
        { id: 2, username: 'sarahlee', name: 'Sarah Lee', reputation: 956, avatarUrl: undefined },
        { id: 3, username: 'michaelsmith', name: 'Michael Smith', reputation: 843, avatarUrl: undefined },
      ];
    }
  });

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <CardHeader className="bg-primary-50 border-b border-primary-100 py-4">
          <CardTitle className="text-lg font-semibold text-primary-800">
            Forum Categories
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-200">
            {categoriesLoading ? (
              Array(5).fill(0).map((_, i) => (
                <div key={i} className="p-4 flex items-center">
                  <Skeleton className="h-5 w-5 rounded-full mr-3" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))
            ) : (
              categories?.map((category: Category) => (
                <div key={category.id} 
                  className={cn(
                    "block p-4 hover:bg-gray-50 cursor-pointer",
                    activeCategoryId === category.id && "bg-gray-100 dark:bg-gray-800"
                  )}
                  onClick={() => navigate(`/new-thread?category=${category.id}`)}
                >
                  <div className="flex items-center">
                    <div className="mr-3">{getCategoryIcon(category.icon)}</div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{category.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{category.description}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader className="bg-primary-50 border-b border-primary-100 py-4">
          <CardTitle className="text-lg font-semibold text-primary-800">
            Top Contributors
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-200">
            {contributorsLoading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="p-4 flex items-center">
                  <Skeleton className="h-10 w-10 rounded-full mr-3" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              ))
            ) : (
              topContributors?.map((user: TopContributor) => (
                <div key={user.id} className="p-4 flex items-center">
                  <AvatarWithFallback user={user} className="h-10 w-10 mr-3" />
                  <div>
                    <p className="font-medium text-white">{user.name || user.username}</p>
                    <div className="flex items-center">
                      <span className="text-xs text-gray-500">Reputation:</span>
                      <span className="ml-1 text-xs font-medium text-green-600">{user.reputation}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}