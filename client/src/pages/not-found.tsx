import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft, Home } from "lucide-react";
import { Link } from "wouter";
import { 
  ScaleIn, 
  SlideUpIn, 
  StaggerContainer 
} from "@/components/ui/animated-container";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="container min-h-[calc(100vh-8rem)] w-full flex flex-col items-center justify-center">
      <ScaleIn 
        className="w-full max-w-md mx-4 text-center"
        duration={0.5}
      >
        <Card className="w-full border-destructive/20 bg-card/50 backdrop-blur-sm shadow-lg">
          <CardContent className="pt-10 pb-6 px-8">
            <StaggerContainer className="space-y-6">
              <div>
                <motion.div 
                  className="mx-auto relative w-24 h-24"
                  animate={{ 
                    rotate: [0, -5, 0, 5, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <div className="absolute inset-0 bg-destructive/10 rounded-full opacity-60 blur-xl animate-pulse" />
                  <div className="relative flex items-center justify-center w-full h-full rounded-full bg-background/80 border border-destructive/40">
                    <AlertCircle className="h-12 w-12 text-destructive" />
                  </div>
                </motion.div>
              </div>
              
              <div>
                <h1 className="text-4xl font-bold text-foreground tracking-tight mb-2">404</h1>
                <p className="text-xl text-foreground/80 font-medium">Page Not Found</p>
              </div>
              
              <div>
                <p className="text-muted-foreground text-sm">
                  The page you're looking for doesn't exist or has been moved.
                </p>
              </div>
            </StaggerContainer>
          </CardContent>
          <CardFooter className="flex gap-4 pb-8 px-8 justify-center">
            <SlideUpIn delay={0.6}>
              <Button asChild variant="outline" size="sm" className="gap-2">
                <Link href="/">
                  <Home className="h-4 w-4" />
                  <span>Home</span>
                </Link>
              </Button>
            </SlideUpIn>
            <SlideUpIn delay={0.7}>
              <Button asChild variant="ghost" size="sm" className="gap-2">
                <a onClick={() => window.history.back()}>
                  <ArrowLeft className="h-4 w-4" />
                  <span>Go Back</span>
                </a>
              </Button>
            </SlideUpIn>
          </CardFooter>
        </Card>
      </ScaleIn>
    </div>
  );
}
