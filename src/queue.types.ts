/**
 * Shared Queue Types
 *
 * Used by both portfolio (TypeScript) and job-finder (Python via type hints)
 *
 * IMPORTANT: When modifying these types, also update:
 * - Python models in job-finder/src/job_finder/queue/models.py
 * - Firestore schema expectations in both projects
 */

/**
 * Queue item status lifecycle:
 * pending → processing → success/failed/skipped
 */
export type QueueStatus = "pending" | "processing" | "success" | "failed" | "skipped"

/**
 * Queue item types
 */
export type QueueItemType = "job" | "company"

/**
 * Source of queue submission
 */
export type QueueSource = "user_submission" | "automated_scan" | "scraper" | "webhook" | "email"

/**
 * Queue item in Firestore (job-queue collection)
 *
 * Python equivalent: job_finder.queue.models.JobQueueItem
 */
export interface QueueItem {
  id?: string
  type: QueueItemType
  status: QueueStatus
  url: string
  company_name: string
  company_id: string | null
  source: QueueSource
  submitted_by: string | null // User UID for user submissions
  retry_count: number
  max_retries: number
  result_message?: string
  error_details?: string
  created_at: Date | any // FirebaseFirestore.Timestamp
  updated_at: Date | any // FirebaseFirestore.Timestamp
  processed_at?: Date | any | null // FirebaseFirestore.Timestamp
  completed_at?: Date | any | null // FirebaseFirestore.Timestamp
}

/**
 * Stop list configuration (job-finder-config/stop-list)
 */
export interface StopList {
  excludedCompanies: string[]
  excludedKeywords: string[]
  excludedDomains: string[]
}

/**
 * Queue settings (job-finder-config/queue-settings)
 */
export interface QueueSettings {
  maxRetries: number
  retryDelaySeconds: number
  processingTimeout: number
}

/**
 * AI provider options
 */
export type AIProvider = "claude" | "openai" | "gemini"

/**
 * AI settings (job-finder-config/ai-settings)
 */
export interface AISettings {
  provider: AIProvider
  model: string
  minMatchScore: number
  costBudgetDaily: number
}

/**
 * Job match result (job-matches collection)
 *
 * Written by job-finder, read by portfolio
 */
export interface JobMatch {
  id?: string
  url: string
  company_name: string
  company_id?: string | null
  job_title: string
  match_score: number
  match_reasons: string[]
  job_description: string
  requirements: string[]
  location?: string | null
  salary_range?: string | null
  analyzed_at: Date | any // FirebaseFirestore.Timestamp
  created_at: Date | any // FirebaseFirestore.Timestamp
  submitted_by: string | null
  queue_item_id: string
}

/**
 * Stop list validation result
 */
export interface StopListCheckResult {
  allowed: boolean
  reason?: string
}

/**
 * Queue statistics
 */
export interface QueueStats {
  pending: number
  processing: number
  success: number
  failed: number
  skipped: number
  total: number
}

/**
 * Job submission request body (API)
 */
export interface SubmitJobRequest {
  url: string
  companyName?: string
  generationId?: string // Optional: Link to portfolio generation request ID
}

/**
 * Job submission response (API)
 */
export interface SubmitJobResponse {
  status: "success" | "skipped" | "error"
  message: string
  queueItemId?: string
  queueItem?: QueueItem // Optional: Full queue item data (for immediate display)
  jobId?: string
}

// Type guard helpers
export function isQueueStatus(status: string): status is QueueStatus {
  return ["pending", "processing", "success", "failed", "skipped"].includes(status)
}

export function isQueueItemType(type: string): type is QueueItemType {
  return ["job", "company"].includes(type)
}
