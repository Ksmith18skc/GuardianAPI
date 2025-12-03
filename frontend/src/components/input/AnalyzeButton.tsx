/**
 * Analyze button component
 */

interface AnalyzeButtonProps {
  onClick: () => void;
  disabled: boolean;
  isAnalyzing: boolean;
}

export function AnalyzeButton({ onClick, disabled, isAnalyzing }: AnalyzeButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isAnalyzing}
      className="btn btn-primary"
      style={{
        marginTop: 'var(--spacing-md)',
        width: '100%',
        fontSize: '1.1rem',
        padding: 'var(--spacing-md) var(--spacing-lg)',
      }}
    >
      {isAnalyzing ? (
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--spacing-sm)' }}>
          <span className="shimmer" style={{ width: '20px', height: '20px', borderRadius: '50%' }} />
          Analyzing...
        </span>
      ) : (
        'Analyze Text'
      )}
    </button>
  );
}

