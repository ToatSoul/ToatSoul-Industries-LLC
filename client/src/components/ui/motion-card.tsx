import React from "react";
import { Card, type CardProps } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion, type MotionProps } from "framer-motion";

export interface MotionCardProps extends CardProps {
  hoverEffect?: "lift" | "scale" | "glow" | "border" | "none";
  clickEffect?: boolean;
  glowColor?: string;
  transitionDuration?: number;
  motionProps?: Omit<MotionProps, "className" | "children">;
  children?: React.ReactNode;
}

const MotionCard = React.forwardRef<HTMLDivElement, MotionCardProps>(
  ({ 
    hoverEffect = "lift", 
    clickEffect = true, 
    glowColor = "rgba(var(--primary), 0.3)",
    transitionDuration = 0.2,
    className, 
    motionProps,
    children, 
    ...props 
  }, ref) => {
    const getHoverAnimation = () => {
      switch (hoverEffect) {
        case "lift":
          return { y: -5 };
        case "scale":
          return { scale: 1.02 };
        case "glow":
          return { 
            boxShadow: `0 0 20px 5px ${glowColor}`,
            y: -2
          };
        case "border":
          return { 
            borderColor: "hsl(var(--primary))",
            y: -2
          };
        case "none":
          return {};
        default:
          return { y: -5 };
      }
    };

    return (
      <motion.div
        ref={ref}
        whileHover={hoverEffect !== "none" ? getHoverAnimation() : undefined}
        whileTap={clickEffect ? { scale: 0.98 } : undefined}
        transition={{ duration: transitionDuration }}
        {...motionProps}
      >
        <Card
          className={cn(
            "transition-all duration-300",
            hoverEffect === "glow" && "shadow-lg",
            className
          )}
          {...props}
        >
          {children}
        </Card>
      </motion.div>
    );
  }
);

MotionCard.displayName = "MotionCard";

export { MotionCard };