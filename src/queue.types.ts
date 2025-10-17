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
 * pending → processing → success/failed/skipped/filtered
 *
 * - pending: In queue, waiting to be processed
 * - processing: Currently being processed
 * - filtered: Rejected by filter engine (did not pass intake filters)
 * - skipped: Skipped (duplicate or stop list blocked)
 * - success: Successfully processed and saved to job-matches
 * - failed: Processing error occurred
 */
export type QueueStatus = "pending" | "processing" | "success" | "failed" | "skipped" | "filtered"

/**
 * Queue item types
 */
export type QueueItemType = "job" | "company" | "scrape"

/**
 * Granular sub-tasks for job processing pipeline.
 *
 * When a JOB queue item has a sub_task, it represents one step in the
 * multi-stage processing pipeline. Items without sub_task (legacy) are
 * processed monolithically through all stages.
 *
 * Pipeline flow:
 * 1. scrape: Fetch HTML and extract basic job data (Claude Haiku)
 * 2. filter: Apply strike-based filtering (no AI)
 * 3. analyze: AI matching and resume intake generation (Claude Sonnet)
 * 4. save: Save results to job-matches (no AI)
 */
export type JobSubTask = "scrape" | "filter" | "analyze" | "save"

/**
 * Source of queue submission
 */
export type QueueSource = "user_submission" | "automated_scan" | "scraper" | "webhook" | "email"

/**
 * Configuration for scrape requests
 *
 * Used when QueueItemType is "scrape" to specify custom scraping parameters.
 *
 * Behavior:
 * - source_ids=null → scrape all available sources (with rotation)
 * - source_ids=[...] → scrape only specific sources
 * - target_matches=null → no early exit, scrape all allowed sources
 * - target_matches=N → stop after finding N potential matches
 * - max_sources=null → unlimited sources (until target_matches or all sources done)
 * - max_sources=N → stop after scraping N sources
 */
export interface ScrapeConfig {
  target_matches?: number | null // Stop after finding this many potential matches (null = no limit)
  max_sources?: number | null // Maximum number of sources to scrape (null = unlimited)
  source_ids?: string[] | null // Specific source IDs to scrape (null = all sources with rotation)
  min_match_score?: number | null // Override minimum match score threshold
}

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
  scrape_config?: ScrapeConfig | null // Configuration for scrape requests (only used when type is "scrape")
  scraped_data?: Record<string, any> | null // Pre-scraped job or company data

  // Granular pipeline fields (only used when type is "job" with sub_task)
  sub_task?: JobSubTask | null // Granular pipeline step (scrape/filter/analyze/save). null = legacy monolithic processing
  pipeline_state?: Record<string, any> | null // State passed between pipeline steps (scraped data, filter results, etc.)
  parent_item_id?: string | null // Document ID of parent item that spawned this sub-task
}

/**
 * Stop list configuration (job-finder-config/stop-list)
 */
export interface StopList {
  excludedCompanies: string[]
  excludedKeywords: string[]
  excludedDomains: string[]
  updatedAt?: Date | any // FirebaseFirestore.Timestamp
  updatedBy?: string // User email
}

/**
 * Queue settings (job-finder-config/queue-settings)
 */
export interface QueueSettings {
  maxRetries: number
  retryDelaySeconds: number
  processingTimeout: number
  updatedAt?: Date | any // FirebaseFirestore.Timestamp
  updatedBy?: string // User email
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
  updatedAt?: Date | any // FirebaseFirestore.Timestamp
  updatedBy?: string // User email
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
  filtered: number
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

/**
 * Scrape submission request body (API)
 */
export interface SubmitScrapeRequest {
  scrape_config?: ScrapeConfig
}

/**
 * Scrape submission response (API)
 */
export interface SubmitScrapeResponse {
  status: "success" | "error"
  message: string
  queueItemId?: string
  queueItem?: QueueItem
}

// Type guard helpers
export function isQueueStatus(status: string): status is QueueStatus {
  return ["pending", "processing", "success", "failed", "skipped", "filtered"].includes(status)
}

export function isQueueItemType(type: string): type is QueueItemType {
  return ["job", "company", "scrape"].includes(type)
}
