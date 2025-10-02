# React Code Splitter

Transform monolithic React components into maintainable subcomponents automatically.

[![npm version](https://img.shields.io/npm/v/react-code-splitter)](https://www.npmjs.com/package/react-code-splitter)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Installation

```bash
npm install -g react-code-splitter
```

Or use with npx:
```bash
npx react-code-splitter auto --dry src/App.jsx
```

## Quick Example

**Before:**
```jsx
function UserDashboard() {
  return (
    <div>
      <header>
        <h1>Dashboard</h1>
        <nav>{/* ... */}</nav>
      </header>
      <main>
        <section className="stats">{/* ... */}</section>
        <section className="charts">{/* ... */}</section>
      </main>
    </div>
  );
}
```

**Run:**
```bash
react-split auto src/UserDashboard.jsx
```

**After:**
```jsx
import Header from './components/Header';
import Stats from './components/Stats';
import Charts from './components/Charts';

function UserDashboard() {
  return (
    <div>
      <Header />
      <main>
        <Stats />
        <Charts />
      </main>
    </div>
  );
}
```

## Features

- 🤖 **Automatic extraction** - Intelligently identifies components to extract
- 🎯 **Smart prop detection** - Analyzes variable usage to pass correct props
- 🎨 **Beautiful CLI** - Clean, colorful output with progress indicators
- ⚡ **Fast** - Powered by jscodeshift for efficient AST manipulation
- 🔍 **Dry run mode** - Preview changes before applying
- ⚙️ **Configurable** - Customize extraction thresholds and output
- 📦 **Zero config** - Works out of the box with sensible defaults

## Usage

### Automatic Extraction

```bash
# Preview what will be extracted
react-split auto --dry src/App.jsx

# Extract components
react-split auto src/App.jsx

# Process multiple files
react-split auto src/**/*.jsx
```

### Extract Specific Component

```bash
react-split extract \
  --selector header \
  --name Header \
  src/App.jsx
```

### Configuration

Create `.react-splitter.json`:
```bash
react-split init
```

## Documentation

- [Getting Started](GETTING_STARTED.md) - Installation and quick start
- [Examples](EXAMPLES.md) - Before/after transformations
- [Publishing Guide](NPM_PUBLISH.md) - How to publish to npm

## Requirements

- Node.js >= 14
- React project with JSX/TSX files

## License

MIT © 2024

## Contributing

Contributions welcome! Please read the contributing guidelines first.

## Support

- 🐛 [Report bugs](https://github.com/yourusername/react-code-splitter/issues)
- 💡 [Request features](https://github.com/yourusername/react-code-splitter/issues)
- ⭐ Star the repo if you find it useful!

---

Made with ❤️ for React developers
