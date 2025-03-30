import { useState, useEffect } from "react";
import { useLocation, useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { CategorySidebar } from "@/components/forum/category-sidebar";
import { ThreadCard } from "@/components/forum/thread-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import AuthModal from "@/components/auth-modal";

export default function Forums() {
  const [location, navigate] = useLocation();
  const [categoryMatch, params] = useRoute("/forums/category/:categoryId");
  const { user } = useAuth();
  const { toast } = useToast();
  const [showAuthModal, setShowAuthModal] = useState<"login" | "signup" | null>(null);

  // Pagination and filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("latest");
  const [filterBy, setFilterBy] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isVoting, setIsVoting] = useState(false);

  const openLoginModal = () => setShowAuthModal("login");
  const openSignupModal = () => setShowAuthModal("signup");
  const closeAuthModal = () => setShowAuthModal(null);

  // Extract query params
  useEffect(() => {
    const url = new URL(window.location.href);
    const q = url.searchParams.get("q");
    if (q) {
      setSearchQuery(q);
    }
  }, [location]);

  // Get categoryId from route if available
  const categoryId = categoryMatch ? parseInt(params.categoryId, 10) : undefined;

  // Fetch category data if we're viewing a specific category
  const { data: category } = useQuery({
    queryKey: ['/api/categories', categoryId],
    enabled: !!categoryId,
  });

  // Fetch threads
  const pageSize = 10;
  const offset = (currentPage - 1) * pageSize;

  const getQueryKey = () => {
    // For search
    if (searchQuery.trim()) {
      return ['/api/search', { q: searchQuery.trim() }];
    }

    // For regular thread listing
    return ['/api/threads', {
      categoryId,
      limit: pageSize,
      offset,
      sortBy,
      filterBy
    }];
  };

  const {
    data: threads,
    isLoading: threadsLoading,
    isError: threadsError
  } = useQuery({
    queryKey: getQueryKey(),
  });

  // Handle voting on threads
  const handleVote = async (threadId: number, value: number) => {
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

      // Invalidate the threads query to refresh the vote counts
      queryClient.invalidateQueries({ queryKey: getQueryKey() });

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

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/forums?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/forums");
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
    navigate("/forums");
  };

  const totalPages = 10; // This should come from API in a real implementation

  return (
    <>
    <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-3">
          <CategorySidebar activeCategoryId={categoryId} />
        </div>

        {/* Main content area */}
        <div className="lg:col-span-9">
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div className="flex-1 w-full sm:max-w-md">
                <form onSubmit={handleSearch}>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <Input
                      type="text"
                      className="pl-10 pr-3 py-2"
                      placeholder="Search this forum..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  {searchQuery.trim() && (
                    <Button
                      variant="link"
                      onClick={clearSearch}
                      className="px-0 mt-1 h-auto"
                    >
                      Clear search and return to forums
                    </Button>
                  )}
                </form>
              </div>
              <div className="mt-4 sm:mt-0">
                <Button asChild className="sm:whitespace-nowrap">
                  <Link href="/new-thread">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    New Thread
                  </Link>
                </Button>
              </div>
            </div>
          </div>


          {/* Auth check */}
          {!user ? (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-4">Please Log In</h2>
              <p className="text-gray-600 mb-6">You need to be logged in to participate in forum discussions.</p>
              <Button onClick={openLoginModal}> {/*openLoginModal is assumed to exist*/}
                Log In
              </Button>
            </div>
          ) : (
            <>
              {/* Filter controls */}
              <div className="bg-white p-4 rounded-lg shadow mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                  <div className="flex items-center space-x-4">
                    <div>
                      <label htmlFor="sort" className="block text-sm font-medium text-gray-700">Sort by</label>
                      <Select
                        value={sortBy}
                        onValueChange={setSortBy}
                      >
                        <SelectTrigger id="sort" className="w-[180px]">
                          <SelectValue placeholder="Latest" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="latest">Latest</SelectItem>
                          <SelectItem value="popular">Most Popular</SelectItem>
                          <SelectItem value="replies">Most Replied</SelectItem>
                          <SelectItem value="updated">Recently Updated</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label htmlFor="filter" className="block text-sm font-medium text-gray-700">Filter</label>
                      <Select
                        value={filterBy}
                        onValueChange={setFilterBy}
                      >
                        <SelectTrigger id="filter" className="w-[180px]">
                          <SelectValue placeholder="All Threads" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Threads</SelectItem>
                          <SelectItem value="answered">Answered</SelectItem>
                          <SelectItem value="unanswered">Unanswered</SelectItem>
                          <SelectItem value="attachments">With Attachments</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                </div>
              </div>

              {/* Forum threads list */}
              <div className="space-y-4">
                {threadsLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <div key={i} className="p-6 bg-white rounded-lg shadow animate-pulse">
                      <div className="flex">
                        <div className="w-10 h-20 bg-gray-200 rounded mr-4"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                          <div className="flex gap-2">
                            <div className="h-4 bg-gray-200 rounded w-20"></div>
                            <div className="h-4 bg-gray-200 rounded w-20"></div>
                            <div className="h-4 bg-gray-200 rounded w-20"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : threadsError ? (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    <p>Failed to load threads. Please try again later.</p>
                  </div>
                ) : threads?.length > 0 ? (
                  threads.map((thread: any) => (
                    <ThreadCard
                      key={thread.id}
                      thread={thread}
                      onVote={(value) => handleVote(thread.id, value)}
                      userVote={thread.userVote?.value}
                    />
                  ))
                ) : (
                  <div className="bg-white rounded-lg shadow p-8 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <h3 className="mt-2 text-lg font-medium text-gray-900">No threads found</h3>
                    <p className="mt-1 text-gray-500">
                      {searchQuery.trim()
                        ? "No results match your search criteria."
                        : "Be the first to start a discussion!"}
                    </p>
                    <div className="mt-6">
                      {searchQuery.trim() ? (
                        <Button onClick={clearSearch} variant="outline">
                          Clear Search
                        </Button>
                      ) : (
                        <Button asChild>
                          <Link href="/new-thread">Create Thread</Link>
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {/* Pagination */}
                {threads?.length > 0 && (
                  <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow">
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-700">
                          Showing <span className="font-medium">{offset + 1}</span> to <span className="font-medium">{Math.min(offset + pageSize, offset + threads.length)}</span> of <span className="font-medium">{/* This should come from API */}97</span> results
                        </p>
                      </div>
                      <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                          <Button
                            variant="outline"
                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-gray-500"
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage <= 1}
                          >
                            <span className="sr-only">Previous</span>
                            <ChevronLeft className="h-5 w-5" />
                          </Button>

                          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                            // Show pages around the current page
                            let pageNum;
                            if (totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (currentPage <= 3) {
                              pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                            } else {
                              pageNum = currentPage - 2 + i;
                            }

                            return (
                              <Button
                                key={pageNum}
                                variant={currentPage === pageNum ? "default" : "outline"}
                                className={`relative inline-flex items-center px-4 py-2 border ${
                                  currentPage === pageNum ? "bg-primary-50 text-primary-600" : "bg-white text-gray-500"
                                }`}
                                onClick={() => setCurrentPage(pageNum)}
                              >
                                {pageNum}
                              </Button>
                            );
                          })}

                          <Button
                            variant="outline"
                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-gray-500"
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage >= totalPages}
                          >
                            <span className="sr-only">Next</span>
                            <ChevronRight className="h-5 w-5" />
                          </Button>
                        </nav>
                      </div>
                    </div>
                    <div className="flex sm:hidden justify-between w-full">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage <= 1}
                      >
                        Previous
                      </Button>
                      <div className="text-sm text-gray-700">
                        <span>Page {currentPage} of {totalPages}</span>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage >= totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </main>
    <AuthModal
      mode={showAuthModal}
      onClose={closeAuthModal}
      onToggleMode={() => setShowAuthModal(showAuthModal === "login" ? "signup" : "login")}
    />
    </>
  );
}