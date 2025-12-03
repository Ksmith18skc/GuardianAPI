/**
 * AppV2.tsx
 * AppV2 component - GuardianAPI Terminal Mode
 */

import { useState, useEffect, useRef } from 'react';
import './styles/theme-new.css';
import { useModeration } from './hooks/useModeration';
import { useTheme } from './hooks/useTheme';
import { AdvancedPanel } from './components/AdvancedPanel';
import { UIModeToggleV2 } from './components/ui/UIModeToggleV2';

// --- Utility Components ---

const DecryptText = ({ text, speed = 50 }: { text: string, speed?: number }) => {
    const [display, setDisplay] = useState('');
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*';

    useEffect(() => {
        let i = 0;
        const timer = setInterval(() => {
            setDisplay(() => {
                if (i >= text.length) {
                    clearInterval(timer);
                    return text;
                }
                const randomChar = chars[Math.floor(Math.random() * chars.length)];
                const next = text.substring(0, i) + randomChar;
                i++;
                return next;
            });
        }, speed);
        return () => clearInterval(timer);
    }, [text, speed]);

    return <span>{display}</span>;
};

const TerminalLog = ({ logs }: { logs: string[] }) => {
    const endRef = useRef<HTMLDivElement>(null);
    useEffect(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), [logs]);

    return (
        <div className="terminal-log">
            {logs.map((log, i) => (
                <div key={i} className="log-entry">
                    <span className="log-time">[{new Date().toLocaleTimeString().split(' ')[0]}]</span>
                    <span className="log-msg">{log}</span>
                </div>
            ))}
            <div ref={endRef} />
        </div>
    );
};

const CodeBlock = ({ language, code }: { language: string, code: string }) => (
    <div style={{
        background: 'var(--ci-bg-input)',
        border: '1px solid var(--ci-border)',
        padding: 'var(--space-md)',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.8rem',
        color: 'var(--ci-text-dim)',
        overflowX: 'auto',
        marginTop: 'var(--space-sm)'
    }}>
        <div style={{
            color: 'var(--ci-primary)',
            marginBottom: 'var(--space-xs)',
            textTransform: 'uppercase',
            fontSize: '0.7rem',
            letterSpacing: '1px'
        }}>
            {language}
        </div>
        <pre style={{ margin: 0, color: 'var(--ci-text)' }}>{code}</pre>
    </div>
);

// --- V2 Components ---

const HeaderV2 = ({ onAdvancedToggle, isAdvancedOpen, onThemeToggle, theme }: { 
    onAdvancedToggle: () => void, 
    isAdvancedOpen: boolean,
    onThemeToggle: () => void,
    theme: 'light' | 'dark'
}) => {
    return (
    <header style={{
        marginBottom: 'var(--space-xl)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        borderBottom: '1px solid var(--ci-border)',
        paddingBottom: 'var(--space-md)'
    }}>
        <div>
            <h1 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '4rem',
                margin: 0,
                lineHeight: 0.9,
                color: 'var(--ci-text)',
                textShadow: '0 0 20px var(--ci-primary-glow)'
            }}>
                GUARDIAN<span style={{ color: 'var(--ci-primary)' }}>API</span>
            </h1>
            <div style={{
                fontFamily: 'var(--font-mono)',
                color: 'var(--ci-accent)',
                marginTop: 'var(--space-sm)',
                fontSize: '0.9rem',
                letterSpacing: '2px',
                display: 'flex',
                gap: 'var(--space-md)',
                alignItems: 'center'
            }}>
                <span>v1.0.0</span>
                <span>//</span>
                <span>AI_MODERATION_CORE</span>
                <span>//</span>
                <span style={{ color: 'var(--ci-success)' }}>ONLINE</span>
                <span style={{ marginLeft: 'var(--space-lg)', display: 'flex', gap: 'var(--space-md)', alignItems: 'center' }}>
                    <UIModeToggleV2 />
                    <button
                        onClick={onThemeToggle}
                        className="theme-toggle-btn"
                        style={{
                            background: 'transparent',
                            color: 'var(--ci-primary)',
                            border: 'none',
                            padding: 0,
                            fontFamily: 'var(--font-display)',
                            fontSize: '1.2rem',
                            cursor: 'pointer',
                            position: 'relative',
                            overflow: 'visible',
                            transition: 'all 0.2s ease-in-out',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '50%',
                            marginRight: 'var(--space-sm)'
                        }}
                        title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    >
                        <span style={{
                            display: 'inline-block',
                            transition: 'transform 0.2s ease-in-out',
                            transform: theme === 'dark' ? 'rotate(0deg)' : 'rotate(180deg)',
                            fontSize: '1.3rem',
                            lineHeight: 1
                        }}>
                            {theme === 'dark' ? '🌙' : '☀️'}
                        </span>
                    </button>
                    <button
                        onClick={onAdvancedToggle}
                        style={{
                            background: isAdvancedOpen ? 'var(--ci-primary)' : 'transparent',
                            color: isAdvancedOpen ? 'var(--ci-text-inverse)' : 'var(--ci-primary)',
                            border: '1px solid var(--ci-primary)',
                            padding: 'var(--space-xs) var(--space-md)',
                            fontFamily: 'var(--font-display)',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            cursor: 'pointer',
                            position: 'relative',
                            overflow: 'hidden',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                            if (!isAdvancedOpen) {
                                e.currentTarget.style.boxShadow = '0 0 15px var(--ci-primary-glow)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isAdvancedOpen) {
                                e.currentTarget.style.boxShadow = 'none';
                            }
                        }}
                    >
                        ⚙️ ADVANCED
                    </button>
                </span>
            </div>
        </div>
        <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--ci-text-dim)' }}>
            <div style={{ marginBottom: '4px' }}>SECURE_UPLINK_ESTABLISHED</div>
            <div style={{ color: 'var(--ci-primary)' }}>ENCRYPTION: AES-256</div>
        </div>
    </header>
    );
};

