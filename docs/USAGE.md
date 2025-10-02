# Simple Component Splitter

A simplified version of the transform that focuses on extracting specific patterns.

## Usage Example

```bash
# Extract components with at least 5 JSX elements
npx jscodeshift -t split-components.js --minElements=5 examples/App.jsx

# Preview what would be extracted
npx jscodeshift -t split-components.js --dry examples/App.jsx

# Output to a custom directory
npx jscodeshift -t split-components.js --outputDir=./extracted-components examples/App.jsx
```

## What Gets Extracted

The transform looks for JSX elements that:
1. Have at least `minElements` (default: 3) child JSX elements
2. Can be meaningfully named based on their structure
3. Have clearly identifiable props

## Testing

Try it on the example file:

```bash
npm install
npx jscodeshift -t split-components.js --dry examples/App.jsx
```

You should see output indicating which components would be extracted.

## Advanced Usage

### Custom Parser

The transform uses the 'tsx' parser by default to support both JSX and TypeScript. If you need to use a different parser:

```bash
npx jscodeshift -t split-components.js --parser=babel examples/App.jsx
```

### Processing Multiple Files

```bash
# Process all JSX files in a directory
npx jscodeshift -t split-components.js src/**/*.jsx

# Process both JSX and TSX files
npx jscodeshift -t split-components.js "src/**/*.{jsx,tsx}"
```

## Customization

You can modify the transform to suit your needs:

1. **Change naming strategy**: Edit the `toPascalCase` and naming logic
2. **Adjust extraction criteria**: Modify `findExtractableCandidates`
3. **Custom prop extraction**: Update `extractPropsFromJSX`
4. **Different file structure**: Change how files are written in the main transform logic

## Tips for Best Results

1. **Start conservative**: Use a higher `minElements` value (e.g., 5-7) to only extract substantial components
2. **Review before committing**: Always use `--dry` first
3. **Manual refinement**: The automated extraction is a starting point; you may want to adjust:
   - Component names
   - Prop interfaces
   - Import paths
   - Component composition

## Common Patterns Detected

- Header sections
- Navigation menus
- Card layouts
- List items
- Form sections
- Footer content

The transform attempts to generate semantic names based on:
- CSS class names
- HTML element types
- JSX structure
