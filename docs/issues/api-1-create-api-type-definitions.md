# API-1 — Create API Type Definitions

> **Context**: This package provides shared types for all repos. API types ensure type safety for requests/responses between FE and BE (Firebase Functions). See `README.md` for existing type structure.
> **Architecture**: See `/home/jdubz/Development/job-finder-app-manager/docs/architecture/BACKEND_MIGRATION_PLAN.md` for API endpoint specifications.

---

## Issue Metadata

```yaml
Title: API-1 — Create API Type Definitions
Labels: [priority-p1, repository-shared-types, type-feature, status-done]
Assignee: PM
Priority: P1-High
Estimated Effort: 2-3 days
Repository: job-finder-shared-types
```

---

## Summary

**Problem**: Frontend and backend currently communicate via API endpoints (Firebase Functions callables and HTTP endpoints) without shared type definitions. This leads to type mismatches, manual type guards, and increased risk of runtime errors when API contracts change.

**Goal**: Define comprehensive TypeScript types for all API request/response payloads, error responses, and Firebase Functions callable types to ensure type safety across FE-BE communication.

**Impact**: Eliminates entire class of bugs related to API contract mismatches. Enables both FE and BE to catch type errors at compile time instead of runtime. Improves developer experience with autocomplete for API payloads.

---

## Resolution

- Established base API response types, error codes, pagination helpers, and callable validators in `src/api.types.ts`, with generator/content/queue API payloads in dedicated modules under `src/api/`.
- Added API response helpers (`isApiSuccess`, `isApiError`, `isApiResponse`) to `src/guards.ts` and re-exported all API modules from `src/index.ts` for single-entry consumption.
- Verified consuming repos compile with the new types: shared package `npm test` + `npm run build`, frontend `npm run type-check`, backend `npm run build` on 2025-10-20.

---

## Architecture References

> **Read these docs first for context:**

- **[README.md](../../README.md)** - Package overview and existing type structure
- **[BACKEND_MIGRATION_PLAN.md](/home/jdubz/Development/job-finder-app-manager/docs/architecture/BACKEND_MIGRATION_PLAN.md)** - BE API endpoint specifications
- **[job-finder-FE src/config/api.ts](/home/jdubz/Development/job-finder-app-manager/job-finder-FE/src/config/api.ts)** - Current FE API integration

**Key concepts to understand**:
- **Firebase Callable Functions**: Type-safe RPC-style functions with automatic serialization
- **HTTP Endpoints**: REST-style endpoints with manual request/response handling
- **Error Standardization**: Consistent error response format across all endpoints
- **Validation Schemas**: Types that can be used for runtime validation

---

## Tasks

### Phase 1: Core API Types
1. **Define base request/response types**
   - What: Generic base types for all API operations (success/error wrappers)
   - Where: Create `src/api.types.ts`
   - Why: Consistent API response structure across all endpoints
   - Test: Import in FE and verify autocomplete works

2. **Define document generation API types**
   - What: Request/response types for resume/cover letter generation
   - Where: `src/api.types.ts` or `src/api/generator.types.ts`
   - Why: manageGenerator function is primary FE-BE integration point
   - Test: Compare with existing FE fetch calls to Firebase Functions

3. **Define content management API types**
   - What: Request/response types for content items CRUD operations
   - Where: `src/api.types.ts` or `src/api/content.types.ts`
   - Why: manageContentItems function handles experience/skills/projects
   - Test: Verify against FE content-items page API calls

### Phase 2: Error & Validation Types
4. **Define error response types**
   - What: Standardized error format with codes, messages, details
   - Where: `src/api.types.ts` (ErrorResponse, ApiError types)
   - Why: Consistent error handling across FE and BE
   - Test: Create example error objects and validate structure

5. **Define Firebase callable types**
   - What: Wrapper types for Firebase Functions callable responses
   - Where: `src/api.types.ts` (CallableResponse, CallableRequest)
   - Why: Firebase callables have specific structure (data, context)
   - Test: Import in BE Functions and verify compatibility

6. **Create validation schema types**
   - What: Runtime validation helpers that align with type definitions
   - Where: `src/api/validation.types.ts` or add to existing guards.ts
   - Why: Enables runtime validation of API payloads in BE
   - Test: Write validation test cases

