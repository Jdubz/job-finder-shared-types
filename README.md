# Job Finder Shared Types

[![npm version](https://badge.fury.io/js/%40jdubz%2Fjob-finder-shared-types.svg)](https://www.npmjs.com/package/@jdubz/job-finder-shared-types)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Shared TypeScript type definitions for the job-finder (Python) and portfolio (TypeScript) projects. This package ensures type consistency across both projects by providing a single source of truth for data structures.

## Overview

This package contains TypeScript type definitions that are:
- **Used directly** by the Portfolio project (TypeScript/Firebase)
- **Mirrored** in Pydantic models by the job-finder project (Python)

## Installation

### For TypeScript Projects (Portfolio)

```bash
npm install @jdubz/job-finder-shared-types
```

### For Python Projects (job-finder)

Python projects should mirror these types using Pydantic models. See the [Type Mapping](#type-mapping) section below.

## Usage

### TypeScript

```typescript
import {
  QueueItem,
  QueueStatus,
  JobMatch,
  StopList,
  AISettings,
  QueueSettings
} from '@jdubz/job-finder-shared-types'

// Use types in your code
const queueItem: QueueItem = {
  type: 'job',
  status: 'pending',
  url: 'https://example.com/job/123',
  company_name: 'Example Corp',
  // ...
}
```

### Python (Pydantic)

```python
from pydantic import BaseModel
from typing import Optional, Literal
from datetime import datetime

class JobQueueItem(BaseModel):
    """Mirrors QueueItem from @jdubz/job-finder-shared-types"""
    type: Literal["job", "company"]
    status: Literal["pending", "processing", "success", "failed", "skipped"]
    url: str
    company_name: str
    # ... mirror all fields from TypeScript definition
```

## Type Definitions

### Core Types

#### `QueueItem`
Represents an item in the job processing queue.

**Fields:**
- `id?: string` - Firestore document ID
- `type: QueueItemType` - "job" or "company"
- `status: QueueStatus` - Current processing status
- `url: string` - Job or company URL
- `company_name: string` - Company name
- `source: QueueSource` - Where the item came from
- `submitted_by: string` - User ID who submitted
- `retry_count: number` - Number of retry attempts
- `max_retries: number` - Maximum retries allowed
- `created_at: Date` - Creation timestamp
- `updated_at: Date` - Last update timestamp
- `processed_at?: Date` - When processing started
- `completed_at?: Date` - When processing finished
- `result_message?: string` - Result description
- `error_details?: string` - Error information if failed

#### `QueueStatus`
Processing status enum: `"pending"` | `"processing"` | `"success"` | `"failed"` | `"skipped"`

#### `JobMatch`
AI-analyzed job match result.

**Fields:**
- `id?: string` - Firestore document ID
- `url: string` - Job posting URL
- `company_name: string` - Company name
- `match_score: number` - AI match score (0-100)
- `match_reason: string` - Why this job matches
- `priority: "High" | "Medium" | "Low"` - Application priority
- Plus additional fields for skills, requirements, etc.

#### `StopList`
Exclusion list for filtering jobs.

**Fields:**
- `excludedCompanies: string[]` - Companies to skip
- `excludedKeywords: string[]` - Keywords to avoid
- `excludedDomains: string[]` - Domains to block

#### `QueueSettings`
Queue processing configuration.

**Fields:**
- `maxRetries: number` - Max retry attempts (0-10)
- `retryDelaySeconds: number` - Delay between retries
- `processingTimeout: number` - Max processing time (seconds)

#### `AISettings`
AI provider configuration.

**Fields:**
- `provider: "claude" | "openai"` - AI provider
- `model: string` - Model identifier
- `minMatchScore: number` - Minimum match score (0-100)
- `costBudgetDaily: number` - Daily budget limit

### Helper Types

- `QueueItemType`: `"job"` | `"company"`
- `QueueSource`: `"user_submission"` | `"scraper"` | `"api"` | `"manual"`
- `StopListCheckResult`: Validation result with `allowed` and optional `reason`
- `QueueStats`: Statistics with counts by status

## Type Mapping

### TypeScript → Python Mapping Table

| TypeScript | Python | Example |
|------------|--------|---------|
| `string` | `str` | `url: str` |
| `number` | `int` or `float` | `retry_count: int` |
| `boolean` | `bool` | `allowed: bool` |
| `Date` | `datetime` | `created_at: datetime` |
| `string[]` | `List[str]` | `excludedCompanies: List[str]` |
| `Type \| null` | `Optional[Type]` | `id: Optional[str]` |
| `"a" \| "b"` | `Literal["a", "b"]` | `status: Literal["pending", ...]` |
| Enum | `class MyEnum(str, Enum)` | See Python examples |

### Python Model Example

```python
from pydantic import BaseModel, Field
from typing import Optional, Literal, List
from datetime import datetime
from enum import Enum

class QueueItemType(str, Enum):
    JOB = "job"
    COMPANY = "company"

class QueueStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    SUCCESS = "success"
    FAILED = "failed"
    SKIPPED = "skipped"

class JobQueueItem(BaseModel):
    """Mirrors QueueItem from @jdubz/job-finder-shared-types"""
    
    # Required fields
    type: QueueItemType
    status: QueueStatus = QueueStatus.PENDING
    url: str
    company_name: str
    source: Literal["user_submission", "scraper", "api", "manual"]
    submitted_by: str
    retry_count: int = 0
    max_retries: int = 3
    
    # Timestamps
    created_at: datetime
    updated_at: datetime
    processed_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    
    # Optional fields
    id: Optional[str] = None
    company_id: Optional[str] = None
    result_message: Optional[str] = None
    error_details: Optional[str] = None
    metadata: Optional[dict] = None
    
    class Config:
        use_enum_values = True
```

## Integration Architecture

```
┌─────────────────────────────────────────────────────────┐
│              @jdubz/job-finder-shared-types              │
│                  (TypeScript Definitions)                │
│                   [Single Source of Truth]               │
└────────────┬──────────────────────────────┬──────────────┘
             │                              │
             ▼                              ▼
   ┌──────────────────┐          ┌──────────────────┐
   │    Portfolio     │          │   Job-Finder     │
   │   (TypeScript)   │          │     (Python)     │
   │                  │          │                  │
   │ Direct Import    │          │ Pydantic Models  │
   │ import { ... }   │          │ (Mirrored)       │
   └──────────────────┘          └──────────────────┘
             │                              │
             │         Firestore            │
             └───────────(shared)───────────┘
```

## Workflow

### Making Changes

1. **Update TypeScript types** in this repository
2. **Rebuild the package:** `npm run build`
3. **Commit and push** to GitHub
4. **Update Portfolio:** `npm update @jdubz/job-finder-shared-types`
5. **Update Python models** in job-finder to mirror changes
6. **Test both projects** together
7. **Deploy to staging** and verify integration

### Version Management

This package uses semantic versioning:
- **Major:** Breaking changes to types
- **Minor:** New types or optional fields added
- **Patch:** Documentation or non-breaking fixes

## Development

### Building

```bash
npm install
npm run build
```

### Testing Types

```bash
npm test
```

This runs TypeScript compilation without emitting files to catch type errors.

### Publishing

Publishing is done automatically via GitHub Actions when a new version tag is pushed:

```bash
# Update version in package.json
npm version patch  # or minor, major

# Push with tags
git push && git push --tags
```

## Related Projects

- **Portfolio:** [github.com/Jdubz/portfolio](https://github.com/Jdubz/portfolio)
- **Job-Finder:** [github.com/Jdubz/job-finder](https://github.com/Jdubz/job-finder)

## Documentation

For detailed integration documentation, see:
- [Type Synchronization Guide](./docs/synchronization.md) (TODO)
- [Python Pydantic Examples](./docs/python-examples.md) (TODO)
- [Portfolio Integration](https://github.com/Jdubz/portfolio/blob/main/CLAUDE.md)
- [Job-Finder Integration](https://github.com/Jdubz/job-finder/blob/main/CLAUDE.md)

## License

MIT © Josh Wentworth

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Ensure types build successfully
5. Submit a pull request

**Important:** When modifying types:
- Update this README if new types are added
- Update Python examples in job-finder documentation
- Test changes in both portfolio and job-finder projects
- Consider backward compatibility

## Support

For issues or questions:
- **Issues:** [GitHub Issues](https://github.com/Jdubz/job-finder-shared-types/issues)
- **Discussions:** [GitHub Discussions](https://github.com/Jdubz/job-finder-shared-types/discussions)
