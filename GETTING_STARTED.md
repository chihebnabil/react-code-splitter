# Getting Started with React Code Splitter

## Installation

### Option 1: Global Installation (Recommended)

Install globally to use the `react-split` command anywhere:

```bash
npm install -g react-code-splitter
```

Verify installation:
```bash
react-split --version
```

### Option 2: Project Dependency

Install as a dev dependency in your project:

```bash
npm install --save-dev react-code-splitter
```

Add to your `package.json` scripts:
```json
{
  "scripts": {
    "split": "react-split auto",
    "split:dry": "react-split auto --dry"
  }
}
```

Use it:
```bash
npm run split:dry src/App.jsx
```

### Option 3: Use with npx (No Installation)

Run directly without installing:

```bash
npx react-code-splitter auto --dry src/App.jsx
```

## Quick Start

### 1. Preview What Will Be Extracted

Always start with a dry run:

```bash
react-split auto --dry src/YourComponent.jsx
```

This shows you what components would be created without modifying any files.

### 2. Extract Components

If you're happy with the preview, run without `--dry`:

```bash
react-split auto src/YourComponent.jsx
```

This will:
- Create a `components/` directory
- Extract complex JSX into separate component files
- Update the original file with imports and component references

### 3. Review the Changes

Check the generated files:
```bash
ls components/
```

Open your original file and the extracted components to verify.

### 4. Test Your Application

Make sure everything still works:
```bash
npm run dev  # or your development command
```

## Common Use Cases

### Extract All Components in a Directory

```bash
react-split auto src/**/*.jsx
```

### Adjust Extraction Sensitivity

Only extract very complex components:
```bash
react-split auto --min-elements 7 src/App.jsx
```

Extract more aggressively:
```bash
react-split auto --min-elements 2 src/App.jsx
```

### Custom Output Directory

```bash
react-split auto --output-dir ./subcomponents src/App.jsx
```

### Extract Specific Component by Selector

```bash
# Extract all <header> elements
react-split extract --selector header --name Header src/App.jsx

# Extract by class name
react-split extract --selector "user-profile" --name UserProfile src/App.jsx

# Extract navigation
react-split extract --selector nav --name Navigation src/App.jsx
```

### TypeScript Support

The parser defaults to `tsx` which supports both JSX and TypeScript:

```bash
react-split auto src/App.tsx
```

For pure TypeScript without JSX:
```bash
react-split auto --parser ts src/App.ts
```

For Flow:
```bash
react-split auto --parser flow src/App.jsx
```

## Configuration File

Create a `.react-splitter.json` in your project root for persistent settings:

```bash
react-split init
```

This creates:
```json
{
  "outputDir": "./components",
  "minElements": 3,
  "parser": "tsx",
  "ignore": [
    "**/node_modules/**",
    "**/dist/**",
    "**/build/**"
  ]
}
```

Customize as needed. The CLI will use these settings automatically.

## Workflow Example

Here's a typical workflow for refactoring a large component:

```bash
# 1. Commit your current work
git add .
git commit -m "Before component splitting"

# 2. Preview what will be extracted
react-split auto --dry src/Dashboard.jsx

# 3. If you want fewer components, increase the threshold
react-split auto --dry --min-elements 5 src/Dashboard.jsx

# 4. Apply the transformation
react-split auto --min-elements 5 src/Dashboard.jsx

# 5. Review the changes
ls components/
git diff src/Dashboard.jsx

# 6. Test your application
npm run test
npm run dev

# 7. If good, commit; otherwise revert
git add .
git commit -m "Split Dashboard into subcomponents"
# OR
git checkout .  # to undo changes
```

## Troubleshooting

### No components extracted

- Try lowering `--min-elements`: `react-split auto --min-elements 2 src/App.jsx`
- Check that your file contains React components
- Use `--verbose` for more details: `react-split auto --verbose --dry src/App.jsx`

### Wrong components extracted

- Increase `--min-elements` to be more selective
- Use `extract` command for targeted extraction
- Manually adjust after extraction

### Props are incorrect

The tool uses heuristics to detect props. You may need to:
- Add missing props manually
- Remove unnecessary props
- Add TypeScript types/PropTypes

### Import errors

- Check that the output directory path is correct
- Verify all external dependencies are imported in extracted components
- Add any missing imports manually

## CLI Reference

### Commands

```bash
react-split auto [files...]      # Automatic extraction
react-split extract [files...]   # Extract specific component
react-split init                 # Create config file
react-split --help               # Show help
react-split --version            # Show version
```

### Options for `auto`

```
-d, --dry                     Preview without writing files
-o, --output-dir <dir>        Output directory (default: ./components)
-m, --min-elements <number>   Min JSX elements to extract (default: 3)
-p, --parser <parser>         Parser: babel|tsx|flow|ts (default: tsx)
-v, --verbose                 Verbose output
```

### Options for `extract`

```
-s, --selector <selector>     CSS selector or element (required)
-n, --name <name>             Component name (required)
-d, --dry                     Preview without writing files
-o, --output-dir <dir>        Output directory (default: ./components)
-p, --parser <parser>         Parser to use (default: tsx)
```

## Best Practices

1. **Always use `--dry` first** to preview changes
2. **Commit before transforming** so you can easily revert
3. **Start conservative** with higher `--min-elements` values
4. **Review extracted components** and adjust manually if needed
5. **Run tests** after extraction to ensure nothing broke
6. **Add prop types** to extracted components for better type safety
7. **Refine incrementally** - you can run the tool multiple times

## Next Steps

- Read the [full README](README.md) for detailed documentation
- Check out [EXAMPLES.md](EXAMPLES.md) for before/after transformations
- See [CONFIG.md](CONFIG.md) for advanced configuration options
- Review [NPM_PUBLISH.md](NPM_PUBLISH.md) if you want to contribute

## Support

- Report issues on GitHub
- Check existing documentation
- Run with `--verbose` for debugging

Happy refactoring! 🚀
