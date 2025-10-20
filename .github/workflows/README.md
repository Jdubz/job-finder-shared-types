# GitHub Workflows

This directory contains GitHub Actions workflows for automated CI/CD.

## Workflows

### CI (`ci.yml`)
Runs on every pull request and push to main/staging branches.
- Type checks TypeScript code
- Builds the package
- Verifies build output

### Publish (`publish.yml`)
Automatically publishes the package to npm when changes are merged to main.
- Only publishes if the version number has changed
- Creates a git tag for the release
- Requires `NPM_TOKEN` secret to be configured

## Setup Instructions

### NPM Token Setup

To enable automatic publishing to npm, you need to set up the `NPM_TOKEN` secret:

1. **Generate npm token:**
   - Go to https://www.npmjs.com/
   - Sign in to your account
   - Click on your profile → Access Tokens → Generate New Token
   - Choose "Automation" token type
   - Copy the generated token

2. **Add token to GitHub:**
   - Go to https://github.com/Jdubz/job-finder-shared-types/settings/secrets/actions
   - Click "New repository secret"
   - Name: `NPM_TOKEN`
   - Value: Paste your npm token
   - Click "Add secret"

3. **Verify setup:**
   - Make a change to the package (e.g., update version in package.json)
   - Commit and push to main
   - Check the Actions tab to see the workflow run

## Publishing Process

When you want to publish a new version:

1. Update the version in `package.json`:
   ```bash
   npm version patch  # or minor, major
   ```

2. Commit and push to main:
   ```bash
   git add package.json
   git commit -m "chore: bump version to x.x.x"
   git push origin main
   ```

3. The GitHub Action will automatically:
   - Build the package
   - Publish to npm (if version changed)
   - Create a git tag

## Manual Publishing

If you need to publish manually:

```bash
npm run build
npm publish
```

Make sure you're logged in to npm first: `npm login`
