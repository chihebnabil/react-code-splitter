# Quick Start Guide

## Installation

1. Clone or download this project:
```bash
cd react-code-splitter
```

2. Install dependencies:
```bash
npm install
```

## Your First Transform

### Step 1: Try the Example

We've included an example React component that's perfect for splitting:

```bash
npx jscodeshift -t split-components.js --dry examples/App.jsx
```

You should see output like:
```
[DRY RUN] Would create: AppHeader with props: title, subtitle, userName, userEmail, isLoggedIn
[DRY RUN] Would create: Hero with props: title, subtitle, handleClick
[DRY RUN] Would create: Features with props: (none)
...
```

### Step 2: Apply the Transform

Remove `--dry` to actually create the files:

```bash
npx jscodeshift -t split-components.js examples/App.jsx
```

This will:
- Create a `components` folder (if it doesn't exist)
- Extract subcomponents into separate files
- Update the original file with imports and component references

### Step 3: Review the Results

Check the generated files:
```bash
ls examples/components/
```

Open the files to see the extracted components.

## Using on Your Own Code

### Method 1: Automatic Extraction

Let the transform automatically identify components to extract:

```bash
npx jscodeshift -t split-components.js path/to/your/Component.jsx
```

Adjust sensitivity with `--minElements`:
```bash
# Only extract very complex components
npx jscodeshift -t split-components.js --minElements=10 path/to/your/Component.jsx
```

### Method 2: Targeted Extraction

Extract specific elements by selector:

```bash
npx jscodeshift -t split-by-selector.js \
  --selector="header" \
  --name="Header" \
  path/to/your/Component.jsx
```

## Common Use Cases

### Extract Header Component

```bash
npx jscodeshift -t split-by-selector.js \
  --selector="header" \
  --name="Header" \
  src/App.jsx
```

### Extract Multiple Components from One File

Run the transform multiple times with different settings:

```bash
# Extract large components first
npx jscodeshift -t split-components.js --minElements=10 src/App.jsx

# Then extract medium components
npx jscodeshift -t split-components.js --minElements=5 src/App.jsx
```

### Process All Components in a Directory

```bash
npx jscodeshift -t split-components.js src/**/*.jsx
```

## Safety Tips

### Always Use Version Control

Before running any transform:
```bash
git add .
git commit -m "Before refactoring"
```

After running:
```bash
git diff  # Review changes
git add . # If good
git commit -m "Split components"
# OR
git checkout .  # If you want to undo
```

### Start with Dry Runs

Always preview first:
```bash
npx jscodeshift -t split-components.js --dry src/App.jsx
```

### Start Small

Don't try to transform your entire codebase at once:
1. Start with one component
2. Review the results
3. Adjust settings
4. Gradually expand to more files

## Customization

### Change Output Directory

```bash
npx jscodeshift -t split-components.js \
  --outputDir=./subcomponents \
  src/App.jsx
```

### Adjust Extraction Threshold

```bash
# More aggressive (smaller components)
npx jscodeshift -t split-components.js --minElements=2 src/App.jsx

# More conservative (only large components)
npx jscodeshift -t split-components.js --minElements=8 src/App.jsx
```

## Next Steps

1. Read [README.md](README.md) for full documentation
2. Check [CONFIG.md](CONFIG.md) for all configuration options
3. See [USAGE.md](USAGE.md) for advanced usage patterns
4. Run tests: `npm test`

## Troubleshooting

### "jscodeshift: command not found"
```bash
npm install  # Make sure dependencies are installed
npx jscodeshift --version  # Should show version
```

### "No components extracted"
- Try lowering `--minElements`: `--minElements=2`
- Use `--verbose=2` to see more details
- Check if your component has enough JSX complexity

### Generated components don't work
- Check for missing imports in extracted components
- Verify prop usage is correct
- Some complex state/context may need manual adjustment

## Help

Run with verbose output to see what's happening:
```bash
npx jscodeshift -t split-components.js --verbose=2 src/App.jsx
```

Check the code for inline comments explaining each function.