### Phase 3: Additional API Types
7. **Define queue management API types**
   - What: Types for queue operations (submit job, update status, retry)
   - Where: `src/api/queue.types.ts`
   - Why: FE queue-management page needs type-safe API calls
   - Test: Check against worker queue intake API

---

## Technical Details

### Files to Modify/Create

```
CREATE:
- src/api.types.ts - Base API types, error responses, common patterns
- src/api/generator.types.ts - Document generation request/response
- src/api/content.types.ts - Content management request/response
- src/api/queue.types.ts - Queue operation request/response
- src/api/validation.types.ts - Validation helper types (optional)

MODIFY:
- src/index.ts - Export all new API types
- src/guards.ts - Add API response type guards (isApiError, etc.)

REFERENCE:
- job-finder-FE/src/config/api.ts - Current API endpoints
- job-finder-BE/functions/src/ - Backend function signatures
- src/generator.types.ts - Existing generator types to reference
```

### Key Implementation Notes

**Base API Response Pattern**:
```typescript
// Generic success response wrapper
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

// Generic error response
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

// Combined response type
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
```

**Document Generation API Types**:
```typescript
// Resume generation request
export interface GenerateResumeRequest {
  jobMatchId: string;
  templateId?: string;
  customizations?: {
    targetSummary?: string;
    skillsToHighlight?: string[];
    experienceToEmphasize?: string[];
  };
}

// Resume generation response
export interface GenerateResumeResponse {
  documentId: string;
  documentUrl: string;
  generatedAt: Date;
  metadata: {
    wordCount: number;
    sections: string[];
  };
}

// Type-safe API call
export type GenerateResumeApi = (
  request: GenerateResumeRequest
) => Promise<ApiResponse<GenerateResumeResponse>>;
```

**Firebase Callable Type Pattern**:
```typescript
// Firebase callable context
export interface CallableContext {
  auth?: {
    uid: string;
    token: Record<string, unknown>;
  };
  rawRequest?: unknown;
}

// Generic callable request
export interface CallableRequest<T> {
  data: T;
  context: CallableContext;
}

// Generic callable response
export type CallableResponse<T> = ApiResponse<T>;
```

**Error Code Enum**:
```typescript
export enum ApiErrorCode {
  // Auth errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',

  // Validation errors
  INVALID_REQUEST = 'INVALID_REQUEST',
  MISSING_FIELD = 'MISSING_FIELD',

  // Resource errors
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',

  // Processing errors
  GENERATION_FAILED = 'GENERATION_FAILED',
  AI_SERVICE_ERROR = 'AI_SERVICE_ERROR',

  // System errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
}
```

**Integration Points**:
- **job-finder-FE**: Import API types for fetch calls and response handling
- **job-finder-BE**: Import API types for function signatures and validation
- **Type Guards**: Use guards to validate responses at runtime

---

## Acceptance Criteria

- [x] **Base API types defined**: ApiResponse, ApiSuccessResponse, ApiErrorResponse
- [x] **Generator API types complete**: Resume and cover letter generation types
- [x] **Content API types complete**: CRUD operation types for content items
- [x] **Queue API types complete**: Job submission and status update types
- [x] **Error types comprehensive**: Error codes enum, detailed error structure
- [x] **Firebase callable types**: CallableRequest, CallableResponse, CallableContext
- [x] **Type guards implemented**: isApiError, isApiSuccess functions
- [x] **Package builds**: `npm run build` succeeds with no errors
- [x] **Exports updated**: All API types exported from src/index.ts
- [x] **FE integration verified**: Types importable and usable in job-finder-FE
- [x] **BE integration verified**: Types importable and usable in job-finder-BE

---

## Testing

### Test Commands

```bash
# Type checking
npm test
# or
npm run lint

# Build verification
npm run build

# Check API type exports
grep -r "export.*Api" dist/index.d.ts

# Validate type structure
cat dist/api.types.d.ts | head -100
```

### Manual Testing

```bash
# Step 1: Build package
cd /home/jdubz/Development/job-finder-app-manager/job-finder-shared-types
npm run build

# Step 2: Link to FE repo
cd /home/jdubz/Development/job-finder-app-manager/job-finder-FE
npm link ../job-finder-shared-types

# Step 3: Update FE API integration
# Modify src/config/api.ts to use shared types
# Example:
# import type { GenerateResumeRequest, ApiResponse } from '@jdubzw/job-finder-shared-types'

# Step 4: Verify autocomplete
# Open FE code in editor, verify autocomplete shows API type fields

# Step 5: Test with BE
cd /home/jdubz/Development/job-finder-app-manager/job-finder-BE
npm link ../job-finder-shared-types
# Update function signatures to use shared types
```

