/**
 * Type Guard Functions
 *
 * Runtime type checking functions for validating data structures.
 * These are especially useful when reading from Firestore or validating API inputs.
 *
 * Usage:
 * ```typescript
 * if (isQueueItem(data)) {
 *   // TypeScript knows data is QueueItem here
 *   console.log(data.status)
 * }
 * ```
 */

import type {
  QueueItem,
  QueueSource,
  StopList,
  QueueSettings,
  AISettings,
  AIProvider,
} from "./queue.types"
// Import and re-export type guards from queue.types for convenience
import {
  isQueueStatus as queueStatusGuard,
  isQueueItemType as queueItemTypeGuard,
  isSourceTypeHint as sourceTypeHintGuard,
} from "./queue.types"
export {
  queueStatusGuard as isQueueStatus,
  queueItemTypeGuard as isQueueItemType,
  sourceTypeHintGuard as isSourceTypeHint,
}
import type {
  JobListing,
  JobMatch,
  Company,
  ResumeIntakeData,
  ExperienceHighlight,
  ProjectRecommendation,
  GapMitigation,
} from "./job.types"
import type {
  ContentItem,
  ContentItemType,
  ContentItemVisibility,
  CompanyItem,
  ProjectItem,
  SkillGroupItem,
  EducationItem,
  ProfileSectionItem,
  AccomplishmentItem,
} from "./content-item.types"

/**
 * Helper: Check if value is a non-null object
 */
function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

/**
 * Helper: Check if value is a string array
 */
function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string")
}

/**
 * Helper: Check if value is a Date or Firestore Timestamp
 */
function isDateLike(value: unknown): boolean {
  if (value instanceof Date) return true
  if (!isObject(value)) return false
  // Check for Firestore Timestamp structure
  return (
    typeof (value as any).seconds === "number" &&
    typeof (value as any).nanoseconds === "number" &&
    typeof (value as any).toDate === "function"
  )
}

// ============================================
// Queue Types Guards
// ============================================

// Note: isQueueStatus and isQueueItemType are exported from queue.types.ts
// and re-exported here for convenience

/**
 * Type guard for QueueSource
 */
export function isQueueSource(value: unknown): value is QueueSource {
  return (
    typeof value === "string" &&
    [
      "user_submission",
      "automated_scan",
      "scraper",
      "webhook",
      "email",
      "manual_submission",
      "user_request",
    ].includes(value)
  )
}

/**
 * Type guard for QueueItem
 */
export function isQueueItem(value: unknown): value is QueueItem {
  if (!isObject(value)) return false

  const item = value as Partial<QueueItem>

  // Check required fields
  return (
    queueItemTypeGuard(item.type as string) &&
    queueStatusGuard(item.status as string) &&
    typeof item.url === "string" &&
    typeof item.company_name === "string" &&
    (item.company_id === null || typeof item.company_id === "string") &&
    isQueueSource(item.source) &&
    (item.submitted_by === null || typeof item.submitted_by === "string") &&
    typeof item.retry_count === "number" &&
    typeof item.max_retries === "number" &&
    isDateLike(item.created_at) &&
    isDateLike(item.updated_at)
  )
}

/**
 * Type guard for StopList
 */
export function isStopList(value: unknown): value is StopList {
  if (!isObject(value)) return false

  const stopList = value as Partial<StopList>

  return (
    isStringArray(stopList.excludedCompanies) &&
    isStringArray(stopList.excludedKeywords) &&
    isStringArray(stopList.excludedDomains)
  )
}

/**
 * Type guard for QueueSettings
 */
export function isQueueSettings(value: unknown): value is QueueSettings {
  if (!isObject(value)) return false

  const settings = value as Partial<QueueSettings>

  return (
    typeof settings.maxRetries === "number" &&
    typeof settings.retryDelaySeconds === "number" &&
    typeof settings.processingTimeout === "number"
  )
}

/**
 * Type guard for AIProvider
 */
