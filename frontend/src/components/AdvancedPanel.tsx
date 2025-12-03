/**
 * AdvancedPanel - Technical details panel with model cards, benchmarks, and architecture info
 */

import { useState } from 'react';

// --- Type Definitions ---

interface ModelCard {
    name: string;
    type: string;
    version: string;
    description: string;
    trainingData: string;
    metrics: {
        accuracy?: number;
        f1?: number;
        precision?: number;
        recall?: number;
    };
    lastUpdated: string;
    vectorizerVersion?: string;
}

interface Benchmark {
    label: string;
    value: string | number;
    unit?: string;
    device: 'GPU' | 'CPU';
}

interface ArchitectureSection {
    title: string;
    description: string;
    components: string[];
}

// --- Data (Placeholder - in production, fetch from API) ---

const modelCards: ModelCard[] = [
    {
        name: 'Sexism Classifier',
        type: 'LASSO Regression',
        version: '1.0.0',
        description: 'Linear model with L1 regularization for sexism detection',
        trainingData: 'train_sexism.csv (15,000 samples)',
        metrics: {
            accuracy: 0.85,
            f1: 0.82,
            precision: 0.79,
            recall: 0.85
        },
        lastUpdated: '2025-12-01',
        vectorizerVersion: 'TF-IDF v1.0'
    },
    {
        name: 'Toxicity Transformer',
        type: 'HuggingFace Model',
        version: 'unitary/toxic-bert',
        description: 'BERT-based multi-label toxicity classifier',
        trainingData: 'Jigsaw Toxic Comment Classification (159,571 samples)',
        metrics: {
            accuracy: 0.92,
            f1: 0.89
        },
        lastUpdated: '2025-11-15',
    },
    {
        name: 'Rules Engine',
        type: 'Pattern Matching',
        version: '1.0.0',
        description: 'Regex-based rule system for explicit content detection',
        trainingData: 'Curated rule sets (slurs, threats, profanity)',
        metrics: {
            precision: 0.95,
            recall: 0.88
        },
        lastUpdated: '2025-12-01',
    }
];

const benchmarks: Benchmark[] = [
    { label: 'Average Inference Time', value: 45, unit: 'ms', device: 'GPU' },
    { label: 'Average Inference Time', value: 180, unit: 'ms', device: 'CPU' },
    { label: 'Throughput (GPU)', value: 22, unit: 'req/s', device: 'GPU' },
    { label: 'Throughput (CPU)', value: 5.5, unit: 'req/s', device: 'CPU' },
    { label: 'Batch Processing (100)', value: 2.1, unit: 's', device: 'GPU' },
    { label: 'Model Load Time', value: 3.2, unit: 's', device: 'GPU' }
];

const architectureSections: ArchitectureSection[] = [
    {
        title: 'Preprocessing Pipeline',
        description: 'Text normalization and feature extraction',
        components: [
            'URL removal',
            'Mention removal (@username)',
            'Emoji handling',
            'Whitespace normalization',
            'Caps abuse detection',
            'Character repetition detection'
        ]
    },
    {
        title: 'Model Ensemble',
        description: 'Weighted fusion of multiple models',
        components: [
            'Sexism Classifier (35% weight)',
            'Toxicity Transformer (35% weight)',
            'Rules Engine (30% weight)',
            'Conflict resolution logic',
            'Severity computation',
            'Primary issue identification'
        ]
    },
    {
        title: 'Post-Processing',
        description: 'Result aggregation and formatting',
        components: [
            'Score normalization',
            'Label consolidation',
            'Metadata generation',
            'Response formatting'
        ]
    }
];

const classDistribution = {
    'Safe': 0.65,
    'Low Risk': 0.20,
    'Moderate Risk': 0.10,
    'High Risk': 0.05
};

// --- Sub-Components ---

