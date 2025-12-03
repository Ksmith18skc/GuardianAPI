/**
 * Main App component - GuardianAPI Playground Mode
 */

import { useState } from 'react';
import { MainLayout } from './components/layout/MainLayout';
import { TextInput } from './components/input/TextInput';
import { AnalyzeButton } from './components/input/AnalyzeButton';
import { EnsemblePanel } from './components/results/EnsemblePanel';
import { ModelBreakdown } from './components/results/ModelBreakdown';
import { JSONViewer } from './components/results/JSONViewer';
import { CodeExamples } from './components/results/CodeExamples';
import { PlaygroundWelcome } from './components/PlaygroundWelcome';
import { useModeration } from './hooks/useModeration';

function App() {
  const [inputText, setInputText] = useState('');
  const { analyze, isAnalyzing, result, error } = useModeration();

  const handleAnalyze = () => {
    analyze(inputText);
  };

  return (
    <MainLayout>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 'var(--spacing-xl)',
          alignItems: 'start',
        }}
        className="responsive-grid"
      >
        {/* Left Column: Input */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--spacing-lg)',
          }}
        >
          <div className="panel fade-in">
            <h2
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '1.25rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '2px',
                marginBottom: 'var(--spacing-md)',
                color: 'var(--neon-primary)',
              }}
            >
              Text Input
            </h2>
            <TextInput
              value={inputText}
              onChange={setInputText}
              isAnalyzing={isAnalyzing}
            />
            <AnalyzeButton
              onClick={handleAnalyze}
              disabled={!inputText.trim()}
              isAnalyzing={isAnalyzing}
            />
            {error && (
              <div
                style={{
                  marginTop: 'var(--spacing-md)',
                  padding: 'var(--spacing-sm)',
                  backgroundColor: 'rgba(255, 51, 102, 0.1)',
                  border: '1px solid var(--color-danger)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--color-danger)',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.875rem',
                }}
              >
                Error: {error}
              </div>
            )}
          </div>

          {/* Model Breakdown */}
          {result && (
            <ModelBreakdown result={result} />
          )}
        </div>

        {/* Right Column: Results */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--spacing-lg)',
          }}
        >
          {result && (
            <>
              <EnsemblePanel ensemble={result.ensemble} />
              <JSONViewer data={result} />
              <CodeExamples result={result} />
            </>
          )}
          {isAnalyzing && (
            <div
              className="panel"
              style={{
                textAlign: 'center',
                padding: 'var(--spacing-2xl)',
                color: 'var(--text-secondary)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 'var(--spacing-md)',
                }}
              >
                <div
                  className="shimmer"
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    margin: '0 auto',
                  }}
                />
                <p style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  Analyzing text...
                </p>
              </div>
            </div>
          )}
          {!result && !isAnalyzing && (
            <PlaygroundWelcome onExampleClick={setInputText} />
          )}
        </div>
      </div>
    </MainLayout>
  );
}

export default App;
