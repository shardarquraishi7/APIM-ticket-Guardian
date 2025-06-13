// src/services/section-service.ts

import { Section, SectionRelation } from "../types";
import { createLogger } from "@/lib/logger";

const logger = createLogger('section-service');

// Monitoring and instrumentation constants
let EVICTION_WINDOW_MS = 60000; // 1 minute
let HIGH_EVICTION_THRESHOLD = 100; // 100 evictions per minute is suspicious

// Module-level instrumentation
let cacheHits = 0;
let cacheMisses = 0;
let cacheEvictions = 0;
let invalidSectionIds = 0;
let debugMode = process.env.NODE_ENV !== "production";
const evictionTimestamps: number[] = [];
let healthCheckIntervalId: NodeJS.Timeout | null = null;

/** 
 * Defines which clusters influence or follow from one another.
 * Used for UI grouping and sanity checks.
 * 
 * Note: All relationships are bidirectional - if A is related to B, then B must be related to A.
 */
export const sectionRelations: SectionRelation[] = [
  { section: Section.ProjectInfo,    relatedTo: [Section.DataScope] },
  { section: Section.DataScope,      relatedTo: [Section.ProjectInfo, Section.Privacy, Section.HealthData, Section.DataRetention] },
  { section: Section.DataRetention,  relatedTo: [Section.DataScope, Section.Privacy, Section.QuebecLaw25, Section.GDPR] },
  { section: Section.Privacy,        relatedTo: [Section.HealthData, Section.DataScope, Section.DataRetention, Section.AI_ML, Section.QuebecLaw25, Section.GDPR, Section.HIPAA] },
  { section: Section.HealthData,     relatedTo: [Section.Privacy, Section.DataScope, Section.HIPAA] },
  { section: Section.Security,       relatedTo: [Section.VendorRisk, Section.CyberAssurance, Section.AI_ML, Section.PaymentCard] },
  { section: Section.AI_ML,          relatedTo: [Section.Security, Section.Privacy] },
  { section: Section.CyberAssurance, relatedTo: [Section.Security] },
  { section: Section.PaymentCard,    relatedTo: [Section.Security] },
  { section: Section.QuebecLaw25,    relatedTo: [Section.Privacy, Section.DataRetention] },
  { section: Section.GDPR,           relatedTo: [Section.Privacy, Section.DataRetention] },
  { section: Section.HIPAA,          relatedTo: [Section.HealthData, Section.Privacy] },
  { section: Section.VendorRisk,     relatedTo: [Section.Security] },
];

/**
 * Get all sections related to a specific section
 * @param section - The section to find related sections for
 * @returns Array of related sections
 */
export function getRelatedSections(section: Section): Section[] {
  const relation = sectionRelations.find(r => r.section === section);
  return relation ? relation.relatedTo : [];
}

/**
 * Get all sections that are related to the given section
 * @param section - The section to find related sections for
 * @returns Array of sections that have the given section in their relatedTo array
 */
export function getSectionsRelatedTo(section: Section): Section[] {
  return sectionRelations
    .filter(r => r.relatedTo.includes(section))
    .map(r => r.section);
}

/**
 * Check if two sections are related (directly or indirectly)
 * @param section1 - First section
 * @param section2 - Second section
 * @returns True if the sections are related, false otherwise
 */
export function areSectionsRelated(section1: Section, section2: Section): boolean {
  if (section1 === section2) return true;
  
  const directlyRelated = getRelatedSections(section1).includes(section2) ||
                          getRelatedSections(section2).includes(section1);
  
  if (directlyRelated) return true;
  
  // Check for indirect relationships (sections that are both related to a common section)
  const section1Related = getRelatedSections(section1);
  const section2Related = getRelatedSections(section2);
  
  return section1Related.some(s => section2Related.includes(s));
}

/**
 * Get all sections in the same cluster as the given section
 * @param section - The section to find the cluster for
 * @returns Array of sections in the same cluster
 */
export function getSectionCluster(section: Section): Section[] {
  const visited = new Set<Section>([section]);
  const queue: Section[] = [section];
  
  while (queue.length > 0) {
    const current = queue.shift()!;
    const related = getRelatedSections(current);
    
    for (const relatedSection of related) {
      if (!visited.has(relatedSection)) {
        visited.add(relatedSection);
        queue.push(relatedSection);
      }
    }
  }
  
  return Array.from(visited);
}

/**
 * Verify that all sections have a relation defined
 * @returns True if all sections have a relation, false otherwise
 */
export function verifyAllSectionsHaveRelation(): boolean {
  const definedSections = new Set(sectionRelations.map(r => r.section));
  const allSections = Object.values(Section);
  
  return allSections.every(s => definedSections.has(s));
}