const MetricV2 = ({ label, value, threshold = 0.5, invert = false }: { label: string, value: number, threshold?: number, invert?: boolean }) => {
    const isHigh = value > threshold;
    const color = invert
        ? (isHigh ? 'var(--ci-accent)' : 'var(--ci-primary)')
        : (isHigh ? 'var(--ci-primary)' : 'var(--ci-accent)');

    return (
        <div>
            <div className="ci-metric">
                <span>{label}</span>
                <span style={{ color, textShadow: `0 0 10px ${color}` }}>{(value * 100).toFixed(1)}%</span>
            </div>
            <div className="ci-bar-bg">
                <div
                    className="ci-bar-fill"
                    style={{
                        width: `${value * 100}%`,
                        background: color,
                        boxShadow: `0 0 15px ${color}`
                    }}
                />
            </div>
        </div>
    );
};

const FlagItem = ({ label, active }: { label: string, active: boolean }) => (
    <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 'var(--space-xs) 0',
        borderBottom: '1px solid var(--ci-border)',
        color: active ? 'var(--ci-primary)' : 'var(--ci-text-dim)',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.8rem'
    }}>
        <span>{label}</span>
        <span style={{
            width: '8px',
            height: '8px',
            background: active ? 'var(--ci-primary)' : 'var(--ci-border)',
            boxShadow: active ? '0 0 10px var(--ci-primary)' : 'none',
            borderRadius: '50%'
        }} />
    </div>
);

const DataBlock = ({ title, children, className = '' }: { title: string, children: React.ReactNode, className?: string }) => (
    <div className={`ci-panel ${className}`}>
        <div className="ci-header">
            {title}
        </div>
        {children}
    </div>
);

// --- Main V2 App ---

