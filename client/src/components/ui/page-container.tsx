import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { LoadingSpinner } from "./loading-spinner";

export interface PageContainerProps {
  children: React.ReactNode;
  containerClassName?: string;
  contentClassName?: string;
  className?: string;
  animate?: boolean;
  animationType?: "fade" | "slide" | "scale" | "none";
  duration?: number;
}

export function PageContainer({
  children,
  containerClassName,
  contentClassName,
  className,
  animate = true,
  animationType = "fade",
  duration = 0.3,
}: PageContainerProps) {
  
  // Define animation variants
  const variants = {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },
    slide: {
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 10 },
    },
    scale: {
      initial: { opacity: 0, scale: 0.97 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.97 },
    },
    none: {
      initial: {},
      animate: {},
      exit: {},
    }
  };

  // Select the appropriate variant
  const selectedVariant = animate ? variants[animationType] || variants.fade : variants.none;

  // Handle loading state
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 100);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" variant="dots" />
      </div>
    );
  }

  return (
    <div className={cn("w-full min-h-[calc(100vh-8rem)]", containerClassName)}>
      <motion.div
        initial={selectedVariant.initial}
        animate={selectedVariant.animate}
        exit={selectedVariant.exit}
        transition={{ duration }}
        className={cn("w-full h-full", contentClassName, className)}
      >
        {children}
      </motion.div>
    </div>
  );
}