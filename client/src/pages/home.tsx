import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { ThreadCard } from "@/components/forum/thread-card";
import { useAuth } from "@/lib/auth";
import { 
  AnimatedContainer, 
  FadeIn, 
  SlideUpIn, 
  StaggerContainer,
  SlideLeftIn,
  SlideRightIn
} from "@/components/ui/animated-container";
import { PageContainer } from "@/components/ui/page-container";
import { AnimatedButton } from "@/components/ui/animated-button";
import { MotionCard } from "@/components/ui/motion-card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function Home() {
  const { user } = useAuth();

  // Fetch latest threads
  const { data: latestThreads = [], isLoading: threadsLoading } = useQuery<any[]>({
    queryKey: ["/api/threads", { limit: 5 }],
  });

  return (
    <PageContainer animationType="fade" duration={0.4}>
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <section className="py-12 md:py-16">
          <SlideUpIn className="text-center" duration={0.7}>
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
              Welcome to <span className="text-primary">ToatSoul</span> Industries
            </h1>
            <p className="text-xl text-foreground/80 max-w-2xl mx-auto">
              Welcome to ToatSoul Industries — where tech, creativity, and
              community collide. We're a team of homelab nerds, coders, and DIY
              enthusiasts on a mission to make smart homes and self-hosted tech
              simple, fun, and accessible for everyone. Whether you're setting up
              your first Raspberry Pi, building a killer home server, or just
              geeking out over automation tricks, we've built this space for you.
              Our goal is to share knowledge, spark ideas, and help you take
              control of your digital world, one project at a time.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/forums">
                <AnimatedButton 
                  className="text-base px-6 py-3 h-auto"
                  animationType="bounce"
                >
                  Browse Forums
                </AnimatedButton>
              </Link>
              {!user ? (
                <AnimatedButton
                  variant="outline"
                  className="text-base px-6 py-3 h-auto"
                  asChild
                  animationType="scale"
                >
                  <Link href="/forums">Join the Community</Link>
                </AnimatedButton>
              ) : (
                <AnimatedButton
                  variant="outline"
                  className="text-base px-6 py-3 h-auto"
                  asChild
                  animationType="scale"
                >
                  <Link href="/new-thread">Create a Thread</Link>
                </AnimatedButton>
              )}
            </div>
          </SlideUpIn>
        </section>

        {/* Latest Discussions */}
        <SlideLeftIn delay={0.2}>
          <MotionCard className="py-12 bg-white rounded-lg shadow-sm" hoverEffect="none">
            <div className="px-4 sm:px-6 mb-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  Latest Discussions
                </h2>
                <Link href="/forums">
                  <AnimatedButton variant="link" className="font-medium" animationType="scale">
                    View All
                  </AnimatedButton>
                </Link>
              </div>
            </div>

            <div className="space-y-4 px-4 sm:px-6">
              {threadsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <LoadingSpinner size="lg" text="Loading discussions..." variant="dots" />
                </div>
              ) : latestThreads.length > 0 ? (
                <AnimatedContainer 
                  animation="fade-in"
                  delay={0.1} 
                  staggerChildren={true}
                  staggerDelay={0.1}
                >
                  {latestThreads.map((thread: any) => (
                    <div key={thread.id} className="transform transition-all">
                      <ThreadCard thread={thread} />
                    </div>
                  ))}
                </AnimatedContainer>
              ) : (
                <FadeIn className="text-center py-8">
                  <p className="text-gray-500">
                    No discussions yet. Be the first to create a thread!
                  </p>
                  <Link href="/new-thread">
                    <AnimatedButton className="mt-4" animationType="bounce">Create Thread</AnimatedButton>
                  </Link>
                </FadeIn>
              )}
            </div>
          </MotionCard>
        </SlideLeftIn>

        {/* Features Section */}
        <section className="py-12 md:py-16">
          <SlideUpIn delay={0.3} className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary mb-4">
              Community Features
            </h2>
            <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
              Everything you need to connect, learn, and share with fellow
              professionals or enthusiasts.
            </p>
          </SlideUpIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <SlideUpIn delay={0.4}>
              <MotionCard className="h-full border border-gray-100" hoverEffect="lift">
                <div className="p-6">
                  <div className="h-12 w-12 bg-primary-50 rounded-lg flex items-center justify-center mb-4">
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
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Reputation-Based Forums
                  </h3>
                  <p className="text-gray-600">
                    Participate in discussions and earn reputation through valuable
                    contributions. Reward interesting content and build your own
                    custom profile, all while earning rewards for your efforts.
                  </p>
                </div>
              </MotionCard>
            </SlideUpIn>

            <SlideUpIn delay={0.5}>
              <MotionCard className="h-full border border-gray-100" hoverEffect="lift">
                <div className="p-6">
                  <div className="h-12 w-12 bg-primary-50 rounded-lg flex items-center justify-center mb-4">
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
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    File Sharing
                  </h3>
                  <p className="text-gray-600">
                    Share resources, code samples, and documents with the community.
                    Download and view files directly within forum threads.
                  </p>
                </div>
              </MotionCard>
            </SlideUpIn>

            <SlideUpIn delay={0.6}>
              <MotionCard className="h-full border border-gray-100" hoverEffect="lift">
                <div className="p-6">
                  <div className="h-12 w-12 bg-primary-50 rounded-lg flex items-center justify-center mb-4">
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
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    User Profiles
                  </h3>
                  <p className="text-gray-600">
                    Create your custom profile, showcase your expertise, and track
                    your contributions to the community. Earn rewards for your profile
                    and contributions by spending your points in the rewards store.
                  </p>
                </div>
              </MotionCard>
            </SlideUpIn>
          </div>
        </section>

        {/* CTA Section */}
        <SlideRightIn delay={0.7}>
          <MotionCard className="py-12 md:py-16 bg-primary-50 rounded-lg mt-12" hoverEffect="glow" glowColor="rgba(var(--primary), 0.2)">
            <div className="text-center px-4">
              <h2 className="text-3xl font-bold text-blue-800 mb-4">
                Ready to join the conversation?
              </h2>
              <p className="text-lg text-primary-700 max-w-2xl mx-auto mb-8">
                Connect with professionals, share knowledge, and grow your network
                today.
              </p>
              <Link href="/forums">
                <AnimatedButton 
                  className="text-base px-6 py-3 h-auto"
                  animationType="pulse"
                >
                  Get Started
                </AnimatedButton>
              </Link>
            </div>
          </MotionCard>
        </SlideRightIn>
      </main>
    </PageContainer>
  );
}