/**
 * Get all sections that are related to the given section, including transitive relationships.
 * This function returns the "transitive closure" of related clusters, meaning it will find
 * all sections that are related to the given section, either directly or indirectly through
 * other related sections.
 * 
 * For example, if Section A is related to Section B, and Section B is related to Section C,
 * then Section C will be included in the result even though it's not directly related to Section A.
 * 
 * The function handles circular relationships by tracking visited sections to avoid infinite loops.
 * 
 * @param section - The section to find all related sections for
 * @returns Array of all sections that are related to the given section, including transitive relationships
 */
export function getAllRelatedSections(section: Section): Section[] {
  const visited = new Set<Section>([section]);
  const queue: Section[] = [section];
  
  while (queue.length > 0) {
    const current = queue.shift()!;
    const related = getRelatedSections(current);
    
    for (const relatedSection of related) {
      if (!visited.has(relatedSection)) {
        visited.add(relatedSection);
        queue.push(relatedSection);
      }
    }
  }
  
  // Remove the original section from the result
  visited.delete(section);
  
  return Array.from(visited);
}

// Cache for getSectionFromId function with a size limit to prevent unbounded growth
const MAX_CACHE_SIZE = 10000; // Limit cache to 10,000 entries
const sectionIdCache = new Map<string, Section | undefined>();
// Keep track of the order of keys for FIFO eviction
const cacheKeys: string[] = [];

/**
 * Toggle debug mode at runtime
 * @param enabled - Whether to enable debug mode
 */
export function setDebugMode(enabled: boolean): void {
  debugMode = enabled;
}

/**
 * Get metrics about the section ID cache
 * @returns Object containing cache metrics
 */
export function getSectionIdCacheMetrics(): { 
  hits: number; 
  misses: number; 
  evictions: number; 
  invalid: number;
  hitRatio: number;
  size: number;
} {
  const total = cacheHits + cacheMisses;
  return {
    hits: cacheHits,
    misses: cacheMisses,
    evictions: cacheEvictions,
    invalid: invalidSectionIds,
    hitRatio: total > 0 ? cacheHits / total : 0,
    size: sectionIdCache.size
  };
}

/**
 * Check the health of the section ID cache
 * @returns Object containing health information
 */
export function checkSectionIdCacheHealth(): {
  healthy: boolean;
  evictionRate: number;
  recentEvictions: number;
  message?: string;
  anomalies: string[];
} {
  const now = Date.now();
  
  // Clean up old timestamps
  while (evictionTimestamps.length > 0 && evictionTimestamps[0] < now - EVICTION_WINDOW_MS) {
    evictionTimestamps.shift();
  }
  
  const recentEvictions = evictionTimestamps.length;
  const evictionRate = recentEvictions / (EVICTION_WINDOW_MS / 1000);
  const highEvictionRate = recentEvictions >= HIGH_EVICTION_THRESHOLD;
  
  // Check for anomalies
  const anomalies = detectAnomalies();
  if (highEvictionRate) {
    anomalies.push(`High cache eviction rate (${evictionRate.toFixed(2)}/sec)`);
  }
  
  const healthy = anomalies.length === 0;
  
  return {
    healthy,
    evictionRate,
    recentEvictions,
    message: healthy ? undefined : anomalies.join('; '),
    anomalies
  };
}

/**
 * Detect anomalies in the cache metrics
 * @returns Array of anomaly descriptions
 */
function detectAnomalies(): string[] {
  const metrics = getSectionIdCacheMetrics();
  const anomalies: string[] = [];
  
  // Extremely low hit ratio might indicate a problem
  if (metrics.hits + metrics.misses > 1000 && metrics.hitRatio < 0.2) {
    anomalies.push(`Low cache hit ratio (${(metrics.hitRatio * 100).toFixed(1)}%)`);
  }
  
  // High invalid rate might indicate malformed data
  const totalRequests = metrics.hits + metrics.misses;
  const invalidRatio = totalRequests > 0 ? metrics.invalid / totalRequests : 0;
  if (totalRequests > 100 && invalidRatio > 0.1) {
    anomalies.push(`High invalid section ID rate (${(invalidRatio * 100).toFixed(1)}%)`);
  }
  
  return anomalies;
}

/**
 * Reset all cache metrics
 * Useful for testing or after addressing issues
 */
export function resetSectionIdCacheMetrics(): void {
  cacheHits = 0;
  cacheMisses = 0;
  cacheEvictions = 0;
  invalidSectionIds = 0;
  evictionTimestamps.length = 0;
}