export function isAIProvider(value: unknown): value is AIProvider {
  return typeof value === "string" && ["claude", "openai", "gemini"].includes(value)
}

/**
 * Type guard for AISettings
 */
export function isAISettings(value: unknown): value is AISettings {
  if (!isObject(value)) return false

  const settings = value as Partial<AISettings>

  return (
    isAIProvider(settings.provider) &&
    typeof settings.model === "string" &&
    typeof settings.minMatchScore === "number" &&
    typeof settings.costBudgetDaily === "number"
  )
}

// ============================================
// Job Types Guards
// ============================================

/**
 * Type guard for ExperienceHighlight
 */
export function isExperienceHighlight(value: unknown): value is ExperienceHighlight {
  if (!isObject(value)) return false

  const exp = value as Partial<ExperienceHighlight>

  return (
    typeof exp.company === "string" &&
    typeof exp.title === "string" &&
    isStringArray(exp.pointsToEmphasize)
  )
}

/**
 * Type guard for ProjectRecommendation
 */
export function isProjectRecommendation(value: unknown): value is ProjectRecommendation {
  if (!isObject(value)) return false

  const proj = value as Partial<ProjectRecommendation>

  return (
    typeof proj.name === "string" &&
    typeof proj.whyRelevant === "string" &&
    isStringArray(proj.pointsToHighlight)
  )
}

/**
 * Type guard for GapMitigation
 */
export function isGapMitigation(value: unknown): value is GapMitigation {
  if (!isObject(value)) return false

  const gap = value as Partial<GapMitigation>

  return (
    typeof gap.missingSkill === "string" &&
    typeof gap.mitigationStrategy === "string" &&
    typeof gap.coverLetterPoint === "string"
  )
}

/**
 * Type guard for ResumeIntakeData
 */
export function isResumeIntakeData(value: unknown): value is ResumeIntakeData {
  if (!isObject(value)) return false

  const data = value as Partial<ResumeIntakeData>

  return (
    typeof data.jobId === "string" &&
    typeof data.jobTitle === "string" &&
    typeof data.company === "string" &&
    typeof data.targetSummary === "string" &&
    isStringArray(data.skillsPriority) &&
    Array.isArray(data.experienceHighlights) &&
    data.experienceHighlights.every(isExperienceHighlight) &&
    Array.isArray(data.projectsToInclude) &&
    data.projectsToInclude.every(isProjectRecommendation) &&
    isStringArray(data.achievementAngles) &&
    isStringArray(data.atsKeywords)
  )
}

/**
 * Type guard for JobListing
 */
export function isJobListing(value: unknown): value is JobListing {
  if (!isObject(value)) return false

  const job = value as Partial<JobListing>

  // Check required fields
  return (
    typeof job.title === "string" &&
    typeof job.company === "string" &&
    typeof job.companyWebsite === "string" &&
    typeof job.location === "string" &&
    typeof job.description === "string" &&
    typeof job.url === "string"
  )
}

/**
 * Type guard for JobMatch
 */
export function isJobMatch(value: unknown): value is JobMatch {
  if (!isObject(value)) return false

  const match = value as Partial<JobMatch>

  // Check required fields
  return (
    typeof match.url === "string" &&
    typeof match.companyName === "string" &&
    typeof match.jobTitle === "string" &&
    typeof match.jobDescription === "string" &&
    typeof match.matchScore === "number" &&
    isStringArray(match.matchedSkills) &&
    isStringArray(match.missingSkills) &&
    isStringArray(match.matchReasons) &&
    isStringArray(match.keyStrengths) &&
    isStringArray(match.potentialConcerns) &&
    typeof match.experienceMatch === "number" &&
    (match.applicationPriority === "High" ||
      match.applicationPriority === "Medium" ||
      match.applicationPriority === "Low") &&
    isStringArray(match.customizationRecommendations) &&
    isDateLike(match.analyzedAt) &&
    isDateLike(match.createdAt) &&
    (match.submittedBy === null || typeof match.submittedBy === "string") &&
    typeof match.queueItemId === "string"
  )
}

