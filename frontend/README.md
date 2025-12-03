# GuardianAPI Playground - Frontend

A world-class interactive playground for the GuardianAPI content moderation system, featuring a distinctive "Neon Cybernetic Scanner" aesthetic.

## Features

- **Interactive Text Analysis**: Paste text and see real-time moderation results
- **Multi-Model Visualization**: View outputs from Sexism, Toxicity, and Rule-based models
- **Ensemble Analysis**: See combined scores, severity levels, and primary issues
- **Animated Scanning Beam**: Visual feedback during analysis
- **Dark/Light Theme**: Toggle between cybernetic dark and clean light themes
- **Code Examples**: Auto-generated Python and JavaScript usage examples
- **JSON Viewer**: Collapsible JSON response viewer with syntax highlighting
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Framer Motion** - Advanced animations
- **Highlight.js** - Code syntax highlighting
- **Custom CSS** - Cybernetic aesthetic with CSS variables

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- GuardianAPI backend running on `http://localhost:8000`

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The playground will be available at `http://localhost:5173`

### Build for Production

```bash
# Build optimized production bundle
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── layout/       # Header, MainLayout, BackgroundEffects
│   │   ├── input/        # TextInput, AnalyzeButton, ScanningBeam
│   │   ├── results/      # All result visualization components
│   │   └── ui/           # ThemeToggle, APIStatusIndicator, Collapsible
│   ├── hooks/            # Custom React hooks
│   ├── services/         # API client
│   ├── types/            # TypeScript type definitions
│   ├── styles/           # CSS files (themes, animations, globals)
│   └── utils/            # Utility functions
├── public/               # Static assets
└── index.html            # HTML entry point
```

## Design Philosophy

The playground uses a **"Neon Cybernetic Scanner"** aesthetic:

- **Terminal-style typography** (JetBrains Mono)
- **Neon accent colors** (cyan, magenta, electric green)
- **Diagnostic-style visualizations** (bars, gauges, indicators)
- **Scanning beam animations** during analysis
- **Grid patterns and noise overlays** for depth
- **Asymmetric layout** with overlapping panels

## API Integration

The frontend connects to the GuardianAPI backend at `http://localhost:8000`:

- `POST /v1/moderate/text` - Main moderation endpoint
- `GET /v1/health` - Health check
- `GET /v1/models` - Model information

## Customization

### Theme Colors

Edit `src/styles/themes.css` to customize the color palette:

```css
:root {
  --neon-primary: #00ffff;    /* Main accent */
  --neon-secondary: #ff00ff;   /* Highlights */
  --neon-tertiary: #00ff88;   /* Success/safe */
  /* ... */
}
```

### Animations

Customize animations in `src/styles/animations.css`:

- `scan-beam` - Scanning beam sweep
- `pulse-glow` - Pulsing glow effect
- `fade-slide-up` - Staggered reveal
- `bar-fill` - Progress bar fill

## Accessibility

- WCAG 2.1 AA compliant
- Keyboard navigation support
- Screen reader friendly
- High contrast ratios
- Respects `prefers-reduced-motion`

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## License

Part of the GuardianAPI project.
