# PUBLISH-1 — Set Up Package Publishing

> **Context**: This package (@jdubzw/job-finder-shared-types) needs to be published to npm registry for consumption by FE, BE, and worker repos. See `README.md` for current package.json structure.
> **Architecture**: This is a foundational package that must be versioned and published independently from consuming repos.

---

## Issue Metadata

```yaml
Title: PUBLISH-1 — Set Up Package Publishing
Labels: [priority-p1, repository-shared-types, type-infrastructure, status-done]
Assignee: PM
Priority: P1-High
Estimated Effort: 1-2 days
Repository: job-finder-shared-types
```

---

## Summary

**Problem**: While package.json exists with basic publishing config, there's no automated CI/CD pipeline for testing, building, and publishing the package to npm. Manual publishing is error-prone and lacks version validation. Consuming repos need reliable access to versioned package updates.

**Goal**: Establish automated GitHub Actions workflow for package publishing with proper versioning, testing, and distribution to npm registry (or GitHub Packages as alternative).

**Impact**: All consuming repos (FE, BE, worker) depend on this package. Automated publishing ensures type updates are distributed reliably and version management is consistent across the ecosystem.

---

## Resolution

- Hardened package configuration (`package.json`, `tsconfig.json`, `.npmignore`) and documented versioning workflow plus changelog updates in `README.md` + `CHANGELOG.md`.
- Added automation: `.github/workflows/publish.yml` handles tag-triggered publish, `ci.yml` covers lint/build on PRs, with NPM_TOKEN configured in repo secrets (verified during 1.1.1 publish).
- Validated release pipeline 2025-10-20 via `npm run prepublishOnly`, `npm publish --access public` (through GH Actions), confirmed install from registry with `npm view @jsdubzw/job-finder-shared-types version` and FE install/build commands.

---

## Architecture References

> **Read these docs first for context:**

- **[README.md](../../README.md)** - Publishing section, workflow overview
- **[package.json](../../package.json)** - Current package configuration
- **[tsconfig.json](../../tsconfig.json)** - TypeScript build configuration

**Key concepts to understand**:
- **Semantic versioning**: Major (breaking), Minor (features), Patch (fixes)
- **npm publishing**: How to publish scoped packages (@jdubzw/job-finder-shared-types)
- **GitHub Packages**: Alternative to npm registry if preferred
- **Build artifacts**: dist/ folder with compiled .js and .d.ts files

---

## Tasks

### Phase 1: Package Configuration
1. **Verify package.json configuration**
   - What: Ensure all required fields are correct (name, version, main, types, files)
   - Where: `package.json` (already exists)
   - Why: npm requires specific structure for successful publishing
   - Test: Run `npm pack` locally to verify package structure

2. **Configure tsconfig.json for publishing**
   - What: Verify build outputs .d.ts declaration files and source maps
   - Where: `tsconfig.json` (already exists)
   - Why: Consumers need .d.ts files for TypeScript autocomplete
   - Test: Run `npm run build` and check dist/ contents

3. **Add publishing scripts**
   - What: Create/verify prepublishOnly, version scripts in package.json
   - Where: `package.json` scripts section
   - Why: Ensures clean build before every publish
   - Test: Run scripts manually to verify behavior

### Phase 2: CI/CD Pipeline Setup
4. **Create GitHub Actions workflow for publishing**
   - What: Workflow that tests, builds, and publishes on version tags
   - Where: `.github/workflows/publish.yml` (create)
   - Why: Automates publishing process, reduces human error
   - Test: Push test tag to trigger workflow

5. **Set up npm authentication**
   - What: Add NPM_TOKEN secret to GitHub repo settings
   - Where: GitHub repo → Settings → Secrets → Actions
   - Why: Required for automated publishing to npm registry
   - Test: Verify secret exists in workflow environment

6. **Configure version management**
   - What: Document versioning workflow, create CHANGELOG.md template
   - Where: Create `CHANGELOG.md`, update `README.md` workflow section
   - Why: Tracks version history and communicates changes to consumers
   - Test: Create first changelog entry

---

## Technical Details

### Files to Modify/Create

```
VERIFY:
- package.json - Confirm scripts, files, publishConfig correct
- tsconfig.json - Confirm declaration: true, outDir: ./dist
- README.md:341 - Publishing section exists, may need updates

CREATE:
- .github/workflows/publish.yml - Automated publishing workflow
- .github/workflows/test.yml - PR testing workflow (optional but recommended)
- CHANGELOG.md - Version history template
- .npmignore - Exclude test files, docs from published package (optional)

REFERENCE:
- job-finder-FE/.github/workflows/ - Example CI/CD workflows
- job-finder-BE/.github/workflows/ - Example deploy workflows
```

### Key Implementation Notes

**GitHub Actions Publish Workflow**:
```yaml
# .github/workflows/publish.yml
name: Publish to npm

on:
  push:
    tags:
      - 'v*.*.*'

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          registry-url: 'https://registry.npmjs.org'

      - run: npm ci
      - run: npm test
      - run: npm run build

      - run: npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

**Version Management Workflow**:
```bash
# Update version
npm version patch  # 1.1.1 -> 1.1.2
npm version minor  # 1.1.2 -> 1.2.0
npm version major  # 1.2.0 -> 2.0.0

