# React Code Splitter - Project Summary

## Overview

This project provides jscodeshift transforms for automatically splitting monolithic React component files into smaller, more maintainable subcomponents.

## Project Structure

```
react-code-splitter/
├── split-components.js          # Main automatic extraction transform
├── split-by-selector.js         # Targeted extraction by selector
├── utils.js                     # Reusable utility functions
├── package.json                 # Dependencies and scripts
├── jest.config.js               # Test configuration
├── .gitignore                   # Git ignore rules
├── README.md                    # Full documentation
├── QUICKSTART.md                # Quick start guide
├── USAGE.md                     # Usage examples
├── CONFIG.md                    # Configuration guide
├── examples/
│   └── App.jsx                  # Example component for testing
└── __tests__/
    └── split-components.test.js # Unit tests
```

## Key Features

### 1. Automatic Component Extraction (`split-components.js`)

**What it does:**
- Analyzes React components to find complex JSX structures
- Automatically extracts them into separate component files
- Generates meaningful component names based on context
- Identifies and passes props correctly
- Updates original file with imports and component references

**Key functions:**
- `isReactComponent()` - Detects React components
- `findExtractableCandidates()` - Finds JSX to extract
- `extractPropsFromJSX()` - Identifies needed props
- `generateComponentCode()` - Creates new component files

### 2. Targeted Extraction (`split-by-selector.js`)

**What it does:**
- Extracts specific elements by CSS selector or element type
- Useful when you know exactly what to extract
- Simpler and more predictable than automatic extraction

**Use cases:**
- Extract header: `--selector="header" --name="Header"`
- Extract navigation: `--selector="nav" --name="Navigation"`
- Extract by class: `--selector="sidebar" --name="Sidebar"`

### 3. Utility Functions (`utils.js`)

Reusable helper functions for building transforms:
- Component detection and analysis
- Name generation and formatting
- JSX manipulation
- Import management
- Code generation

## How It Works

### Transform Flow

1. **Parse**: jscodeshift parses the React file into an AST
2. **Analyze**: The transform finds React components and JSX structures
3. **Identify**: Locates extractable sections based on criteria
4. **Extract**: Generates new component code with props
5. **Modify**: Updates original file with imports and references
6. **Write**: Creates new component files

### AST Manipulation

The transforms use jscodeshift's AST API to:
- Find JSX elements: `j.find(j.JSXElement)`
- Count complexity: Count child elements
- Extract identifiers: Find variables used in JSX
- Replace nodes: Swap JSX with component references
- Add imports: Insert import statements

### Prop Detection

Props are detected by:
1. Finding all `Identifier` nodes in JSX
2. Filtering out component names (PascalCase)
3. Filtering out React/Fragment
4. Collecting unique variable names
5. Passing as component props

## Configuration Options

### Common Options

| Option | Default | Description |
|--------|---------|-------------|
| `--dry` | false | Preview without writing files |
| `--outputDir` | `./components` | Output directory for components |
| `--minElements` | 3 | Min JSX elements to extract |
| `--parser` | `tsx` | Parser to use (tsx, babel, flow) |

### Advanced Options

| Option | Description |
|--------|-------------|
| `--cpus` | Number of parallel workers |
| `--verbose` | Logging level (0-2) |
| `--silent` | Suppress output |
| `--ignore-pattern` | Skip matching paths |

## Best Practices

### Before Running

1. ✅ Commit all changes to version control
2. ✅ Run with `--dry` first to preview
3. ✅ Start with one file to test
4. ✅ Back up important files

### Configuration Tips

1. **Start conservative**: Use `--minElements=5` or higher
2. **Custom output**: Use meaningful `--outputDir` names
3. **Incremental**: Process files one at a time initially
4. **Review**: Always review generated files

### After Running

1. ✅ Review all generated files
2. ✅ Test that components render correctly
3. ✅ Check prop types and interfaces
4. ✅ Adjust imports if needed
5. ✅ Run linter and tests
6. ✅ Commit changes

## Limitations & Considerations

### What Works Well

- Function components
- Arrow function components
- Class components with render methods
- Simple prop patterns
- Standard JSX structures

### What May Need Manual Adjustment

- Complex prop types (objects, arrays)
- State management (useState, useReducer)
- Context consumers
- Ref forwarding
- Event handlers with closure
- TypeScript generic components

### Known Limitations

1. **Prop detection is heuristic-based**: May include extra or miss some props
2. **No type inference**: TypeScript types need manual addition
3. **State not handled**: Components with state need careful review
4. **Context not preserved**: Context usage may break
5. **Import resolution**: External dependencies must be added manually

## Extending the Transform

### Adding Custom Logic

You can modify the transforms to:

1. **Custom naming strategy**:
```javascript
function customComponentName(jsxElement) {
  // Your logic here
  return 'MyComponent';
}
```

2. **Different extraction criteria**:
```javascript
function shouldExtract(jsxElement) {
  // Custom rules
  return customCheck(jsxElement);
}
```

3. **Additional file types**:
```javascript
module.exports.parser = 'ts'; // For TypeScript
```

4. **Custom templates**:
```javascript
function generateCode(name, jsx, props) {
  return `// Custom template
export const ${name} = (${props}) => ${jsx};`;
}
```

## Testing

Run tests with:
```bash
npm test
```

Test structure:
- Uses `defineInlineTest` from jscodeshift
- Tests dry run mode
- Validates different component types
- Checks edge cases

## Common Issues & Solutions

### Issue: No components extracted
**Solution**: Lower `--minElements` or check JSX complexity

### Issue: Wrong props detected
**Solution**: Manually adjust props in generated files

### Issue: Import errors
**Solution**: Check import paths and add missing dependencies

### Issue: Component doesn't render
**Solution**: Verify state/context dependencies and adjust

## Contributing

To contribute:
1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Update documentation
5. Submit a pull request

## Resources

- [jscodeshift Documentation](https://github.com/facebook/jscodeshift)
- [AST Explorer](https://astexplorer.net/)
- [Recast Documentation](https://github.com/benjamn/recast)
- [React Patterns](https://reactpatterns.com/)

## License

MIT License - see LICENSE file for details

## Support

For issues, questions, or contributions:
- Check existing documentation
- Review example files
- Run with `--verbose=2` for debugging
- Open an issue on GitHub

---

**Version**: 1.0.0  
**Last Updated**: 2024
