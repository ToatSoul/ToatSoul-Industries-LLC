import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export interface AnimatedContainerProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  animation?: "fade-in" | "slide-up" | "slide-down" | "slide-left" | "slide-right" | "scale" | "none";
  staggerChildren?: boolean;
  staggerDelay?: number;
  hover?: "lift" | "scale" | "glow" | "none";
}

// Base AnimatedContainer component
export function AnimatedContainer({
  children,
  className,
  delay = 0,
  duration = 0.5,
  animation = "fade-in",
  staggerChildren = false,
  staggerDelay = 0.1,
  hover = "none",
}: AnimatedContainerProps) {
  // Animation variants based on type
  const containerVariants = {
    "fade-in": {
      hidden: { opacity: 0 },
      visible: { 
        opacity: 1,
        transition: { 
          duration,
          delay,
          staggerChildren: staggerChildren ? staggerDelay : 0,
        }
      }
    },
    "slide-up": {
      hidden: { opacity: 0, y: 20 },
      visible: { 
        opacity: 1, 
        y: 0,
        transition: { 
          duration,
          delay,
          staggerChildren: staggerChildren ? staggerDelay : 0,
        }
      }
    },
    "slide-down": {
      hidden: { opacity: 0, y: -20 },
      visible: { 
        opacity: 1, 
        y: 0,
        transition: { 
          duration,
          delay,
          staggerChildren: staggerChildren ? staggerDelay : 0,
        }
      }
    },
    "slide-left": {
      hidden: { opacity: 0, x: 20 },
      visible: { 
        opacity: 1, 
        x: 0,
        transition: { 
          duration,
          delay,
          staggerChildren: staggerChildren ? staggerDelay : 0,
        }
      }
    },
    "slide-right": {
      hidden: { opacity: 0, x: -20 },
      visible: { 
        opacity: 1, 
        x: 0,
        transition: { 
          duration,
          delay,
          staggerChildren: staggerChildren ? staggerDelay : 0,
        }
      }
    },
    "scale": {
      hidden: { opacity: 0, scale: 0.9 },
      visible: { 
        opacity: 1, 
        scale: 1,
        transition: { 
          duration,
          delay,
          staggerChildren: staggerChildren ? staggerDelay : 0,
        }
      }
    },
    "none": {
      hidden: {},
      visible: {
        transition: { 
          staggerChildren: staggerChildren ? staggerDelay : 0,
        }
      }
    }
  };

  // Child animation variants for staggered animations
  const childVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  // Hover animation based on type
  const getHoverAnimation = () => {
    switch (hover) {
      case "lift":
        return { y: -5 };
      case "scale":
        return { scale: 1.03 };
      case "glow":
        return { boxShadow: "0 0 8px 2px rgba(var(--primary), 0.3)" };
      case "none":
      default:
        return {};
    }
  };

  return (
    <motion.div
      className={cn(className)}
      initial="hidden"
      animate="visible"
      variants={containerVariants[animation]}
      whileHover={hover !== "none" ? getHoverAnimation() : undefined}
    >
      {staggerChildren 
        ? React.Children.map(children, child => (
            <motion.div variants={childVariants}>
              {child}
            </motion.div>
          ))
        : children
      }
    </motion.div>
  );
}

// Specific animation component implementations
export interface SpecificAnimationProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}

// Fade In animation
export function FadeIn({ 
  children, 
  className, 
  delay = 0, 
  duration = 0.5 
}: SpecificAnimationProps) {
  return (
    <AnimatedContainer 
      animation="fade-in" 
      className={className} 
      delay={delay} 
      duration={duration}
    >
      {children}
    </AnimatedContainer>
  );
}

// Scale In animation
export function ScaleIn({ 
  children, 
  className, 
  delay = 0, 
  duration = 0.5 
}: SpecificAnimationProps) {
  return (
    <AnimatedContainer 
      animation="scale" 
      className={className} 
      delay={delay} 
      duration={duration}
    >
      {children}
    </AnimatedContainer>
  );
}

// Slide Up animation
export function SlideUpIn({ 
  children, 
  className, 
  delay = 0, 
  duration = 0.5 
}: SpecificAnimationProps) {
  return (
    <AnimatedContainer 
      animation="slide-up" 
      className={className} 
      delay={delay} 
      duration={duration}
    >
      {children}
    </AnimatedContainer>
  );
}

// Slide Down animation
export function SlideDownIn({ 
  children, 
  className, 
  delay = 0, 
  duration = 0.5 
}: SpecificAnimationProps) {
  return (
    <AnimatedContainer 
      animation="slide-down" 
      className={className} 
      delay={delay} 
      duration={duration}
    >
      {children}
    </AnimatedContainer>
  );
}

// Slide Left animation
export function SlideLeftIn({ 
  children, 
  className, 
  delay = 0, 
  duration = 0.5 
}: SpecificAnimationProps) {
  return (
    <AnimatedContainer 
      animation="slide-left" 
      className={className} 
      delay={delay} 
      duration={duration}
    >
      {children}
    </AnimatedContainer>
  );
}

// Slide Right animation
export function SlideRightIn({ 
  children, 
  className, 
  delay = 0, 
  duration = 0.5 
}: SpecificAnimationProps) {
  return (
    <AnimatedContainer 
      animation="slide-right" 
      className={className} 
      delay={delay} 
      duration={duration}
    >
      {children}
    </AnimatedContainer>
  );
}

// Stagger container with children animations
export function StaggerContainer({ 
  children, 
  className, 
  delay = 0, 
  duration = 0.5 
}: SpecificAnimationProps) {
  return (
    <AnimatedContainer 
      animation="fade-in"
      className={className} 
      delay={delay} 
      duration={duration}
      staggerChildren={true}
      staggerDelay={0.1}
    >
      {children}
    </AnimatedContainer>
  );
}