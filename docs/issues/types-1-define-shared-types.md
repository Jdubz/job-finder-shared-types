# TYPES-1 — Define Shared TypeScript Types

> **Context**: This is a foundational package used by job-finder-FE, job-finder-BE, and job-finder-worker repos. See `README.md` for project overview and type mapping guidance.
> **Architecture**: See `/home/jdubz/Development/job-finder-app-manager/docs/architecture/SYSTEM_ARCHITECTURE.md` for integration details.

---

## Issue Metadata

```yaml
Title: TYPES-1 — Define Shared TypeScript Types
Labels: [priority-p1, repository-shared-types, type-feature, status-todo]
Assignee: PM
Priority: P1-High
Estimated Effort: 2-3 days
Repository: job-finder-shared-types
```

---

## Summary

**Problem**: The shared-types package currently has basic type definitions, but needs comprehensive type coverage for all core domain entities (QueueItem, JobMatch, ContentItem, AISettings) and Firestore document types. Without complete types, FE, BE, and worker repos may have type inconsistencies leading to runtime errors.

**Goal**: Establish complete, well-documented TypeScript type definitions that serve as the single source of truth for all job-finder repositories.

**Impact**: All three consuming repositories (FE, BE, worker) depend on accurate types for type safety, autocomplete, and preventing runtime errors. Python worker repo will mirror these types using Pydantic.

---

## Architecture References

> **Read these docs first for context:**

- **[README.md](../../README.md)** - Package overview, usage examples, type mapping
- **[SYSTEM_ARCHITECTURE.md](/home/jdubz/Development/job-finder-app-manager/docs/architecture/SYSTEM_ARCHITECTURE.md)** - Cross-repo integration
- **Note**: CLAUDE.md does not exist yet for this repo - will be created in future issue

**Key concepts to understand**:
- **Type consistency**: TypeScript types in this package mirror Python Pydantic models in worker repo
- **Firestore integration**: Types must match Firestore document structure exactly
- **Shared enums**: Status enums, priority enums must be consistent across all repos

---

## Tasks

### Phase 1: Core Domain Types
1. **Review and enhance QueueItem types**
   - What: Ensure complete coverage of queue processing lifecycle
   - Where: `src/queue.types.ts` (already exists)
   - Why: Queue management is central to the job processing pipeline
   - Test: Build package and verify in FE/BE imports

2. **Review and enhance JobMatch types**
   - What: Add missing fields for AI analysis results, ensure resumeIntakeData is complete
   - Where: `src/job.types.ts` (already exists)
   - Why: JobMatch is the primary output of the worker AI analysis
   - Test: Compare with Firestore job-matches collection structure

3. **Define ContentItem types**
   - What: Types for user experience, skills, projects, education
   - Where: `src/content-item.types.ts` (already exists)
   - Why: Document builder needs structured content for resume generation
   - Test: Verify against FE content-items page usage

### Phase 2: Configuration & Settings Types
4. **Define AISettings and QueueSettings types**
   - What: Configuration types for AI provider, queue behavior, processing rules
   - Where: `src/firestore.types.ts` or create `src/config.types.ts`
   - Why: FE needs to configure AI and queue behavior, BE/worker need to read settings
   - Test: Check against job-finder-config Firestore collection

5. **Create enum definitions**
   - What: QueueStatus, QueueItemType, ApplicationPriority, DocumentType, etc.
   - Where: Distributed across relevant type files
   - Why: Ensures consistent status/type strings across all repos
   - Test: Export and verify string literal unions work correctly

### Phase 3: Type Guards & Utilities
6. **Create type guard functions**
   - What: Runtime type checking functions (isQueueItem, isJobMatch, etc.)
   - Where: Create `src/guards.ts`
   - Why: Enables safe runtime validation when reading from Firestore
   - Test: Write test cases for valid/invalid inputs

---

## Technical Details

### Files to Modify/Create

```
REVIEW & ENHANCE:
- src/queue.types.ts - QueueItem, QueueStatus, QueueSettings
- src/job.types.ts - JobMatch, JobListing, ResumeIntakeData
- src/content-item.types.ts - ContentItem, Experience, Project types
- src/firestore.types.ts - Firestore document types, timestamps

CREATE:
- src/config.types.ts - AISettings, QueueSettings, StopList
- src/guards.ts - Type guard functions (isQueueItem, etc.)
- src/enums.ts - Shared enum definitions (if needed)
- src/api.types.ts - API request/response types (prep for ISSUE #4)

REFERENCE:
- src/index.ts - Update exports for new types
- README.md - Document new types in usage section
```

### Key Implementation Notes

**Type Structure Pattern**:
```typescript
// Core document type with Firestore ID
export interface QueueItem {
  id?: string; // Firestore document ID (optional for creation)
  type: QueueItemType;
  status: QueueStatus;
  url: string;
  company_name: string;
  // ... other required fields
  created_at: Date;
  updated_at: Date;
}

// Enum as string literal union
export type QueueStatus =
  | "pending"
  | "processing"
  | "success"
  | "failed"
  | "skipped";

// Type guard for runtime validation
export function isQueueItem(obj: unknown): obj is QueueItem {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'type' in obj &&
    'status' in obj &&
    'url' in obj
  );
}
```

**Integration Points**:
- **job-finder-FE**: Direct TypeScript imports, type checking, autocomplete
- **job-finder-BE**: Type checking for Firebase Functions, API validation
- **job-finder-worker**: Python Pydantic models mirror these types

---

