import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { ThreadCard } from "@/components/forum/thread-card";
import { useAuth } from "@/lib/auth";

export default function Home() {
  const { user } = useAuth();
  
  // Fetch latest threads
  const { data: latestThreads, isLoading: threadsLoading } = useQuery({
    queryKey: ['/api/threads', { limit: 5 }],
  });
  
  return (
    <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <section className="py-12 md:py-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Welcome to <span className="text-primary">ToastSoul</span> Industries
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A community platform for developers and designers to connect, share knowledge, and grow together.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/forums">
              <Button className="text-base px-6 py-3 h-auto">
                Browse Forums
              </Button>
            </Link>
            {!user ? (
              <Button 
                variant="outline" 
                className="text-base px-6 py-3 h-auto"
                asChild
              >
                <Link href="/forums">Join the Community</Link>
              </Button>
            ) : (
              <Button 
                variant="outline" 
                className="text-base px-6 py-3 h-auto"
                asChild
              >
                <Link href="/new-thread">Create a Thread</Link>
              </Button>
            )}
          </div>
        </div>
      </section>
      
      {/* Latest Discussions */}
      <section className="py-12 bg-white rounded-lg shadow-sm">
        <div className="px-4 sm:px-6 mb-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Latest Discussions</h2>
            <Link href="/forums">
              <Button variant="link" className="font-medium">
                View All
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="space-y-4 px-4 sm:px-6">
          {threadsLoading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="p-6 bg-gray-50 rounded-lg animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))
          ) : latestThreads?.length > 0 ? (
            latestThreads.map((thread: any) => (
              <ThreadCard key={thread.id} thread={thread} />
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No discussions yet. Be the first to create a thread!</p>
              <Link href="/new-thread">
                <Button className="mt-4">Create Thread</Button>
              </Link>
            </div>
          )}
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-12 md:py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Community Features
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Everything you need to connect, learn, and share with fellow professionals
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="h-12 w-12 bg-primary-50 rounded-lg flex items-center justify-center mb-4">
              <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Reputation-Based Forums
            </h3>
            <p className="text-gray-600">
              Participate in discussions and earn reputation through valuable contributions. Upvote helpful content and build your professional profile.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="h-12 w-12 bg-primary-50 rounded-lg flex items-center justify-center mb-4">
              <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              File Sharing
            </h3>
            <p className="text-gray-600">
              Share resources, code samples, and documents with the community. Download and view files directly within forum threads.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="h-12 w-12 bg-primary-50 rounded-lg flex items-center justify-center mb-4">
              <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              User Profiles
            </h3>
            <p className="text-gray-600">
              Create your professional profile, showcase your expertise, and track your contributions to the community.
            </p>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-12 md:py-16 bg-primary-50 rounded-lg mt-12">
        <div className="text-center px-4">
          <h2 className="text-3xl font-bold text-primary-800 mb-4">
            Ready to join the conversation?
          </h2>
          <p className="text-lg text-primary-700 max-w-2xl mx-auto mb-8">
            Connect with professionals, share knowledge, and grow your network today.
          </p>
          <Link href="/forums">
            <Button className="text-base px-6 py-3 h-auto">
              Get Started
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
