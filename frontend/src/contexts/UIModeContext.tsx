/**
 * UI Mode Context - Manages switching between Playground and Terminal modes
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UIMode = 'playground' | 'terminal';

interface UIModeContextType {
  uiMode: UIMode;
  toggleUIMode: () => void;
  setUIMode: (mode: UIMode) => void;
}

const UIModeContext = createContext<UIModeContextType | undefined>(undefined);

export function UIModeProvider({ children }: { children: ReactNode }) {
  const [uiMode, setUIModeState] = useState<UIMode>(() => {
    // Check localStorage first
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('guardian-ui-mode') as UIMode;
      if (saved === 'playground' || saved === 'terminal') {
        return saved;
      }
    }
    // Default to playground
    return 'playground';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('guardian-ui-mode', uiMode);
    }
  }, [uiMode]);

  // Keyboard shortcut: Press 'T' to toggle UI mode
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only trigger if not typing in an input/textarea
      if (e.key.toLowerCase() === 't' && 
          e.target instanceof HTMLElement && 
          e.target.tagName !== 'INPUT' && 
          e.target.tagName !== 'TEXTAREA' &&
          !e.target.isContentEditable) {
        setUIModeState((prev) => (prev === 'playground' ? 'terminal' : 'playground'));
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const setUIMode = (mode: UIMode) => {
    setUIModeState(mode);
  };

  const toggleUIMode = () => {
    setUIModeState((prev) => (prev === 'playground' ? 'terminal' : 'playground'));
  };

  return (
    <UIModeContext.Provider value={{ uiMode, toggleUIMode, setUIMode }}>
      {children}
    </UIModeContext.Provider>
  );
}

export function useUIMode() {
  const context = useContext(UIModeContext);
  if (context === undefined) {
    throw new Error('useUIMode must be used within a UIModeProvider');
  }
  return context;
}