/**
 * Configure cache monitoring thresholds
 * @param options - Configuration options
 */
export function configureCacheMonitoring(options: {
  evictionThreshold?: number;
  windowSizeMs?: number;
}): void {
  if (options.evictionThreshold !== undefined && options.evictionThreshold > 0) {
    HIGH_EVICTION_THRESHOLD = options.evictionThreshold;
  }
  if (options.windowSizeMs !== undefined && options.windowSizeMs > 0) {
    EVICTION_WINDOW_MS = options.windowSizeMs;
  }
}

/**
 * Start periodic health check
 * @param intervalMs - Interval in milliseconds
 */
export function startPeriodicHealthCheck(intervalMs = 300000): void {
  if (healthCheckIntervalId) {
    clearInterval(healthCheckIntervalId);
  }
  
  healthCheckIntervalId = setInterval(() => {
    const health = checkSectionIdCacheHealth();
    const metrics = getSectionIdCacheMetrics();
    
    if (!health.healthy) {
      logger.warn(`Cache health check failed: ${health.message}`, { 
        health, 
        metrics 
      });
    } else if (debugMode) {
      logger.info('Cache health check passed', { 
        health, 
        metrics 
      });
    }
  }, intervalMs);
}

/**
 * Stop periodic health check
 */
export function stopPeriodicHealthCheck(): void {
  if (healthCheckIntervalId) {
    clearInterval(healthCheckIntervalId);
    healthCheckIntervalId = null;
  }
}

/**
 * Get the Section enum value from a question ID
 * @param questionId - The question ID (e.g., "2.6")
 * @returns The corresponding Section enum value, or undefined if not found
 */
export function getSectionFromId(questionId: string): Section | undefined {
  // Check cache first
  if (sectionIdCache.has(questionId)) {
    if (debugMode) {
      cacheHits++;
      logger.debug(`Cache hit for ${questionId}`);
    }
    return sectionIdCache.get(questionId);
  }
  
  if (debugMode) {
    cacheMisses++;
    logger.debug(`Cache miss for ${questionId}`);
  }
  
  const sectionMatch = questionId.match(/^(\d+)\./);
  const sectionId = sectionMatch ? sectionMatch[1] : undefined;
  
  if (!sectionId) {
    if (debugMode) {
      invalidSectionIds++;
      logger.debug(`Invalid section ID format: ${questionId}`);
    }
    
    // Cache the result and return
    // If we've reached the maximum cache size, remove the oldest entry
    if (sectionIdCache.size >= MAX_CACHE_SIZE && cacheKeys.length > 0) {
      const oldestKey = cacheKeys.shift();
      if (oldestKey) {
        sectionIdCache.delete(oldestKey);
        if (debugMode) {
          cacheEvictions++;
          evictionTimestamps.push(Date.now());
          logger.debug(`Cache eviction for ${oldestKey}`);
          
          // Check eviction rate
          const recentEvictions = evictionTimestamps.filter(t => t > Date.now() - EVICTION_WINDOW_MS).length;
          if (recentEvictions > HIGH_EVICTION_THRESHOLD) {
            logger.warn(`High cache eviction rate detected: ${recentEvictions} evictions in the last minute. Possible malformed data or excessive unique IDs.`);
          }
        }
      }
    }
    
    // Add the new entry
    sectionIdCache.set(questionId, undefined);
    cacheKeys.push(questionId);
    return undefined;
  }
  
  // Find the matching Section enum value
  const result = Object.values(Section).find(s => s === sectionId);
  
  if (!result && debugMode) {
    invalidSectionIds++;
    logger.debug(`Unknown section ID: ${sectionId} from ${questionId}`);
  }
  
  // Cache the result and return
  // If we've reached the maximum cache size, remove the oldest entry
  if (sectionIdCache.size >= MAX_CACHE_SIZE && cacheKeys.length > 0) {
    const oldestKey = cacheKeys.shift();
    if (oldestKey) {
      sectionIdCache.delete(oldestKey);
      if (debugMode) {
        cacheEvictions++;
        evictionTimestamps.push(Date.now());
        logger.debug(`Cache eviction for ${oldestKey}`);
        
        // Check eviction rate
        const recentEvictions = evictionTimestamps.filter(t => t > Date.now() - EVICTION_WINDOW_MS).length;
        if (recentEvictions > HIGH_EVICTION_THRESHOLD) {
          logger.warn(`High cache eviction rate detected: ${recentEvictions} evictions in the last minute. Possible malformed data or excessive unique IDs.`);
        }
      }
    }
  }
  
  // Add the new entry
  sectionIdCache.set(questionId, result);
  cacheKeys.push(questionId);
  return result;
}
