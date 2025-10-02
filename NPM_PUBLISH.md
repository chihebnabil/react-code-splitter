# Publishing to NPM

## Prerequisites

1. Create an npm account at [npmjs.com](https://www.npmjs.com/signup)
2. Login to npm CLI:
   ```bash
   npm login
   ```

## Pre-publish Checklist

- [ ] Update version in `package.json`
- [ ] Run tests: `npm test`
- [ ] Update CHANGELOG.md (if exists)
- [ ] Update README.md with any new features
- [ ] Commit all changes
- [ ] Tag the release in git

## Publishing Steps

### 1. Check what will be published

```bash
npm pack --dry-run
```

This shows exactly which files will be included in the package.

### 2. Test the package locally

```bash
# Create a tarball
npm pack

# In another project, test install it
npm install /path/to/react-code-splitter-1.0.0.tgz
```

### 3. Update version

```bash
# Patch version (1.0.0 -> 1.0.1)
npm version patch

# Minor version (1.0.0 -> 1.1.0)
npm version minor

# Major version (1.0.0 -> 2.0.0)
npm version major
```

This automatically:
- Updates `package.json`
- Runs tests (via `prepublishOnly`)
- Creates a git commit
- Creates a git tag

### 4. Publish to npm

```bash
# Public package (free)
npm publish --access public

# Or for scoped packages (@yourname/react-code-splitter)
npm publish --access public
```

### 5. Push to git

```bash
git push
git push --tags
```

## Post-publish

1. Create a GitHub release with release notes
2. Announce on social media, if desired
3. Update documentation site (if applicable)

## Common Issues

### Package name already taken

If `react-code-splitter` is taken, use a scoped package:

```json
{
  "name": "@yourusername/react-code-splitter"
}
```

### Authentication errors

```bash
npm logout
npm login
```

### Publish fails

Check:
- Tests are passing: `npm test`
- You're logged in: `npm whoami`
- Version number is incremented
- No uncommitted changes

## Unpublishing

⚠️ **Warning**: Unpublishing is discouraged after 24 hours.

```bash
# Unpublish a specific version
npm unpublish react-code-splitter@1.0.0

# Unpublish entire package (only within 72 hours)
npm unpublish react-code-splitter --force
```

## Package Scope

To publish as a scoped package under your username:

1. Update `package.json`:
   ```json
   {
     "name": "@yourusername/react-code-splitter"
   }
   ```

2. Publish:
   ```bash
   npm publish --access public
   ```

## Automated Publishing (GitHub Actions)

Create `.github/workflows/publish.yml`:

```yaml
name: Publish to NPM

on:
  release:
    types: [created]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
      - run: npm ci
      - run: npm test
      - run: npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

Add your npm token as a GitHub secret named `NPM_TOKEN`.

## Version History

Follow semantic versioning:

- **MAJOR** (X.0.0): Breaking changes
- **MINOR** (1.X.0): New features, backward compatible
- **PATCH** (1.0.X): Bug fixes

## Next Steps After Publishing

1. Verify package on npm: https://www.npmjs.com/package/react-code-splitter
2. Test installation: `npm install react-code-splitter`
3. Test CLI: `npx react-code-splitter --help`
4. Monitor npm downloads and issues
5. Respond to GitHub issues and PRs
