/**
 * UIModeRoot - Root component that conditionally renders App or AppV2 based on UI mode
 */

import { useState, useEffect } from 'react';
import { useUIMode, type UIMode } from '../contexts/UIModeContext';
import App from '../App';
import AppV2 from '../AppV2';

export function UIModeRoot() {
  const { uiMode } = useUIMode();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayMode, setDisplayMode] = useState<UIMode>(uiMode);

  useEffect(() => {
    if (displayMode !== uiMode) {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setDisplayMode(uiMode);
        setIsTransitioning(false);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [uiMode, displayMode]);

  return (
    <div
      style={{
        opacity: isTransitioning ? 0 : 1,
        transition: 'opacity 0.15s ease-in-out',
      }}
      className="ui-mode-root"
    >
      {displayMode === 'playground' ? <App /> : <AppV2 />}
    </div>
  );
}

