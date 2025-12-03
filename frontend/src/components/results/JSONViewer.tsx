/**
 * JSON viewer component with syntax highlighting
 */

import { useEffect, useRef } from 'react';
import { Collapsible } from '../ui/Collapsible';
import hljs from 'highlight.js/lib/core';
import json from 'highlight.js/lib/languages/json';
import 'highlight.js/styles/github-dark.css';

hljs.registerLanguage('json', json);

interface JSONViewerProps {
  data: any;
}

export function JSONViewer({ data }: JSONViewerProps) {
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (codeRef.current) {
      hljs.highlightElement(codeRef.current);
    }
  }, [data]);

  const jsonString = JSON.stringify(data, null, 2);

  return (
    <Collapsible title="JSON Response" defaultOpen={false}>
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
          ref={codeRef}
          className="language-json"
          style={{
            color: 'var(--text-primary)',
          }}
        >
          {jsonString}
        </code>
      </pre>
    </Collapsible>
  );
}