export default function AppV2() {
    const [inputText, setInputText] = useState('');
    const { analyze, isAnalyzing, result, error } = useModeration();
    const [mounted, setMounted] = useState(false);
    const [logs, setLogs] = useState<string[]>(['System initialized...', 'Waiting for input stream...']);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const { theme, toggleTheme } = useTheme();

    useEffect(() => {
        setMounted(true);
    }, []);

    // Enhanced logging effect
    useEffect(() => {
        if (result) {
            const newLogs = [
                `Analysis complete. Processing time: ${result.meta.processing_time_ms}ms`,
                `Primary Issue: ${result.ensemble.primary_issue.toUpperCase()}`,
                `Severity Level: ${result.ensemble.severity.toUpperCase()}`,
                `Ensemble Score: ${result.ensemble.score.toFixed(4)}`,
                `Sexism Prob: ${result.label.sexism.score.toFixed(4)}`,
                `Toxicity Prob: ${result.label.toxicity.overall.toFixed(4)}`,
                `Rule Flags: ${Object.values(result.label.rules).filter(v => v === true).length} active`,
                'Response payload generated.'
            ];
            setLogs(prev => [...prev.slice(-10), ...newLogs]);
        }
    }, [result]);

    const addLog = (msg: string) => setLogs(prev => [...prev.slice(-20), msg]);

    const handleAnalyze = async () => {
        if (!inputText.trim()) return;
        addLog(`Initiating scan sequence for ${inputText.length} chars...`);
        addLog('Dispatching to neural ensemble...');
        await analyze(inputText);
    };

    const pythonCode = `import requests

url = "https://api.guardian.ai/v1/moderate/text"
payload = {"text": "${inputText || 'Your text here'}"}
headers = {"Content-Type": "application/json"}

response = requests.post(url, json=payload)
print(response.json())`;

    const jsCode = `const response = await fetch('https://api.guardian.ai/v1/moderate/text', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ text: '${inputText || 'Your text here'}' })
});

const data = await response.json();
console.log(data);`;

    return (
        <div className={`ci-container ${mounted ? 'fade-in' : ''}`}>
            <div className="grid-bg" />
            <div className="scanline-overlay" />

            <HeaderV2 
                onAdvancedToggle={() => setShowAdvanced(!showAdvanced)} 
                isAdvancedOpen={showAdvanced}
                onThemeToggle={toggleTheme}
                theme={theme}
            />

            <AdvancedPanel isOpen={showAdvanced} />

            <main style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 'var(--space-xl)' }}>

                {/* Left Column: Input & Controls */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                    <DataBlock title="INPUT_STREAM">
                        <textarea
                            className="ci-input"
                            placeholder="> ENTER_TEXT_FOR_ANALYSIS..."
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            spellCheck={false}
                        />
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginTop: 'var(--space-md)',
                            alignItems: 'center'
                        }}>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--ci-text-dim)' }}>
                                BUFFER_SIZE: <span style={{ color: 'var(--ci-text)' }}>{inputText.length}</span> BYTES
                            </div>
                            <button
                                className="ci-button"
                                onClick={handleAnalyze}
                                disabled={isAnalyzing || !inputText.trim()}
                            >
                                {isAnalyzing ? 'PROCESSING...' : 'EXECUTE_SCAN'}
                            </button>
                        </div>
                        {error && (
                            <div style={{
                                marginTop: 'var(--space-md)',
                                color: 'var(--ci-primary)',
                                border: '1px solid var(--ci-primary)',
                                padding: 'var(--space-sm)',
                                fontSize: '0.8rem',
                                background: 'var(--ci-primary-glow)'
                            }}>
                                ERROR: {error}
                            </div>
                        )}
                    </DataBlock>

                    <DataBlock title="SYSTEM_LOG">
                        <TerminalLog logs={logs} />
                    </DataBlock>

                    <DataBlock title="API_INTEGRATION">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                            <CodeBlock language="PYTHON" code={pythonCode} />
                            <CodeBlock language="JAVASCRIPT" code={jsCode} />
                        </div>
                    </DataBlock>
                </div>

                {/* Right Column: Output */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>

                    {result ? (
                        <>
                            <DataBlock title="ANALYSIS_RESULT">
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    marginBottom: 'var(--space-lg)',
                                    borderBottom: '1px solid var(--ci-border)',
                                    paddingBottom: 'var(--space-md)'
                                }}>
                                    <div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--ci-text-dim)', marginBottom: '4px' }}>PRIMARY_ISSUE</div>
                                        <div style={{
                                            fontSize: '2rem',
                                            fontFamily: 'var(--font-display)',
                                            color: 'var(--ci-primary)',
                                            textShadow: '0 0 20px var(--ci-primary-glow)'
                                        }}>
                                            <DecryptText text={result.ensemble.primary_issue.toUpperCase()} />
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--ci-text-dim)', marginBottom: '4px' }}>SEVERITY</div>
                                        <div style={{ fontSize: '2rem', fontFamily: 'var(--font-display)' }}>
                                            {result.ensemble.severity.toUpperCase()}
                                        </div>
                                    </div>
                                </div>

                                <MetricV2
                                    label="ENSEMBLE_SCORE"
                                    value={result.ensemble.score}
                                />

                                <div style={{ height: '1px', background: 'var(--ci-border)', margin: 'var(--space-lg) 0' }} />

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                                    <MetricV2
                                        label="SEXISM"
                                        value={result.label.sexism.score}
                                    />
                                    <MetricV2
                                        label="TOXICITY"
                                        value={result.label.toxicity.overall}
                                    />
                                </div>
                            </DataBlock>

                            <DataBlock title="RULE_ENGINE_FLAGS">
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 var(--space-lg)' }}>
                                    <FlagItem label="SLUR_DETECTED" active={result.label.rules.slur_detected} />
                                    <FlagItem label="THREAT_DETECTED" active={result.label.rules.threat_detected} />
                                    <FlagItem label="PROFANITY" active={result.label.rules.profanity_flag} />
                                    <FlagItem label="SELF_HARM" active={result.label.rules.self_harm_flag} />
                                    <FlagItem label="CAPS_ABUSE" active={result.label.rules.caps_abuse} />
                                    <FlagItem label="CHAR_REPETITION" active={result.label.rules.character_repetition} />
                                </div>
                            </DataBlock>

                            <DataBlock title="RAW_DATA_LOG">
                                <pre style={{
                                    fontSize: '0.7rem',
                                    color: 'var(--ci-accent)',
                                    overflow: 'auto',
                                    maxHeight: '200px',
                                    margin: 0,
                                    fontFamily: 'var(--font-mono)'
                                }}>
                                    {JSON.stringify(result, null, 2)}
                                </pre>
                            </DataBlock>
                        </>
                    ) : (
                        <DataBlock title={isAnalyzing ? "PROCESSING_DATA" : "SYSTEM_IDLE"}>
                            <div style={{
                                height: '400px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: isAnalyzing ? 'var(--ci-primary)' : 'var(--ci-text-dim)',
                                flexDirection: 'column',
                                gap: 'var(--space-md)',
                                background: 'radial-gradient(circle at center, var(--ci-primary-glow) 0%, transparent 70%)'
                            }}>
                                <div style={{
                                    width: '80px',
                                    height: '80px',
                                    border: `2px solid ${isAnalyzing ? 'var(--ci-primary)' : 'var(--ci-text-dim)'}`,
                                    borderRadius: '50%',
                                    position: 'relative',
                                    animation: isAnalyzing ? 'spin 1s linear infinite' : 'none',
                                    boxShadow: isAnalyzing ? '0 0 30px var(--ci-primary-glow)' : 'none'
                                }}>
                                    <div style={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        width: '60%',
                                        height: '60%',
                                        background: isAnalyzing ? 'var(--ci-primary)' : 'transparent',
                                        borderRadius: '50%',
                                        opacity: 0.2
                                    }} />
                                </div>
                                <div style={{
                                    fontFamily: 'var(--font-display)',
                                    letterSpacing: '2px',
                                    fontSize: '1.2rem'
                                }}>
                                    {isAnalyzing ? <DecryptText text="ANALYZING_CONTENT..." speed={30} /> : "WAITING_FOR_INPUT..."}
                                </div>
                            </div>
                        </DataBlock>
                    )}
                </div>

            </main>

            <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .fade-in { animation: fadeIn 1s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        
        .theme-toggle-btn {
            box-shadow: none;
        }
        
        .theme-toggle-btn:hover {
            box-shadow: 0 0 8px var(--ci-primary-glow), 0 0 12px var(--ci-primary-glow);
            background: rgba(42, 42, 42, 0.2);
        }
        
        [data-theme="light"] .theme-toggle-btn:hover {
            background: rgba(240, 240, 240, 0.4);
            box-shadow: 0 0 8px var(--ci-primary-glow), 0 0 12px var(--ci-primary-glow);
        }
      `}</style>
        </div>
    );
}
