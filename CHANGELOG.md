# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Automated GitHub Actions workflow for npm publishing
- CHANGELOG.md for tracking version history
- .npmignore for optimizing package size

### Changed
- Updated publish workflow to trigger on version tags (v*.*.*)
- Updated CI workflow to run on pull requests

## [1.1.1] - 2025-10-20

### Added
- Complete TypeScript type definitions for job-finder ecosystem
- Core types: QueueItem, JobListing, JobMatch, Company
- Resume customization types: ResumeIntakeData, ExperienceHighlight
- Settings types: AISettings, QueueSettings, StopList
- Logging and generator types for comprehensive coverage

### Fixed
- Package configuration for npm publishing
- TypeScript build outputs with declaration files

## [1.0.0] - Initial Release

### Added
- Initial package structure
- Basic type definitions
- Build configuration
