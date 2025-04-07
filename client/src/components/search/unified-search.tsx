import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { Search, X, FileText, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  CommandDialog, 
  CommandInput, 
  CommandList, 
  CommandEmpty, 
  CommandGroup,
  CommandItem,
  CommandSeparator
} from "@/components/ui/command";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";

export type UnifiedSearchResult = {
  type: 'thread' | 'project';
  data: any;
};

type RecentSearch = {
  query: string;
  timestamp: number;
}

// Maximum number of recent searches to store
const MAX_RECENT_SEARCHES = 5;

// Helper function to load recent searches from localStorage
function loadRecentSearches(): RecentSearch[] {
  try {
    const saved = localStorage.getItem('recentSearches');
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.error('Failed to load recent searches:', e);
    return [];
  }
}

// Helper function to save recent searches to localStorage
function saveRecentSearch(query: string) {
  try {
    const searches = loadRecentSearches();
    
    // Remove any existing entries with the same query
    const filtered = searches.filter(s => s.query !== query);
    
    // Add the new search to the beginning
    const updated = [
      { query, timestamp: Date.now() },
      ...filtered,
    ].slice(0, MAX_RECENT_SEARCHES);
    
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save recent search:', e);
  }
}

export default function UnifiedSearch() {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [, setLocation] = useLocation();

  // Load recent searches when component mounts
  useEffect(() => {
    setRecentSearches(loadRecentSearches());
  }, []);

  // Keyboard shortcut to open search dialog
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Fetch search results when query changes
  const { data: searchResults, isLoading } = useQuery<UnifiedSearchResult[]>({
    queryKey: ['/api/unified-search', searchQuery],
    queryFn: async () => {
      if (searchQuery.trim().length > 1) {
        return await apiRequest(`/api/unified-search?q=${encodeURIComponent(searchQuery)}`);
      }
      return [] as UnifiedSearchResult[];
    },
    enabled: searchQuery.trim().length > 1,
    staleTime: 30000, // 30 seconds
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleSelectResult = (result: UnifiedSearchResult) => {
    setOpen(false);
    
    // Save the search query
    if (searchQuery.trim()) {
      saveRecentSearch(searchQuery);
      setRecentSearches(loadRecentSearches());
    }
    
    // Navigate based on result type
    if (result.type === 'thread') {
      setLocation(`/thread/${result.data.id}`);
    } else if (result.type === 'project') {
      setLocation(`/projects/${result.data.id}`);
    }
  };

  const handleSelectRecentSearch = (query: string) => {
    setSearchQuery(query);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const clearRecentSearches = () => {
    localStorage.removeItem('recentSearches');
    setRecentSearches([]);
  };

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-9 p-0 md:h-10 md:w-60 md:justify-start md:px-3 md:py-2"
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4 md:mr-2" />
        <span className="hidden md:inline-flex">Search...</span>
        <span className="sr-only md:not-sr-only md:ml-auto md:text-xs md:opacity-60">
          ⌘K
        </span>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <input
            ref={inputRef}
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
            placeholder="Search for anything..."
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0 opacity-50"
              onClick={() => handleSearch("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <CommandList>
          {searchQuery.trim().length <= 1 && recentSearches.length > 0 && (
            <>
              <CommandGroup heading="Recent Searches">
                {recentSearches.map((item) => (
                  <CommandItem
                    key={item.timestamp}
                    onSelect={() => handleSelectRecentSearch(item.query)}
                  >
                    <Search className="mr-2 h-4 w-4" />
                    <span>{item.query}</span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                    </span>
                  </CommandItem>
                ))}
                <CommandItem onSelect={clearRecentSearches} className="text-red-500 justify-end">
                  <X className="mr-2 h-4 w-4" />
                  <span>Clear history</span>
                </CommandItem>
              </CommandGroup>
              <CommandSeparator />
            </>
          )}

          {searchQuery.trim().length > 1 && (
            <>
              {isLoading ? (
                <CommandGroup heading="Searching...">
                  <CommandItem disabled>Loading results...</CommandItem>
                </CommandGroup>
              ) : searchResults && searchResults.length > 0 ? (
                <>
                  {/* Thread results */}
                  {searchResults.filter(r => r.type === 'thread').length > 0 && (
                    <CommandGroup heading="Forum Threads">
                      {searchResults
                        .filter(r => r.type === 'thread')
                        .map((result) => (
                          <CommandItem
                            key={`thread-${result.data.id}`}
                            onSelect={() => handleSelectResult(result)}
                          >
                            <FileText className="mr-2 h-4 w-4" />
                            <div className="flex flex-col">
                              <span className="font-medium">{result.data.title}</span>
                              <span className="text-xs text-muted-foreground">
                                By {result.data.author?.username || 'Unknown'} •{' '}
                                {formatDistanceToNow(new Date(result.data.createdAt), { addSuffix: true })}
                              </span>
                            </div>
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  )}

                  {/* Project results */}
                  {searchResults.filter(r => r.type === 'project').length > 0 && (
                    <CommandGroup heading="Projects">
                      {searchResults
                        .filter(r => r.type === 'project')
                        .map((result) => (
                          <CommandItem
                            key={`project-${result.data.id}`}
                            onSelect={() => handleSelectResult(result)}
                          >
                            <Users className="mr-2 h-4 w-4" />
                            <div className="flex flex-col">
                              <span className="font-medium">{result.data.title}</span>
                              <span className="text-xs text-muted-foreground">
                                Owner: {result.data.owner?.username || 'Unknown'} •{' '}
                                Status: {result.data.status}
                              </span>
                            </div>
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  )}
                </>
              ) : (
                <CommandEmpty>No results found.</CommandEmpty>
              )}
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}