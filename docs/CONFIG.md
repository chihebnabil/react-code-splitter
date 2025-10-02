# Configuration Guide

## Transform Options

### split-components.js

Main transform for automatic component splitting.

**Options:**
- `--dry`: Preview changes without writing files
- `--outputDir=<path>`: Output directory (default: `./components`)
- `--minElements=<number>`: Minimum JSX elements to extract (default: `3`)

**Examples:**
```bash
# Basic usage
jscodeshift -t split-components.js src/App.jsx

# Dry run
jscodeshift -t split-components.js --dry src/App.jsx

# Custom settings
jscodeshift -t split-components.js --outputDir=./extracted --minElements=5 src/App.jsx
```

### split-by-selector.js

Targeted extraction by CSS selector.

**Options:**
- `--selector=<string>`: Element or className to extract (required)
- `--name=<string>`: Component name (required)
- `--outputDir=<path>`: Output directory (default: `./components`)
- `--dry`: Preview changes

**Examples:**
```bash
# Extract header element
jscodeshift -t split-by-selector.js --selector="header" --name="Header" src/App.jsx

# Extract by className
jscodeshift -t split-by-selector.js --selector="navigation" --name="Navigation" src/App.jsx

# Dry run
jscodeshift -t split-by-selector.js --dry --selector="footer" --name="Footer" src/App.jsx
```

## Parser Options

Default parser is `tsx` (supports JSX and TypeScript). You can change it:

```bash
# Use Babel parser
jscodeshift -t split-components.js --parser=babel src/App.jsx

# Use Flow parser
jscodeshift -t split-components.js --parser=flow src/App.jsx

# Use TypeScript parser
jscodeshift -t split-components.js --parser=ts src/App.tsx
```

## Batch Processing

Process multiple files at once:

```bash
# All JSX files in a directory
jscodeshift -t split-components.js src/**/*.jsx

# JSX and TSX files
jscodeshift -t split-components.js "src/**/*.{jsx,tsx}"

# Exclude certain directories
jscodeshift -t split-components.js --ignore-pattern="**/node_modules/**" src/**/*.jsx
```

## Performance Options

For large codebases:

```bash
# Run with multiple workers (default: number of CPUs)
jscodeshift -t split-components.js --cpus=4 src/**/*.jsx

# Silent mode (less output)
jscodeshift -t split-components.js --silent src/**/*.jsx

# Verbose mode (more debugging info)
jscodeshift -t split-components.js --verbose=2 src/**/*.jsx
```

## Git Integration

Always commit before running transforms:

```bash
# Check current status
git status

# Commit current work
git add .
git commit -m "Before component split"

# Run transform
jscodeshift -t split-components.js src/App.jsx

# Review changes
git diff

# If satisfied, commit; otherwise revert
git add .
git commit -m "Split components"
# OR
git checkout .
```

## Recommended Workflow

1. **Backup**: Commit your code
2. **Dry Run**: Preview what will be extracted
   ```bash
   jscodeshift -t split-components.js --dry src/App.jsx
   ```
3. **Apply**: Run the transform
   ```bash
   jscodeshift -t split-components.js src/App.jsx
   ```
4. **Review**: Check the generated files
5. **Refine**: Manually adjust as needed
6. **Test**: Ensure everything still works
7. **Commit**: Save your changes

## Troubleshooting

### No components extracted
- Lower `--minElements` value
- Check if your components have enough JSX complexity
- Use `--verbose=2` to see more details

### Wrong props extracted
- The transform uses heuristics; manual adjustment may be needed
- Check for scope issues or context-dependent variables

### Import errors
- Verify the output directory path
- Check if components need additional imports
- Manually add missing dependencies

### Parsing errors
- Try different parser options
- Check for syntax errors in source files
- Use `--parser=tsx` for TypeScript + JSX
