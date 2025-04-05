import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl";
  thickness?: "thin" | "normal" | "thick";
  color?: string;
  text?: string;
  textPosition?: "top" | "bottom" | "right" | "left";
  variant?: "spinner" | "dots" | "pulse" | "bounce";
}

export function LoadingSpinner({
  size = "md",
  thickness = "normal",
  color,
  text,
  textPosition = "bottom",
  variant = "spinner",
  className,
  ...props
}: LoadingSpinnerProps) {
  // Size mapping
  const sizeMap = {
    sm: "h-5 w-5",
    md: "h-8 w-8",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  };

  // Thickness mapping
  const thicknessMap = {
    thin: "border-2",
    normal: "border-3",
    thick: "border-4",
  };

  // Text positioning
  const textPositionClasses = {
    top: "flex-col-reverse",
    bottom: "flex-col",
    left: "flex-row-reverse items-center",
    right: "flex-row items-center",
  };

  const renderSpinner = () => {
    switch (variant) {
      case "dots":
        return (
          <div className={cn("flex space-x-1", sizeMap[size])}>
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className={cn(
                  "rounded-full",
                  color ? color : "bg-primary",
                  size === "sm" ? "h-1.5 w-1.5" :
                  size === "md" ? "h-2 w-2" :
                  size === "lg" ? "h-3 w-3" : "h-4 w-4"
                )}
                animate={{ y: ["0%", "-50%", "0%"] }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        );
      
      case "pulse":
        return (
          <motion.div
            className={cn(
              "rounded-full",
              color ? color : "bg-primary",
              sizeMap[size]
            )}
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.6, 0.8, 0.6]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        );
      
      case "bounce":
        return (
          <div className="flex items-center space-x-1.5">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className={cn(
                  "rounded-full",
                  color ? color : "bg-primary",
                  size === "sm" ? "h-1.5 w-1.5" :
                  size === "md" ? "h-2.5 w-2.5" :
                  size === "lg" ? "h-3.5 w-3.5" : "h-5 w-5"
                )}
                animate={{ y: ["0%", "-100%", "0%"] }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        );
      
      // Default spinner
      default:
        return (
          <div 
            className={cn(
              "rounded-full animate-spin",
              color ? `border-l-${color} border-t-${color}` : "border-l-primary border-t-primary",
              "border-transparent",
              thicknessMap[thickness],
              sizeMap[size]
            )}
          />
        );
    }
  };

  return (
    <div 
      className={cn(
        "flex gap-3",
        textPositionClasses[textPosition],
        className
      )}
      {...props}
    >
      {renderSpinner()}
      {text && (
        <p className={cn(
          "text-foreground/80 animate-pulse",
          size === "sm" ? "text-xs" : 
          size === "md" ? "text-sm" : 
          size === "lg" ? "text-base" : "text-lg"
        )}>
          {text}
        </p>
      )}
    </div>
  );
}