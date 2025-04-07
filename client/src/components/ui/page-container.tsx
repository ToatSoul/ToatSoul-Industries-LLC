import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

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

  const selectedVariant = animate ? variants[animationType] || variants.fade : variants.none;

  return (
    <div className={cn("w-full min-h-[calc(100vh-8rem)]", containerClassName)}>
      <motion.div
        initial={selectedVariant.initial}
        animate={selectedVariant.animate}
        exit={selectedVariant.exit}
        transition={{ duration }}
        className={cn("w-full", contentClassName, className)}
      >
        {children}
      </motion.div>
    </div>
  );
}