/**
 * Theme management hook for AppV2
 */

import { useState, useEffect } from 'react';
import type { Theme } from '../types/api';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check localStorage first
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('guardian-theme') as Theme;
      if (saved === 'light' || saved === 'dark') {
        return saved;
      }
    }
    
    // Default to dark for cybernetic aesthetic
    return 'dark';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      root.setAttribute('data-theme', theme);
      localStorage.setItem('guardian-theme', theme);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return { theme, toggleTheme, setTheme };
}

