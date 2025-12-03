/**
 * Main layout component
 */

import type { ReactNode } from 'react';
import { Header } from './Header';
import { BackgroundEffects } from './BackgroundEffects';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div
      style={{
        minHeight: '100vh',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <BackgroundEffects />
      <Header />
      <main
        style={{
          flex: 1,
          position: 'relative',
          zIndex: 10,
          padding: 'var(--spacing-xl) 0',
        }}
      >
        <div className="container">{children}</div>
      </main>
    </div>
  );
}

