/**
 * Text input component with scanning beam overlay
 */

import { ScanningBeam } from './ScanningBeam';

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  isAnalyzing: boolean;
  placeholder?: string;
}

export function TextInput({
  value,
  onChange,
  isAnalyzing,
  placeholder = 'Enter text to analyze...',
}: TextInputProps) {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
      }}
    >
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={isAnalyzing}
        className="input"
        style={{
          minHeight: '200px',
          resize: 'vertical',
          fontFamily: 'inherit',
          fontSize: '1rem',
          lineHeight: '1.6',
        }}
        aria-label="Text input for moderation analysis"
      />
      <ScanningBeam isActive={isAnalyzing} />
    </div>
  );
}

