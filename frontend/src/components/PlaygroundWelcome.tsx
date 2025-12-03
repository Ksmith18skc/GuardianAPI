/**
 * PlaygroundWelcome - Welcome panel for empty state in Playground Mode
 */

interface PlaygroundWelcomeProps {
  onExampleClick: (text: string) => void;
}

const exampleInputs = [
  "You're an idiot",
  "Women can't code",
  "I will hurt you",
  "Shut up",
  "Have a nice day!",
];

export function PlaygroundWelcome({ onExampleClick }: PlaygroundWelcomeProps) {
  return (
    <div className="panel fade-in">
      {/* Header with Icon */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--spacing-md)',
          marginBottom: 'var(--spacing-lg)',
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, var(--neon-primary) 0%, var(--neon-tertiary) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)',
            animation: 'pulse-glow 2s infinite',
          }}
        >
          🛡️
        </div>
        <div>
          <h2
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '1.5rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '2px',
              margin: 0,
              marginBottom: 'var(--spacing-xs)',
              color: 'var(--neon-primary)',
              textShadow: '0 0 10px var(--neon-primary)',
            }}
          >
            Welcome to Guardian<span style={{ color: 'var(--neon-tertiary)' }}>API</span> Playground
          </h2>
          <p
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.875rem',
              color: 'var(--text-secondary)',
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            Multi-model AI moderation engine for toxicity, sexism, and rule-based detection
          </p>
        </div>
      </div>

      {/* Description */}
      <div
        style={{
          marginBottom: 'var(--spacing-lg)',
          padding: 'var(--spacing-md)',
          background: 'rgba(0, 255, 255, 0.05)',
          border: '1px solid rgba(0, 255, 255, 0.2)',
          borderRadius: 'var(--radius-sm)',
        }}
      >
        <p
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.875rem',
            color: 'var(--text-primary)',
            margin: 0,
            lineHeight: 1.7,
          }}
        >
          Guardian<span style={{ color: 'var(--neon-tertiary)' }}>API</span> combines <strong style={{ color: 'var(--neon-primary)' }}>LASSO-based sexism classification</strong>,{' '}
          <strong style={{ color: 'var(--neon-primary)' }}>BERT toxicity detection</strong>, and{' '}
          <strong style={{ color: 'var(--neon-primary)' }}>rule-based heuristics</strong> to provide comprehensive content moderation.
        </p>
      </div>

      {/* Quick Start */}
      <div style={{ marginBottom: 'var(--spacing-lg)' }}>
        <h3
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.875rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: 'var(--spacing-md)',
            color: 'var(--neon-tertiary)',
          }}
        >
          ⚡ Quick Start
        </h3>
        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.875rem',
            color: 'var(--text-primary)',
            lineHeight: 2,
          }}
        >
          <li style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-sm)' }}>
            <span style={{ color: 'var(--neon-primary)', marginTop: '2px' }}>▸</span>
            <span>Type any message in the box on the left</span>
          </li>
          <li style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-sm)' }}>
            <span style={{ color: 'var(--neon-primary)', marginTop: '2px' }}>▸</span>
            <span>Click "Analyze Text" to run the moderation pipeline</span>
          </li>
          <li style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-sm)' }}>
            <span style={{ color: 'var(--neon-primary)', marginTop: '2px' }}>▸</span>
            <span>View ensemble scores, model breakdowns, and rule triggers</span>
          </li>
        </ul>
      </div>

      {/* Example Inputs */}
      <div style={{ marginBottom: 'var(--spacing-lg)' }}>
        <h3
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.875rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: 'var(--spacing-md)',
            color: 'var(--neon-tertiary)',
          }}
        >
          🧪 Try Example Inputs
        </h3>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--spacing-sm)',
          }}
        >
          {exampleInputs.map((example, idx) => (
            <button
              key={idx}
              onClick={() => onExampleClick(example)}
              style={{
                background: 'transparent',
                border: '1px solid var(--neon-primary)',
                color: 'var(--neon-primary)',
                padding: 'var(--spacing-sm) var(--spacing-md)',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.875rem',
                textAlign: 'left',
                cursor: 'pointer',
                borderRadius: 'var(--radius-sm)',
                transition: 'all 0.2s ease-in-out',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--neon-primary)';
                e.currentTarget.style.color = 'var(--bg-primary)';
                e.currentTarget.style.boxShadow = '0 0 10px var(--neon-primary)';
                e.currentTarget.style.transform = 'translateX(4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--neon-primary)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'translateX(0)';
              }}
            >
              "{example}"
            </button>
          ))}
        </div>
      </div>

      {/* What This Playground Shows */}
      <div
        style={{
          padding: 'var(--spacing-md)',
          background: 'rgba(0, 255, 136, 0.05)',
          border: '1px solid rgba(0, 255, 136, 0.2)',
          borderRadius: 'var(--radius-sm)',
        }}
      >
        <h3
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.875rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: 'var(--spacing-md)',
            color: 'var(--neon-tertiary)',
          }}
        >
          🔍 What This Playground Shows
        </h3>
        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.8rem',
            color: 'var(--text-primary)',
            lineHeight: 2,
          }}
        >
          <li style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-sm)' }}>
            <span style={{ color: 'var(--neon-tertiary)', marginTop: '2px' }}>▸</span>
            <span><strong>Multi-model inference:</strong> Sexism classifier, toxicity transformer, and rule engine</span>
          </li>
          <li style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-sm)' }}>
            <span style={{ color: 'var(--neon-tertiary)', marginTop: '2px' }}>▸</span>
            <span><strong>Ensemble scoring:</strong> Weighted fusion of all model outputs</span>
          </li>
          <li style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-sm)' }}>
            <span style={{ color: 'var(--neon-tertiary)', marginTop: '2px' }}>▸</span>
            <span><strong>Rule-based heuristics:</strong> Slur detection, threats, profanity, self-harm flags</span>
          </li>
          <li style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-sm)' }}>
            <span style={{ color: 'var(--neon-tertiary)', marginTop: '2px' }}>▸</span>
            <span><strong>Real-time JSON output:</strong> Complete moderation response with metadata</span>
          </li>
        </ul>
      </div>

      {/* Subtle scanning effect */}
      <div
        style={{
          marginTop: 'var(--spacing-lg)',
          height: '2px',
          background: 'linear-gradient(90deg, transparent, var(--neon-primary), transparent)',
          opacity: 0.3,
          animation: 'scan-beam 3s infinite',
        }}
      />
    </div>
  );
}

