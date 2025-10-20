# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Automated package publishing workflow via GitHub Actions
- CHANGELOG.md for tracking version history
- .npmignore for optimizing published package contents

### Changed
- Publish workflow triggers on semantic version tags (`v*.*.*`)
- CI workflow runs on pull requests to guard publishing quality

## [1.1.1] - 2025-10-20

### Added
- Complete TypeScript type definitions for the job-finder ecosystem
- Resume customization types (ResumeIntakeData, ExperienceHighlight, GapMitigation)
- Settings types (AISettings, QueueSettings, StopList)
- Logging and generator types for comprehensive coverage

### Changed
- Improved type documentation and package configuration for npm publishing

### Fixed
- TypeScript build outputs with declaration files

## [1.1.0] - 2025-10-19

### Added
- Enhanced type definitions for job finder and portfolio projects
- Comprehensive type documentation in README.md

## [1.0.0] - 2025-10-18

### Added
- Initial package structure and build configuration
- Core types: QueueItem, JobListing, JobMatch, Company
- Helper types for queue management and AI settings
- TypeScript type definitions with `.d.ts` output
- Python integration examples

[Unreleased]: https://github.com/Jdubz/job-finder-shared-types/compare/v1.1.1...HEAD
[1.1.1]: https://github.com/Jdubz/job-finder-shared-types/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/Jdubz/job-finder-shared-types/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/Jdubz/job-finder-shared-types/releases/tag/v1.0.0