const CollapsibleSection = ({ title, children, defaultOpen = false }: { title: string, children: React.ReactNode, defaultOpen?: boolean }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div style={{
            border: '1px solid var(--ci-border)',
            marginBottom: 'var(--space-md)',
            background: 'var(--ci-bg-input)'
        }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: '100%',
                    padding: 'var(--space-md)',
                    background: 'transparent',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.9rem',
                    color: 'var(--ci-text)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--ci-primary)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--ci-text)';
                }}
            >
                <span>{title}</span>
                <span style={{
                    color: 'var(--ci-accent)',
                    fontSize: '1.2rem',
                    transition: 'transform 0.3s ease',
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                }}>
                    ▼
                </span>
            </button>
            <div style={{
                maxHeight: isOpen ? '2000px' : '0',
                overflow: 'hidden',
                transition: 'max-height 0.4s ease-out, padding 0.4s ease-out',
                padding: isOpen ? 'var(--space-md)' : '0 var(--space-md)'
            }}>
                {children}
            </div>
        </div>
    );
};

const ModelCardComponent = ({ model }: { model: ModelCard }) => (
    <div style={{
        background: 'var(--ci-bg-input)',
        border: '1px solid var(--ci-border)',
        padding: 'var(--space-md)',
        marginBottom: 'var(--space-md)',
        position: 'relative'
    }}>
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 'var(--space-sm)'
        }}>
            <div>
                <div style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.1rem',
                    color: 'var(--ci-primary)',
                    marginBottom: '4px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                }}>
                    {model.name}
                </div>
                <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    color: 'var(--ci-accent)',
                    marginBottom: 'var(--space-xs)'
                }}>
                    {model.type} • v{model.version}
                </div>
            </div>
            <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.7rem',
                color: 'var(--ci-text-dim)',
                textAlign: 'right'
            }}>
                Updated: {model.lastUpdated}
            </div>
        </div>
        <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8rem',
            color: 'var(--ci-text-dim)',
            marginBottom: 'var(--space-md)',
            lineHeight: 1.6
        }}>
            {model.description}
        </div>
        <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 'var(--space-sm)',
            marginBottom: 'var(--space-sm)'
        }}>
            {Object.entries(model.metrics).map(([key, value]) => (
                <div key={key} style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem'
                }}>
                    <span style={{ color: 'var(--ci-text-dim)', textTransform: 'uppercase' }}>
                        {key}:
                    </span>
                    <span style={{
                        color: 'var(--ci-accent)',
                        marginLeft: 'var(--space-xs)',
                        fontWeight: 700
                    }}>
                        {(value * 100).toFixed(1)}%
                    </span>
                </div>
            ))}
        </div>
        <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.7rem',
            color: 'var(--ci-text-dim)',
            borderTop: '1px solid var(--ci-border)',
            paddingTop: 'var(--space-sm)'
        }}>
            Training Data: <span style={{ color: 'var(--ci-text)' }}>{model.trainingData}</span>
            {model.vectorizerVersion && (
                <>
                    <br />
                    Vectorizer: <span style={{ color: 'var(--ci-text)' }}>{model.vectorizerVersion}</span>
                </>
            )}
        </div>
    </div>
);

// --- Main Component ---

interface AdvancedPanelProps {
    isOpen: boolean;
}

