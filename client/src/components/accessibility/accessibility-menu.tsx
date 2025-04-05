import React from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAccessibility, FontSize } from '@/lib/accessibility-context';
import { AccessibilityIcon, ZoomInIcon, MousePointerIcon, EyeIcon } from 'lucide-react';

export function AccessibilityMenu() {
  const {
    highContrastMode,
    reducedMotionMode,
    fontSize,
    toggleHighContrast,
    toggleReducedMotion,
    setFontSize
  } = useAccessibility();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="fixed bottom-4 right-4 lg:bottom-6 lg:right-6 z-50 shadow-lg rounded-full w-12 h-12 flex items-center justify-center"
          title="Accessibility Settings"
        >
          <AccessibilityIcon className="h-5 w-5" />
          <span className="sr-only">Accessibility Settings</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AccessibilityIcon className="h-5 w-5" />
            Accessibility Settings
          </DialogTitle>
          <DialogDescription>
            Customize your experience to improve accessibility.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="flex flex-col gap-6">
            {/* High Contrast Mode */}
            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-0.5">
                <Label 
                  htmlFor="high-contrast"
                  className="text-base flex items-center gap-2"
                >
                  <EyeIcon className="h-4 w-4" />
                  High Contrast
                </Label>
                <p className="text-sm text-muted-foreground">
                  Increases contrast for better visibility
                </p>
              </div>
              <Switch
                id="high-contrast"
                checked={highContrastMode}
                onCheckedChange={toggleHighContrast}
              />
            </div>
            
            {/* Reduced Motion */}
            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-0.5">
                <Label 
                  htmlFor="reduced-motion"
                  className="text-base flex items-center gap-2"
                >
                  <MousePointerIcon className="h-4 w-4" />
                  Reduced Motion
                </Label>
                <p className="text-sm text-muted-foreground">
                  Minimizes animations and transitions
                </p>
              </div>
              <Switch
                id="reduced-motion"
                checked={reducedMotionMode}
                onCheckedChange={toggleReducedMotion}
              />
            </div>
            
            {/* Font Size */}
            <div className="space-y-2">
              <Label 
                htmlFor="font-size"
                className="text-base flex items-center gap-2"
              >
                <ZoomInIcon className="h-4 w-4" />
                Font Size
              </Label>
              <p className="text-sm text-muted-foreground mb-2">
                Adjust text size for better readability
              </p>
              <Select
                value={fontSize}
                onValueChange={(value) => setFontSize(value as FontSize)}
              >
                <SelectTrigger id="font-size">
                  <SelectValue placeholder="Select a font size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="larger">Larger (110%)</SelectItem>
                  <SelectItem value="largest">Largest (125%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}