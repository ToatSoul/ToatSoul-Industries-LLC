import React from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface AnimatedButtonProps extends ButtonProps {
  animateOnHover?: boolean;
  animateOnTap?: boolean;
  animateScale?: number;
  animateColor?: boolean;
  animationType?: "bounce" | "scale" | "glow" | "pulse";
  children: React.ReactNode;
}

const AnimatedButton = React.forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({
    animateOnHover = true,
    animateOnTap = true,
    animateScale = 0.97,
    animateColor = false,
    animationType = "scale",
    className,
    children,
    ...props
  }, ref) => {
    // Define animation variants based on type
    const getAnimationProps = () => {
      if (!animateOnHover && !animateOnTap) return {};

      const baseProps: { [key: string]: any } = {};

      if (animationType === "bounce") {
        if (animateOnHover) {
          baseProps.whileHover = { y: -4, transition: { type: "spring", stiffness: 400 } };
        }
        if (animateOnTap) {
          baseProps.whileTap = { y: 2, scale: animateScale };
        }
      } else if (animationType === "glow") {
        if (animateOnHover) {
          baseProps.whileHover = { 
            boxShadow: `0 0 12px 2px var(--primary)`, 
            scale: 1.01,
            transition: { duration: 0.2 }
          };
        }
        if (animateOnTap) {
          baseProps.whileTap = { scale: animateScale };
        }
      } else if (animationType === "pulse") {
        baseProps.animate = {
          scale: [1, 1.03, 1],
          transition: {
            duration: 2,
            ease: "easeInOut",
            repeat: Infinity,
          }
        };
      } else {
        // Default 'scale' animation
        if (animateOnHover) {
          baseProps.whileHover = { scale: 1.03, transition: { duration: 0.2 } };
        }
        if (animateOnTap) {
          baseProps.whileTap = { scale: animateScale };
        }
      }

      return baseProps;
    };

    return (
      <motion.div
        className="inline-block relative"
        {...getAnimationProps()}
      >
        <Button
          ref={ref}
          className={cn(
            animationType === "glow" && "transition-shadow duration-300",
            animateColor && "transition-colors duration-300",
            className
          )}
          {...props}
        >
          {children}
        </Button>
      </motion.div>
    );
  }
);

AnimatedButton.displayName = "AnimatedButton";

export { AnimatedButton };