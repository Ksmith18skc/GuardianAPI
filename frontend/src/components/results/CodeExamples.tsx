/**
 * Code examples component
 */

import { useState } from 'react';
import { Collapsible } from '../ui/Collapsible';
import { generatePythonExample, generateJavaScriptExample } from '../../utils/codeGenerators';
import hljs from 'highlight.js/lib/core';
import python from 'highlight.js/lib/languages/python';
import javascript from 'highlight.js/lib/languages/javascript';
import 'highlight.js/styles/github-dark.css';
import type { ModerationResponse } from '../../types/api';

hljs.registerLanguage('python', python);
hljs.registerLanguage('javascript', javascript);

interface CodeExamplesProps {
  result: ModerationResponse;
}

export function CodeExamples({ result }: CodeExamplesProps) {
  const [activeTab, setActiveTab] = useState<'python' | 'javascript'>('python');

  const pythonCode = generatePythonExample(result);
  const jsCode = generateJavaScriptExample(result);

  const CodeBlock = ({ code, language }: { code: string; language: string }) => {
    const highlighted = hljs.highlight(code, { language }).value;

    return (
      <pre
        style={{
          margin: 0,
          padding: 'var(--spacing-md)',
          backgroundColor: 'var(--bg-primary)',
          borderRadius: 'var(--radius-sm)',
          overflow: 'auto',
          fontSize: '0.875rem',
          fontFamily: 'JetBrains Mono, monospace',
          border: '1px solid var(--bg-grid)',
        }}
      >
        <code
          dangerouslySetInnerHTML={{ __html: highlighted }}
          style={{
            color: 'var(--text-primary)',
          }}
        />
      </pre>
    );
  };

  return (
    <Collapsible title="API Usage Examples" defaultOpen={false}>
      <div>
        <div
          style={{
            display: 'flex',
            gap: 'var(--spacing-sm)',
            marginBottom: 'var(--spacing-md)',
            borderBottom: '1px solid var(--bg-grid)',
          }}
        >
          <button
            onClick={() => setActiveTab('python')}
            style={{
              padding: 'var(--spacing-sm) var(--spacing-md)',
              background: activeTab === 'python' ? 'var(--neon-primary)' : 'transparent',
              color: activeTab === 'python' ? 'var(--bg-primary)' : 'var(--text-primary)',
              border: 'none',
              borderBottom: activeTab === 'python' ? '2px solid var(--neon-primary)' : '2px solid transparent',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.875rem',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              transition: 'all 0.3s ease',
            }}
          >
            Python
          </button>
          <button
            onClick={() => setActiveTab('javascript')}
            style={{
              padding: 'var(--spacing-sm) var(--spacing-md)',
              background: activeTab === 'javascript' ? 'var(--neon-primary)' : 'transparent',
              color: activeTab === 'javascript' ? 'var(--bg-primary)' : 'var(--text-primary)',
              border: 'none',
              borderBottom: activeTab === 'javascript' ? '2px solid var(--neon-primary)' : '2px solid transparent',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.875rem',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              transition: 'all 0.3s ease',
            }}
          >
            JavaScript
          </button>
        </div>
        {activeTab === 'python' ? (
          <CodeBlock code={pythonCode} language="python" />
        ) : (
          <CodeBlock code={jsCode} language="javascript" />
        )}
      </div>
    </Collapsible>
  );
}