# Push with tags (triggers publish workflow)
git push && git push --tags
```

**Integration Points**:
- **npm registry**: Published package available via `npm install @jdubzw/job-finder-shared-types`
- **GitHub Packages**: Alternative if npm registry has issues
- **Consuming repos**: Update with `npm update @jdubzw/job-finder-shared-types`

---

## Acceptance Criteria

- [x] **package.json validated**: All required fields correct (name, version, main, types, files, publishConfig)
- [x] **Build outputs correct**: dist/ contains .js, .d.ts files after `npm run build`
- [x] **Publish workflow created**: `.github/workflows/publish.yml` exists and is valid
- [x] **npm authentication set**: NPM_TOKEN secret configured in GitHub repo
- [x] **Test workflow created**: `.github/workflows/test.yml` runs on PRs (optional)
- [x] **CHANGELOG.md created**: Template exists with initial entry
- [x] **Version workflow documented**: README.md updated with publishing instructions
- [x] **First publish succeeds**: Package published to npm and visible at npmjs.com
- [x] **Install test passes**: Can install package in FE repo via `npm install @jdubzw/job-finder-shared-types`

---

## Testing

### Test Commands

```bash
# Test package structure
npm pack
tar -xzf jsdubzw-job-finder-shared-types-*.tgz
ls -la package/

# Test build
npm run clean && npm run build
ls -la dist/

# Test prepublishOnly script
npm run prepublishOnly

# Dry run publish (doesn't actually publish)
npm publish --dry-run

# Test version bump
npm version patch --no-git-tag-version
git checkout package.json  # reset
```

### Manual Testing

```bash
# Step 1: Create test tag locally
git tag v1.1.2-test
git push origin v1.1.2-test

# Step 2: Monitor GitHub Actions
# Go to GitHub repo → Actions tab → Watch workflow run

# Step 3: Check npm registry
open https://www.npmjs.com/package/@jdubzw/job-finder-shared-types

# Step 4: Test install in FE repo
cd /home/jdubz/Development/job-finder-app-manager/job-finder-FE
npm install @jdubzw/job-finder-shared-types@latest
npm ls @jdubzw/job-finder-shared-types

# Step 5: Verify types work
# Import types in FE code and check autocomplete
```

---

## Commit Message Template

```
build(publish): set up automated npm publishing workflow

Configured GitHub Actions workflow for automated package publishing:
- Created .github/workflows/publish.yml for tag-based publishing
- Created .github/workflows/test.yml for PR validation (optional)
- Verified package.json publishing configuration
- Added CHANGELOG.md for version tracking
- Updated README.md with publishing workflow documentation

Key changes:
- .github/workflows/publish.yml - Automated publish on version tags
- .github/workflows/test.yml - PR testing workflow
- CHANGELOG.md - Version history template
- README.md - Updated publishing section with workflow
- package.json - Verified scripts (prepublishOnly, version)

Testing:
- npm pack verified package structure
- npm publish --dry-run succeeded
- Test workflow triggered successfully
- First publish to npm succeeded

Closes #3
```

**Example**:
```
build(ci): add GitHub Actions workflow for npm publishing

Created automated publishing workflow that triggers on version tags:
- Tests and builds package
- Publishes to npm with --access public
- Requires NPM_TOKEN secret in GitHub

Key changes:
- Created .github/workflows/publish.yml
- Updated README.md publishing section
- Added CHANGELOG.md template

Testing:
- Dry run succeeded
- Workflow validated via test tag

Closes #3
```

---

## Related Issues

- **Depends on**: [Issue #2] - Complete type definitions needed before publishing
- **Blocks**: [Issue #4] - API types will need publishing workflow
- **Related**: job-finder-FE - Needs to install published package
- **Related**: job-finder-BE - Needs to install published package

---

## Resources

### Documentation
- **npm Publishing Guide**: [docs.npmjs.com/cli/v9/commands/npm-publish](https://docs.npmjs.com/cli/v9/commands/npm-publish)
- **GitHub Actions**: [docs.github.com/en/actions](https://docs.github.com/en/actions)
- **Semantic Versioning**: [semver.org](https://semver.org/)

### External References
- [GitHub Actions for npm publishing](https://docs.github.com/en/actions/publishing-packages/publishing-nodejs-packages)
- [npm scoped packages](https://docs.npmjs.com/cli/v9/using-npm/scope)
- [TypeScript declaration files](https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html)

---

## Success Metrics

**How we'll measure success**:
- **Publish automation**: 0 manual publish steps required after initial setup
- **Publish time**: < 2 minutes from tag push to npm availability
- **Install reliability**: 100% success rate for `npm install @jdubzw/job-finder-shared-types`
- **Version consistency**: Package version matches git tags

---

## Notes

**Questions? Need clarification?**
- Comment on this issue with specific questions
- Tag @PM for guidance
- Check npm registry status at [status.npmjs.org](https://status.npmjs.org)

**Implementation Tips**:
- Test workflow with a `-test` tag first (e.g., v1.1.2-test)
- Use `npm publish --dry-run` to validate package before actual publish
- Keep CHANGELOG.md updated with every version bump
- Consider GitHub Packages if npm registry has authentication issues
- Document common publishing errors in README troubleshooting section

**Publishing Checklist**:
1. All tests pass (`npm test`)
2. Build succeeds (`npm run build`)
3. Update CHANGELOG.md with changes
4. Bump version (`npm version patch/minor/major`)
5. Push with tags (`git push && git push --tags`)
6. Monitor GitHub Actions workflow
7. Verify package on npmjs.com
8. Test install in consuming repo

**Alternative: GitHub Packages**:
If npm registry publishing is problematic, consider GitHub Packages:
- Update package.json publishConfig to GitHub registry
- Use GITHUB_TOKEN instead of NPM_TOKEN
- Consumers need .npmrc configuration for @jdubzw scope

---

**Created**: 2025-10-20
**Created By**: PM
**Last Updated**: 2025-10-20
**Status**: Done
