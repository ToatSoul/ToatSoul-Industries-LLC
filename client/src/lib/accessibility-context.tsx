import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type AccessibilityMode = 'default' | 'high-contrast' | 'reduced-motion';
export type FontSize = 'default' | 'larger' | 'largest';

interface AccessibilityContextType {
  highContrastMode: boolean;
  reducedMotionMode: boolean;
  fontSize: FontSize;
  toggleHighContrast: () => void;
  toggleReducedMotion: () => void;
  setFontSize: (size: FontSize) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

interface AccessibilityProviderProps {
  children: ReactNode;
}

export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  // Initialize state with saved preferences or defaults
  const [highContrastMode, setHighContrastMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('highContrastMode');
      return saved ? JSON.parse(saved) : false;
    }
    return false;
  });
  
  const [reducedMotionMode, setReducedMotionMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      // Also check system preference for reduced motion
      const systemReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const saved = localStorage.getItem('reducedMotionMode');
      return saved ? JSON.parse(saved) : systemReducedMotion;
    }
    return false;
  });
  
  const [fontSize, setFontSizeState] = useState<FontSize>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('fontSize');
      return saved ? (saved as FontSize) : 'default';
    }
    return 'default';
  });

  // Update document classes when preferences change
  useEffect(() => {
    // High contrast mode
    if (highContrastMode) {
      document.documentElement.classList.add('high-contrast-mode');
    } else {
      document.documentElement.classList.remove('high-contrast-mode');
    }
    
    // Persist to localStorage
    localStorage.setItem('highContrastMode', JSON.stringify(highContrastMode));
  }, [highContrastMode]);

  // Handle reduced motion preference
  useEffect(() => {
    if (reducedMotionMode) {
      document.documentElement.classList.add('reduced-motion');
    } else {
      document.documentElement.classList.remove('reduced-motion');
    }
    
    // Persist to localStorage
    localStorage.setItem('reducedMotionMode', JSON.stringify(reducedMotionMode));
  }, [reducedMotionMode]);

  // Handle font size changes
  useEffect(() => {
    // Remove any existing font size classes
    document.documentElement.classList.remove('font-size-larger', 'font-size-largest');
    
    // Add class based on selected font size
    if (fontSize !== 'default') {
      document.documentElement.classList.add(`font-size-${fontSize}`);
    }
    
    // Persist to localStorage
    localStorage.setItem('fontSize', fontSize);
  }, [fontSize]);

  // Toggle functions
  const toggleHighContrast = () => setHighContrastMode(prev => !prev);
  const toggleReducedMotion = () => setReducedMotionMode(prev => !prev);
  const setFontSize = (size: FontSize) => setFontSizeState(size);

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (e: MediaQueryListEvent) => {
      // Only automatically update if the user hasn't explicitly set a preference
      if (localStorage.getItem('reducedMotionMode') === null) {
        setReducedMotionMode(e.matches);
      }
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
    
    return undefined;
  }, []);

  return (
    <AccessibilityContext.Provider 
      value={{ 
        highContrastMode, 
        reducedMotionMode, 
        fontSize,
        toggleHighContrast, 
        toggleReducedMotion, 
        setFontSize
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}