---

## Commit Message Template

```
feat(api): create comprehensive API type definitions

Added complete TypeScript types for FE-BE API integration:
- Base API response types (success/error wrappers)
- Document generation API types (resume/cover letter)
- Content management API types (CRUD operations)
- Queue operation API types (submit/update/retry)
- Standardized error response types with error codes
- Firebase callable function types
- API response type guards

Key changes:
- Created src/api.types.ts with base API patterns
- Created src/api/generator.types.ts for document generation
- Created src/api/content.types.ts for content operations
- Created src/api/queue.types.ts for queue operations
- Enhanced src/guards.ts with API response type guards
- Updated src/index.ts to export all API types

Testing:
- npm test passes (type checking)
- npm run build succeeds
- Verified imports in job-finder-FE
- Verified imports in job-finder-BE
- Type guards tested with valid/invalid inputs

Closes #4
```

**Example**:
```
feat(api): add document generation API types

Created type-safe API definitions for resume/cover letter generation:
- GenerateResumeRequest with job match and customization options
- GenerateResumeResponse with document URL and metadata
- GenerateCoverLetterRequest/Response with similar pattern
- ApiResponse wrapper for consistent success/error handling

Key changes:
- Created src/api.types.ts
- Created src/api/generator.types.ts
- Added error code enum
- Updated src/index.ts exports

Testing:
- npm test passes
- Verified in FE manageGenerator calls

Closes #4
```

---

## Related Issues

- **Depends on**: [Issue #2] - Core types must be defined first
- **Depends on**: [Issue #3] - Publishing setup needed for distribution
- **Related**: job-finder-FE - Primary API consumer
- **Related**: job-finder-BE - API provider, needs types for validation
- **Blocks**: Future API documentation generation

---

## Resources

### Documentation
- **Firebase Callable Functions**: [firebase.google.com/docs/functions/callable](https://firebase.google.com/docs/functions/callable)
- **TypeScript Type Guards**: [www.typescriptlang.org/docs/handbook/2/narrowing.html](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
- **API Design Best Practices**: [www.oreilly.com/library/view/api-design-patterns/](https://www.oreilly.com/library/view/api-design-patterns/)

### External References
- [REST API Error Handling](https://blog.postman.com/rest-api-error-handling-best-practices/)
- [TypeScript Discriminated Unions](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions)
- [Firebase Functions TypeScript Guide](https://firebase.google.com/docs/functions/typescript)

---

## Success Metrics

**How we'll measure success**:
- **Type safety**: 0 manual type assertions in FE API calls
- **Error reduction**: 80% reduction in API-related runtime errors
- **Developer experience**: Autocomplete works for all API request/response types
- **Build time**: No increase in build time for consuming repos

---

## Notes

**Questions? Need clarification?**
- Comment on this issue with specific questions
- Tag @PM for guidance
- Check job-finder-FE src/config/api.ts for current API integration
- Review job-finder-BE functions for actual endpoint signatures

**Implementation Tips**:
- Start with base ApiResponse pattern - all other types build on this
- Use discriminated unions (success: true/false) for easy type narrowing
- Keep request types simple - only required fields, make everything else optional
- Document each field with JSDoc for better autocomplete
- Create separate files per API domain (generator, content, queue) for organization
- Consider validation libraries like Zod if runtime validation becomes complex

**API Design Principles**:
- **Consistency**: Same response structure across all endpoints
- **Clarity**: Clear field names, no abbreviations
- **Versioning**: Consider v1/ prefix if breaking changes expected
- **Error Detail**: Enough info for debugging without exposing internals
- **Type Safety**: Leverage TypeScript discriminated unions for exhaustive checking

**Testing Strategy**:
- Unit test type guards with valid/invalid payloads
- Integration test by linking to FE/BE and verifying imports
- Runtime test with actual API calls to catch serialization issues
- Document example request/response payloads for each API type

---

**Created**: 2025-10-20
**Created By**: PM
**Last Updated**: 2025-10-20
**Status**: Done
