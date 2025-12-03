/**
 * Circular score gauge component
 */

import { useEffect, useRef } from 'react';

interface ScoreGaugeProps {
  score: number; // 0-1
  size?: number;
}

export function ScoreGauge({ score, size = 120 }: ScoreGaugeProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const circumference = 2 * Math.PI * (size / 2 - 10);
  const offset = circumference - (score * circumference);

  // Determine color based on score
  const getColor = () => {
    if (score < 0.3) return 'var(--neon-tertiary)';
    if (score < 0.6) return 'var(--color-warning)';
    return 'var(--color-danger)';
  };

  useEffect(() => {
    if (svgRef.current) {
      const circle = svgRef.current.querySelector('.gauge-circle') as SVGElement;
      if (circle) {
        circle.style.strokeDashoffset = `${offset}`;
      }
    }
  }, [score, offset]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--spacing-sm)',
      }}
    >
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg
          ref={svgRef}
          width={size}
          height={size}
          style={{ transform: 'rotate(-90deg)' }}
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={size / 2 - 10}
            fill="none"
            stroke="var(--bg-grid)"
            strokeWidth="8"
          />
          {/* Progress circle */}
          <circle
            className="gauge-circle"
            cx={size / 2}
            cy={size / 2}
            r={size / 2 - 10}
            fill="none"
            stroke={getColor()}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            style={{
              transition: 'stroke-dashoffset 1s ease-out, stroke 0.3s ease',
              filter: `drop-shadow(0 0 8px ${getColor()})`,
            }}
          />
        </svg>
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            fontFamily: 'JetBrains Mono, monospace',
          }}
        >
          <div
            style={{
              fontSize: '2rem',
              fontWeight: 700,
              color: getColor(),
            }}
          >
            {(score * 100).toFixed(0)}
          </div>
          <div
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
            }}
          >
            Score
          </div>
        </div>
      </div>
    </div>
  );
}

