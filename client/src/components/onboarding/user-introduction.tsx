
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const INTRO_STEPS = [
  {
    title: "Welcome to ToastSoul Industries!",
    description: "We're excited to have you join our community. Let's take a quick tour of what you can do here.",
  },
  {
    title: "Forums & Discussions",
    description: "Join discussions about tech, homelab setups, and DIY projects. Share your knowledge and learn from others in our forums.",
  },
  {
    title: "Reputation System",
    description: "Earn reputation points by contributing to discussions, helping others, and sharing valuable content. Use these points in our rewards store!",
  },
  {
    title: "Blog Posts",
    description: "Read and write blog posts about your projects, experiences, and technical insights. Share your journey with the community.",
  },
  {
    title: "Ready to Begin?",
    description: "You're all set! Start by exploring our forums or creating your first post. Remember, our community is here to help!",
  },
];

interface UserIntroductionProps {
  onComplete: () => void;
}

export function UserIntroduction({ onComplete }: UserIntroductionProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [open, setOpen] = useState(true);

  const handleNext = () => {
    if (currentStep < INTRO_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setOpen(false);
      onComplete();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{INTRO_STEPS[currentStep].title}</DialogTitle>
          <DialogDescription>{INTRO_STEPS[currentStep].description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={handleNext}>
            {currentStep === INTRO_STEPS.length - 1 ? "Get Started" : "Next"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