export const AdvancedPanel = ({ isOpen }: AdvancedPanelProps) => {
    return (
        <>
        <div style={{
            maxHeight: isOpen ? '2000px' : '0',
            overflow: 'hidden',
            transition: 'max-height 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease, margin 0.3s ease',
            opacity: isOpen ? 1 : 0,
            marginBottom: isOpen ? 'var(--space-xl)' : '0',
            marginTop: isOpen ? 'var(--space-lg)' : '0'
        }}>
            <div className="ci-panel" style={{
                background: 'var(--ci-bg-panel)',
                border: '1px solid var(--ci-border)',
                padding: 'var(--space-xl)'
            }}>
                <div className="ci-header" style={{ marginBottom: 'var(--space-xl)' }}>
                    ⚙️ ADVANCED_TECHNICAL_SPECIFICATIONS
                </div>

                {/* Model Cards */}
                <CollapsibleSection title="MODEL_CARDS" defaultOpen={true}>
                    <div>
                        {modelCards.map((model, idx) => (
                            <ModelCardComponent key={idx} model={model} />
                        ))}
                    </div>
                </CollapsibleSection>

                {/* Performance Benchmarks */}
                <CollapsibleSection title="PERFORMANCE_BENCHMARKS">
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                        gap: 'var(--space-md)'
                    }}
                    className="benchmark-grid"
                    >
                        {benchmarks.map((benchmark, idx) => (
                            <div key={idx} style={{
                                background: 'var(--ci-bg-input)',
                                border: '1px solid var(--ci-border)',
                                padding: 'var(--space-md)',
                                fontFamily: 'var(--font-mono)'
                            }}>
                                <div style={{
                                    fontSize: '0.7rem',
                                    color: 'var(--ci-text-dim)',
                                    textTransform: 'uppercase',
                                    marginBottom: 'var(--space-xs)'
                                }}>
                                    {benchmark.label}
                                </div>
                                <div style={{
                                    fontSize: '1.5rem',
                                    color: benchmark.device === 'GPU' ? 'var(--ci-accent)' : 'var(--ci-primary)',
                                    fontWeight: 700,
                                    textShadow: `0 0 10px ${benchmark.device === 'GPU' ? 'var(--ci-accent-glow)' : 'var(--ci-primary-glow)'}`
                                }}>
                                    {benchmark.value}{benchmark.unit}
                                </div>
                                <div style={{
                                    fontSize: '0.7rem',
                                    color: 'var(--ci-text-dim)',
                                    marginTop: 'var(--space-xs)'
                                }}>
                                    {benchmark.device}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div style={{
                        marginTop: 'var(--space-lg)',
                        padding: 'var(--space-md)',
                        background: 'var(--ci-bg-input)',
                        border: '1px solid var(--ci-border)'
                    }}>
                        <div style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: '0.9rem',
                            color: 'var(--ci-text)',
                            marginBottom: 'var(--space-md)',
                            textTransform: 'uppercase',
                            letterSpacing: '1px'
                        }}>
                            CLASS_DISTRIBUTION
                        </div>
                        {Object.entries(classDistribution).map(([label, value]) => (
                            <div key={label} style={{
                                marginBottom: 'var(--space-sm)',
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.8rem'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    marginBottom: '4px'
                                }}>
                                    <span style={{ color: 'var(--ci-text)' }}>{label}</span>
                                    <span style={{ color: 'var(--ci-accent)' }}>{(value * 100).toFixed(1)}%</span>
                                </div>
                                <div style={{
                                    height: '4px',
                                    background: 'var(--ci-border)',
                                    opacity: 0.3,
                                    overflow: 'hidden'
                                }}>
                                    <div style={{
                                        height: '100%',
                                        width: `${value * 100}%`,
                                        background: label === 'Safe' ? 'var(--ci-success)' :
                                            label === 'Low Risk' ? 'var(--ci-accent)' :
                                                label === 'Moderate Risk' ? 'var(--ci-warning)' :
                                                    'var(--ci-primary)',
                                        boxShadow: `0 0 10px ${label === 'Safe' ? 'var(--ci-success)' :
                                            label === 'Low Risk' ? 'var(--ci-accent-glow)' :
                                                label === 'Moderate Risk' ? 'var(--ci-warning)' :
                                                    'var(--ci-primary-glow)'}`
                                    }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </CollapsibleSection>

                {/* System Architecture */}
                <CollapsibleSection title="SYSTEM_ARCHITECTURE">
                    <div style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.85rem',
                        lineHeight: 1.8,
                        color: 'var(--ci-text)',
                        marginBottom: 'var(--space-lg)'
                    }}>
                        <div style={{
                            background: 'var(--ci-bg-input)',
                            border: '1px solid var(--ci-border)',
                            padding: 'var(--space-md)',
                            marginBottom: 'var(--space-md)',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.75rem',
                            color: 'var(--ci-accent)',
                            whiteSpace: 'pre-wrap'
                        }}>
{`INPUT_TEXT
    ↓
PREPROCESSING_PIPELINE
    ├─ URL Removal
    ├─ Mention Removal
    ├─ Emoji Handling
    └─ Normalization
    ↓
PARALLEL_MODEL_EXECUTION
    ├─ Sexism Classifier (LASSO)
    ├─ Toxicity Transformer (BERT)
    └─ Rules Engine (Pattern Matching)
    ↓
ENSEMBLE_AGGREGATION
    ├─ Weighted Score Fusion (35/35/30)
    ├─ Conflict Resolution
    └─ Severity Computation
    ↓
POST_PROCESSING
    ├─ Label Consolidation
    └─ Metadata Generation
    ↓
OUTPUT_RESPONSE`}
                        </div>
                    </div>
                    {architectureSections.map((section, idx) => (
                        <div key={idx} style={{
                            background: 'var(--ci-bg-input)',
                            border: '1px solid var(--ci-border)',
                            padding: 'var(--space-md)',
                            marginBottom: 'var(--space-md)'
                        }}>
                            <div style={{
                                fontFamily: 'var(--font-display)',
                                fontSize: '1rem',
                                color: 'var(--ci-primary)',
                                marginBottom: 'var(--space-sm)',
                                textTransform: 'uppercase',
                                letterSpacing: '1px'
                            }}>
                                {section.title}
                            </div>
                            <div style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.8rem',
                                color: 'var(--ci-text-dim)',
                                marginBottom: 'var(--space-sm)'
                            }}>
                                {section.description}
                            </div>
                            <ul style={{
                                listStyle: 'none',
                                padding: 0,
                                margin: 0,
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.75rem',
                                color: 'var(--ci-text)'
                            }}>
                                {section.components.map((component, compIdx) => (
                                    <li key={compIdx} style={{
                                        padding: 'var(--space-xs) 0',
                                        paddingLeft: 'var(--space-md)',
                                        position: 'relative'
                                    }}>
                                        <span style={{
                                            position: 'absolute',
                                            left: 0,
                                            color: 'var(--ci-accent)'
                                        }}>▸</span>
                                        {component}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </CollapsibleSection>

                {/* Model Metadata */}
                <CollapsibleSection title="MODEL_METADATA">
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: 'var(--space-md)'
                    }}
                    className="metadata-grid"
                    >
                        {modelCards.map((model, idx) => (
                            <div key={idx} style={{
                                background: 'var(--ci-bg-input)',
                                border: '1px solid var(--ci-border)',
                                padding: 'var(--space-md)',
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.75rem'
                            }}>
                                <div style={{
                                    color: 'var(--ci-primary)',
                                    marginBottom: 'var(--space-sm)',
                                    textTransform: 'uppercase',
                                    fontWeight: 700
                                }}>
                                    {model.name}
                                </div>
                                <div style={{ color: 'var(--ci-text-dim)', marginBottom: '4px' }}>
                                    Version: <span style={{ color: 'var(--ci-text)' }}>{model.version}</span>
                                </div>
                                <div style={{ color: 'var(--ci-text-dim)', marginBottom: '4px' }}>
                                    Updated: <span style={{ color: 'var(--ci-text)' }}>{model.lastUpdated}</span>
                                </div>
                                {model.vectorizerVersion && (
                                    <div style={{ color: 'var(--ci-text-dim)' }}>
                                        Vectorizer: <span style={{ color: 'var(--ci-text)' }}>{model.vectorizerVersion}</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </CollapsibleSection>
            </div>
        </div>
        <style>{`
            @media (max-width: 768px) {
                .benchmark-grid,
                .metadata-grid {
                    grid-template-columns: 1fr !important;
                }
            }
        `}</style>
        </>
    );
};

