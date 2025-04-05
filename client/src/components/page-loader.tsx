import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { cn } from "@/lib/utils";

interface PageLoaderProps {
  isLoading: boolean;
  text?: string;
  fullScreen?: boolean;
  spinnerSize?: "sm" | "md" | "lg" | "xl";
  spinnerVariant?: "spinner" | "dots" | "pulse" | "bounce";
  className?: string;
}

export function PageLoader({
  isLoading,
  text = "Loading...",
  fullScreen = false,
  spinnerSize = "lg",
  spinnerVariant = "spinner",
  className,
}: PageLoaderProps) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className={cn(
            "flex flex-col justify-center items-center z-50",
            fullScreen
              ? "fixed inset-0 bg-background/90 backdrop-blur-sm"
              : "w-full h-[400px]",
            className
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <LoadingSpinner 
              size={spinnerSize} 
              text={text}
              variant={spinnerVariant}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}