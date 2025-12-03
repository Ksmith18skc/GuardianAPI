/**
 * Scanning beam animation component
 */

interface ScanningBeamProps {
  isActive: boolean;
}

export function ScanningBeam({ isActive }: ScanningBeamProps) {
  if (!isActive) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 5,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '200px',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, var(--neon-primary), transparent)',
          opacity: 0.6,
          animation: 'scan-beam 2.5s ease-in-out infinite',
          filter: 'blur(20px)',
        }}
      />
    </div>
  );
}

