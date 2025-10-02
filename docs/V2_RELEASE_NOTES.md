# React Code Splitter v2.0.0 - Interactive Mode 🎉

## What's New

### 🎤 Interactive Mode (Major Feature!)

**Problem Solved**: The automatic extraction generated meaningless names like `CardComponent20`, `Flex7`, `CardContentComponent32`.

**Solution**: Interactive mode lets YOU name each component!

### How It Works

```bash
react-split auto --interactive src/YourComponent.jsx
```

1. **Tool analyzes** your component
2. **Shows each candidate** with:
   - JSX preview (first 5 lines)
   - Element count
   - Suggested name
3. **You decide**:
   - Extract it? (Yes/No)
   - What name? (e.g., `PaymentSummary`, `UserProfileCard`)
4. **Tool generates** files with your meaningful names

### Example Session

```
📄 Processing: src/AdminPage.tsx

✓ Found 3 extractable component(s)

Candidate 1/3:
──────────────────────────────────────────────────
<div className="payment-summary">
  <h3>Payment Details</h3>
  <p>Total: ${amount}</p>
  <button>Process Payment</button>
</div>
──────────────────────────────────────────────────
(8 JSX elements)

? Extract this component? Yes
? Component name: PaymentSummary

Candidate 2/3:
──────────────────────────────────────────────────
<section className="user-list">
  <h2>Active Users</h2>
  <ul>
    <li>John Doe</li>
    ...
──────────────────────────────────────────────────
(12 JSX elements)

? Extract this component? Yes
? Component name: ActiveUsersList

Candidate 3/3:
──────────────────────────────────────────────────
<footer className="footer">
  <p>© 2024</p>
</footer>
──────────────────────────────────────────────────
(2 JSX elements)

? Extract this component? No

🔨 Extracting 2 component(s)...

  ✓ Created components/PaymentSummary.jsx
  ✓ Created components/ActiveUsersList.jsx
  ✓ Updated src/AdminPage.tsx

✨ Interactive extraction complete!
```

## Installation

```bash
# Update to v2.0.0
npm install -g react-code-splitter@latest

# Or for project
npm install --save-dev react-code-splitter@latest
```

## Usage

### Interactive Mode (RECOMMENDED)

```bash
# Interactive with preview
react-split auto --interactive --dry src/App.jsx

# Interactive with extraction
react-split auto --interactive src/App.jsx

# Adjust threshold for candidates
react-split auto --interactive --min-elements 5 src/App.jsx
```

### Automatic Mode (Still Available)

```bash
# Generates generic names (CardComponent1, etc.)
react-split auto src/App.jsx
```

### Manual Extraction

```bash
# You identify the section and name it
react-split extract --selector "payment-summary" --name PaymentSummary src/App.jsx
```

## Benefits

| Before v2.0 | After v2.0 |
|-------------|------------|
| `CardComponent20.jsx` | `PaymentSummary.jsx` ✨ |
| `Flex7.jsx` | `UserProfileCard.jsx` ✨ |
| `CardContentComponent32.jsx` | `StatisticsPanel.jsx` ✨ |
| Generic, meaningless names | Semantic, purposeful names |

## New Dependencies

- **inquirer** v8.2.5 - Interactive CLI prompts
- **glob** v7.2.3 - File pattern matching

## Breaking Changes

None! The old automatic mode still works exactly the same way.

## Migration Guide

No migration needed. Just add `--interactive` flag to your commands:

```bash
# Old way (still works)
react-split auto src/App.jsx

# New way (RECOMMENDED)
react-split auto --interactive src/App.jsx
```

## Files Changed

- **bin/cli.js** - Added interactive mode logic and prompts
- **split-components-interactive.js** - New transform for interactive extraction
- **package.json** - Added inquirer and glob dependencies
- **README.md** - Updated with interactive mode documentation

## Testing

Run the example:

```bash
# Try it on the example file
react-split auto --interactive examples/Dashboard.jsx

# Preview first
react-split auto --interactive --dry examples/Dashboard.jsx
```

## Publishing

```bash
# Test first
npm test

# Bump version (already done: v2.0.0)
# npm version major

# Publish
npm publish
```

## Feedback

This is a MAJOR improvement to the developer experience. Instead of:
- ❌ Running tool → Getting generic names → Manually renaming files → Fixing imports

You now have:
- ✅ Running tool → Naming as you go → Done!

---

**Ready to publish v2.0.0!** 🚀