## Acceptance Criteria

- [ ] **QueueItem types complete**: All fields documented, matches Firestore queue collection
- [ ] **JobMatch types complete**: Includes all AI analysis fields, resumeIntakeData
- [ ] **ContentItem types complete**: Experience, skills, projects, education types defined
- [ ] **Configuration types complete**: AISettings, QueueSettings, StopList defined
- [ ] **Enums defined**: All status/type enums exported as string literal unions
- [ ] **Type guards implemented**: At least 3 core type guards (QueueItem, JobMatch, ContentItem)
- [ ] **Package builds**: `npm run build` succeeds with no errors
- [ ] **Type checking passes**: `npm test` (tsc --noEmit) succeeds
- [ ] **Exports updated**: All new types exported from `src/index.ts`
- [ ] **Documentation updated**: README.md includes examples of new types

---

## Testing

### Test Commands

```bash
# Type checking (main test)
npm test
# or
npm run lint

# Build verification
npm run build

# Check output structure
ls -la dist/
cat dist/index.d.ts | head -50

# Clean build test
npm run clean && npm run build
```

### Manual Testing

```bash
# Step 1: Build package
cd /home/jdubz/Development/job-finder-app-manager/job-finder-shared-types
npm run build

# Step 2: Test import in FE repo (link for local testing)
cd /home/jdubz/Development/job-finder-app-manager/job-finder-FE
npm link ../job-finder-shared-types
npm run dev

# Step 3: Verify types work in code
# Create test file in FE: src/test-types.ts
# Import types and verify autocomplete works

# Step 4: Check Firestore compatibility
# Compare types with actual Firestore documents in console
```

---

## Commit Message Template

```
feat(types): define comprehensive shared type definitions

Added complete type coverage for core domain entities:
- QueueItem with full queue lifecycle fields
- JobMatch with AI analysis and resumeIntakeData
- ContentItem types for experience/skills/projects
- Configuration types (AISettings, QueueSettings, StopList)
- Type guard functions for runtime validation
- Shared enum definitions as string literal unions

Key changes:
- Enhanced src/queue.types.ts with complete QueueItem definition
- Enhanced src/job.types.ts with JobMatch and ResumeIntakeData
- Enhanced src/content-item.types.ts with all content types
- Created src/config.types.ts for settings and configuration
- Created src/guards.ts with type guard functions
- Updated src/index.ts to export all new types
- Updated README.md with type examples and usage

Testing:
- npm test (tsc --noEmit) passes
- npm run build succeeds
- Verified exports in dist/index.d.ts
- Tested imports in job-finder-FE (npm link)

Closes #2
```

**Example**:
```
feat(types): add complete QueueItem and JobMatch types

Defined comprehensive types for queue processing and job matching:
- QueueItem with all lifecycle fields (status, timestamps, retry logic)
- JobMatch with AI analysis results and resumeIntakeData
- Type guards for runtime validation (isQueueItem, isJobMatch)
- Shared enums (QueueStatus, ApplicationPriority)

Key changes:
- Enhanced src/queue.types.ts
- Enhanced src/job.types.ts
- Created src/guards.ts
- Updated src/index.ts exports

Testing:
- npm test passes
- npm run build succeeds
- Verified in FE via npm link

Closes #2
```

---

## Related Issues

- **Blocks**: [Issue #3] - Package publishing depends on complete type definitions
- **Blocks**: [Issue #4] - API types build on these core types
- **Related**: job-finder-FE repo - Needs these types for type safety
- **Related**: job-finder-BE repo - Uses types for Firebase Functions
- **Related**: job-finder-worker repo - Mirrors types in Python/Pydantic

---

## Resources

### Documentation
- **Type Mapping Guide**: See README.md section "TypeScript → Python Mapping Table"
- **Firestore Schema**: Check Firestore console for actual document structure
- **Python Pydantic Examples**: See README.md for Python model examples

### External References
- [TypeScript Handbook - Type Guards](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates)
- [Pydantic Documentation](https://docs.pydantic.dev/) - For Python mirroring
- [Firebase Timestamp Types](https://firebase.google.com/docs/reference/js/firestore_.timestamp)

---

## Success Metrics

**How we'll measure success**:
- **Type coverage**: 100% of core entities have complete types
- **Import success**: FE/BE repos can import and use all types without errors
- **Build time**: `npm run build` completes in < 5 seconds
- **Type errors caught**: TypeScript catches at least 3 categories of errors (missing fields, wrong types, invalid enums)

---

## Notes

**Questions? Need clarification?**
- Comment on this issue with specific questions
- Tag @PM for guidance
- Reference Firestore console for actual document structure
- Check job-finder-FE src/types/ for existing local types that can be migrated

**Implementation Tips**:
- Start with queue.types.ts and job.types.ts - these are most critical
- Use `Timestamp` from Firebase for date fields if needed, or stick with Date for simplicity
- Keep optional fields marked with `?` to allow partial updates
- Document each field with JSDoc comments for better autocomplete
- Test each type file individually before moving to next

**Type Design Principles**:
- **Minimal but complete**: Include all fields needed, no extras
- **Firestore-compatible**: Match Firestore document structure exactly
- **Python-mirrorable**: Design types that can be mirrored in Pydantic
- **Strict unions**: Use string literal unions instead of free-form strings
- **Optional fields**: Use `?` for optional, `| null` for nullable

---

**Created**: 2025-10-20
**Created By**: PM
**Last Updated**: 2025-10-20
**Status**: Todo