/**
 * Type guard for Company
 */
export function isCompany(value: unknown): value is Company {
  if (!isObject(value)) return false

  const company = value as Partial<Company>

  // Check required fields
  return typeof company.name === "string" && typeof company.website === "string"
}

// ============================================
// Content Item Types Guards
// ============================================

/**
 * Type guard for ContentItemType
 */
export function isContentItemType(value: unknown): value is ContentItemType {
  return (
    typeof value === "string" &&
    [
      "company",
      "project",
      "skill-group",
      "education",
      "profile-section",
      "accomplishment",
    ].includes(value)
  )
}

/**
 * Type guard for ContentItemVisibility
 */
export function isContentItemVisibility(value: unknown): value is ContentItemVisibility {
  return typeof value === "string" && ["published", "draft", "archived"].includes(value)
}

/**
 * Type guard for base ContentItem fields (used by specific type guards)
 */
function hasBaseContentItemFields(value: Record<string, unknown>): boolean {
  return (
    typeof value.id === "string" &&
    isContentItemType(value.type) &&
    typeof value.userId === "string" &&
    (value.parentId === null || typeof value.parentId === "string") &&
    typeof value.order === "number" &&
    isDateLike(value.createdAt) &&
    isDateLike(value.updatedAt) &&
    typeof value.createdBy === "string" &&
    typeof value.updatedBy === "string"
  )
}

/**
 * Type guard for CompanyItem
 */
export function isCompanyItem(value: unknown): value is CompanyItem {
  if (!isObject(value)) return false
  if (!hasBaseContentItemFields(value)) return false

  const item = value as Partial<CompanyItem>

  return (
    item.type === "company" &&
    typeof item.company === "string" &&
    typeof item.startDate === "string"
  )
}

/**
 * Type guard for ProjectItem
 */
export function isProjectItem(value: unknown): value is ProjectItem {
  if (!isObject(value)) return false
  if (!hasBaseContentItemFields(value)) return false

  const item = value as Partial<ProjectItem>

  return item.type === "project" && typeof item.name === "string" && typeof item.description === "string"
}

/**
 * Type guard for SkillGroupItem
 */
export function isSkillGroupItem(value: unknown): value is SkillGroupItem {
  if (!isObject(value)) return false
  if (!hasBaseContentItemFields(value)) return false

  const item = value as Partial<SkillGroupItem>

  return (
    item.type === "skill-group" &&
    typeof item.category === "string" &&
    isStringArray(item.skills)
  )
}

/**
 * Type guard for EducationItem
 */
export function isEducationItem(value: unknown): value is EducationItem {
  if (!isObject(value)) return false
  if (!hasBaseContentItemFields(value)) return false

  const item = value as Partial<EducationItem>

  return item.type === "education" && typeof item.institution === "string"
}

/**
 * Type guard for ProfileSectionItem
 */
export function isProfileSectionItem(value: unknown): value is ProfileSectionItem {
  if (!isObject(value)) return false
  if (!hasBaseContentItemFields(value)) return false

  const item = value as Partial<ProfileSectionItem>

  return (
    item.type === "profile-section" &&
    typeof item.heading === "string" &&
    typeof item.content === "string"
  )
}

/**
 * Type guard for AccomplishmentItem
 */
export function isAccomplishmentItem(value: unknown): value is AccomplishmentItem {
  if (!isObject(value)) return false
  if (!hasBaseContentItemFields(value)) return false

  const item = value as Partial<AccomplishmentItem>

  return item.type === "accomplishment" && typeof item.description === "string"
}

/**
 * Type guard for ContentItem (union type)
 * Checks if value is any valid ContentItem type
 */
export function isContentItem(value: unknown): value is ContentItem {
  return (
    isCompanyItem(value) ||
    isProjectItem(value) ||
    isSkillGroupItem(value) ||
    isEducationItem(value) ||
    isProfileSectionItem(value) ||
    isAccomplishmentItem(value)
  )
}
