import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { ThreadCard } from "@/components/forum/thread-card";
import { useAuth } from "@/lib/auth";
import { Card } from "@/components/ui/card";

export default function Home() {
  const { user } = useAuth();

  // Fetch latest threads
  const { data: latestThreads = [] } = useQuery<any[]>({
    queryKey: ["/api/threads", { limit: 5 }],
  });

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <section className="py-12 md:py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
              Welcome to <span className="text-primary">ToatSoul</span> Industries
            </h1>
            <p className="text-xl text-foreground/80 max-w-2xl mx-auto">
              Welcome to ToatSoul Industries — where tech, creativity, and
              community collide. We're a team of homelab nerds, coders, and DIY
              enthusiasts on a mission to make smart homes and self-hosted tech
              simple, fun, and accessible for everyone.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/forums">
                <Button className="text-base px-6 py-3 h-auto">
                  Browse Forums
                </Button>
              </Link>
              {!user ? (
                <Button variant="outline" className="text-base px-6 py-3 h-auto" asChild>
                  <Link to="/forums">Join the Community</Link>
                </Button>
              ) : (
                <Button variant="outline" className="text-base px-6 py-3 h-auto" asChild>
                  <Link to="/new-thread">Create a Thread</Link>
                </Button>
              )}
            </div>
          </div>
        </section>

        {/* Latest Discussions */}
        <section className="my-8">
          <Card className="py-12 rounded-lg shadow-sm">
            <div className="px-4 sm:px-6 mb-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground">
                  Latest Discussions
                </h2>
                <Link to="/forums">
                  <Button variant="link" className="font-medium">
                    View All
                  </Button>
                </Link>
              </div>
            </div>

            <div className="space-y-4 px-4 sm:px-6">
              {latestThreads.length > 0 ? (
                <div>
                  {latestThreads.map((thread: any) => (
                    <div key={thread.id}>
                      <ThreadCard thread={thread} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-foreground/70">
                    No discussions yet. Be the first to create a thread!
                  </p>
                  <Link to="/new-thread">
                    <Button className="mt-4">Create Thread</Button>
                  </Link>
                </div>
              )}
            </div>
          </Card>
        </section>

        {/* Features Section */}
        <section className="py-12 md:py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary mb-4">
              Community Features
            </h2>
            <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
              Everything you need to connect, learn, and share with fellow
              professionals or enthusiasts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="h-full border border-gray-100">
              <div className="p-6">
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <svg
                    className="h-6 w-6 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Reputation-Based Forums
                </h3>
                <p className="text-foreground/70">
                  Participate in discussions and earn reputation through valuable
                  contributions. Reward interesting content and build your own
                  custom profile.
                </p>
              </div>
            </Card>

            <Card className="h-full border border-gray-100">
              <div className="p-6">
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <svg
                    className="h-6 w-6 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  File Sharing
                </h3>
                <p className="text-foreground/70">
                  Share resources, code samples, and documents with the community.
                  Download and view files directly within forum threads.
                </p>
              </div>
            </Card>

            <Card className="h-full border border-gray-100">
              <div className="p-6">
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <svg
                    className="h-6 w-6 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  User Profiles
                </h3>
                <p className="text-foreground/70">
                  Create your custom profile, showcase your expertise, and track
                  your contributions to the community.
                </p>
              </div>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="my-8">
          <Card className="py-12 md:py-16 bg-primary/5 rounded-lg mt-12">
            <div className="text-center px-4">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Ready to join the conversation?
              </h2>
              <p className="text-lg text-foreground/80 max-w-2xl mx-auto mb-8">
                Connect with professionals, share knowledge, and grow your network today.
              </p>
              <Link to="/forums">
                <Button className="text-base px-6 py-3 h-auto">
                  Get Started
                </Button>
              </Link>
            </div>
          </Card>
        </section>
      </main>
    </div>
  );
}