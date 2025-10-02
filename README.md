# React Code Splitter

## Features

- **Interactive mode** - Preview and name each component before extraction (NEW!)
- **Automatic extraction** - Intelligently identifies components to extract
- **Smart prop detection** - Analyzes variable usage and passes correct props
- **Beautiful CLI** - Clean, colorful output with progress indicators
- **Fast** - Powered by jscodeshift for efficient AST manipulation
- **Dry run mode** - Preview changes before applying
- **Configurable** - Customize extraction thresholds and output
- **Zero config** - Works out of the box with sensible defaults
- **Supports** function components, arrow functions, and class componentstter

> Automatically split React components into smaller, maintainable subcomponents using jscodeshift.

[![npm version](https://img.shields.io/npm/v/react-code-splitter)](https://www.npmjs.com/package/react-code-splitter)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 🤖 **Automatic extraction** - Intelligently identifies components to extract
- 🎯 **Smart prop detection** - Analyzes variable usage and passes correct props
- 🎨 **Beautiful CLI** - Clean, colorful output with progress indicators
- ⚡ **Fast** - Powered by jscodeshift for efficient AST manipulation
- � **Dry run mode** - Preview changes before applying
- ⚙️ **Configurable** - Customize extraction thresholds and output
- 📦 **Zero config** - Works out of the box with sensible defaults
- 🧪 **Supports** function components, arrow functions, and class components

## Installation

### Global CLI (Recommended)

```bash
npm install -g react-code-splitter
```

### Project Dependency

```bash
npm install --save-dev react-code-splitter
```

### No Installation (npx)

```bash
npx react-code-splitter auto src/App.jsx
```

## Quick Start

```bash
# 🎤 Interactive mode (RECOMMENDED - name each component yourself)
react-split auto --interactive src/App.jsx

# Preview in interactive mode
react-split auto --interactive --dry src/App.jsx

# Or extract specific component manually
react-split extract --selector header --name Header src/App.jsx
```

> 💡 **Pro Tip**: Interactive mode solves the naming problem! The tool finds candidates, you give them meaningful names like `PaymentSummary` instead of generic `CardComponent20`.

## Usage

### Interactive Mode (Recommended)

```bash
# Interactive extraction with custom names
react-split auto --interactive src/App.jsx

# Preview without writing files
react-split auto --interactive --dry src/App.jsx

# Adjust complexity threshold
react-split auto --interactive --min-elements 5 src/App.jsx
```

**How it works:**
1. Tool analyzes your component and finds extractable sections
2. For each candidate, you see:
   - JSX preview (first 5 lines)
   - Element count
   - Suggested name
3. You decide: extract it or skip it
4. If extracting, you provide a meaningful name
5. Tool creates files and updates imports

**Example interaction:**
```
📄 Processing: src/AdminPage.tsx

✓ Found 3 extractable component(s)

Candidate 1/3:
──────────────────────────────────────────────────
<div className="payment-summary">
  <h3>Payment Details</h3>
  <p>Total: ${amount}</p>
  ...
──────────────────────────────────────────────────
(8 JSX elements)

? Extract this component? Yes
? Component name: PaymentSummary
```

### Automatic Extraction

> ⚠️ **Warning**: Automatic mode generates generic names like `CardComponent20`. Use interactive mode for better naming!

```bash
# Process a single file
react-split auto src/App.jsx

# Process multiple files
react-split auto src/**/*.jsx

# Custom output directory
react-split auto --output-dir ./subcomponents src/App.jsx

# Adjust sensitivity (higher = fewer extractions)
react-split auto --min-elements 5 src/App.jsx

# Dry run (no files written)
react-split auto --dry src/App.jsx
```

### Extract Specific Component

```bash
# Extract by element name
react-split extract --selector header --name Header src/App.jsx

# Extract by className
react-split extract --selector "user-profile" --name UserProfile src/App.jsx
```

### CLI Options

#### `auto` command

| Option | Default | Description |
|--------|---------|-------------|
| `--interactive, -i` | false | **Interactive mode - name each component** |
| `--dry, -d` | false | Preview without writing files |
| `--output-dir, -o` | `./components` | Output directory |
| `--min-elements, -m` | `3` | Min JSX elements to extract |
| `--parser, -p` | `tsx` | Parser (babel/tsx/flow/ts) |
| `--verbose, -v` | false | Verbose output |

#### `extract` command

| Option | Required | Description |
|--------|----------|-------------|
| `--selector, -s` | Yes | CSS selector or element name |
| `--name, -n` | Yes | Component name |
| `--dry, -d` | No | Preview without writing |
| `--output-dir, -o` | No | Output directory |

### Configuration File

Create `.react-splitter.json`:

```bash
react-split init
```

```json
{
  "outputDir": "./components",
  "minElements": 3,
  "parser": "tsx",
  "ignore": ["**/node_modules/**", "**/dist/**"]
}
```

## Example

### Before

```jsx
// App.jsx
import React from 'react';

function App() {
  const title = "My App";
  const description = "Welcome to my application";
  
  return (
    <div className="app">
      <header className="header">
        <h1>{title}</h1>
        <p>{description}</p>
        <nav>
          <a href="/home">Home</a>
          <a href="/about">About</a>
        </nav>
      </header>
      <main className="content">
        <div className="sidebar">
          <ul>
            <li>Item 1</li>
            <li>Item 2</li>
            <li>Item 3</li>
          </ul>
        </div>
        <div className="main-content">
          <p>Main content goes here</p>
        </div>
      </main>
    </div>
  );
}

export default App;
```

### After

```jsx
// App.jsx
import React from 'react';
import Header from './components/Header';
import Content from './components/Content';

function App() {
  const title = "My App";
  const description = "Welcome to my application";
  
  return (
    <div className="app">
      <Header title={title} description={description} />
      <Content />
    </div>
  );
}

export default App;
```

```jsx
// components/Header.jsx
import React from 'react';

function Header({ title, description }) {
  return (
    <header className="header">
      <h1>{title}</h1>
      <p>{description}</p>
      <nav>
        <a href="/home">Home</a>
        <a href="/about">About</a>
      </nav>
    </header>
  );
}

export default Header;
```

```jsx
// components/Content.jsx
import React from 'react';

function Content() {
  return (
    <main className="content">
      <div className="sidebar">
        <ul>
          <li>Item 1</li>
          <li>Item 2</li>
          <li>Item 3</li>
        </ul>
      </div>
      <div className="main-content">
        <p>Main content goes here</p>
      </div>
    </main>
  );
}

export default Content;
```

## How It Works

1. **Analyzes** your React component's AST
2. **Identifies** JSX sections with sufficient complexity
3. **Extracts** them into separate component files
4. **Detects** props by analyzing variable usage
5. **Updates** the original file with imports and component references

## Best Practices

- ✅ **Always start with `--dry`** to preview changes
- ✅ **Commit your code** before running (easy to revert)
- ✅ **Start conservative** with higher `--min-elements` values
- ✅ **Review generated code** and adjust as needed
- ✅ **Run tests** after extraction

## Supported Components

- Function declarations
- Arrow function components
- Class components with render method
- JSX and JSX Fragments
- TypeScript/TSX files

## Limitations

- Props are detected using heuristics (may need manual adjustment)
- Complex state/context may require manual updates  
- Event handlers passed as props work but may need refinement
- Interactive mode processes one file at a time for better UX

## Advanced Usage

### Using as jscodeshift transform

```bash
npx jscodeshift -t node_modules/react-code-splitter/split-components.js src/App.jsx
```

### Programmatic API

```javascript
const { run } = require('jscodeshift/src/Runner');
const path = require('path');

const transformPath = path.resolve(__dirname, 'node_modules/react-code-splitter/split-components.js');
const paths = ['src/App.jsx'];
const options = {
  dry: true,
  outputDir: './components',
  minElements: 3
};

await run(transformPath, paths, options);
```

## Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Add tests for new features
4. Submit a pull request

## License

MIT
