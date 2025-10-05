// MongoDB Data Service Types and DTOs

export interface DocumentationData {
    _id?: string
    content: string
    source: string
    provider: string
    model: string
    timestamp: Date
    metadata: DocumentationMetadata
    runId?: string
}

export interface DocumentationMetadata {
    framework?: string
    moduleName?: string
    totalRoutes?: number
    totalControllers?: number
    totalServices?: number
    totalTypes?: number
    analysisTime?: number
    source?: string
    runId?: string
    runTimestamp?: string
    chunkTimestamp?: string
    projectPath?: string
    [key: string]: any
}

export interface QueryOptions {
    limit?: number
    sort?: { [key: string]: 1 | -1 }
    filter?: any
}

export interface AnalysisStats {
    totalDocuments: number
    frameworks: { [key: string]: number }
    providers: { [key: string]: number }
    latestRun: string | null
}

export interface UpdateContentDto {
    content: string
}

export interface DocumentSearchOptions {
    framework?: string
    provider?: string
    runId?: string
    chunkTime?: string
    dateRange?: {
        start: Date
        end: Date
    }
    limit?: number
    offset?: number
}

export interface DocumentSearchResult {
    documents: DocumentationData[]
    total: number
    hasMore: boolean
}

// MongoDB Collection Names
export const COLLECTIONS = {
    DOCUMENTATION: 'documentation',
    ENDPOINTS: 'endpoints',
    TYPES: 'types',
} as const

// Common query filters
export const QUERY_FILTERS = {
    BY_FRAMEWORK: (framework: string) => ({ 'metadata.framework': framework }),
    BY_PROVIDER: (provider: string) => ({ provider }),
    BY_RUN_ID: (runId: string) => ({ 'metadata.runId': runId }),
    BY_CHUNK_TIME: (chunkTime: string) => ({
        'metadata.chunkTimestamp': chunkTime,
    }),
    BY_DATE_RANGE: (start: Date, end: Date) => ({
        timestamp: {
            $gte: start,
            $lte: end,
        },
    }),
} as const

// Sort options
export const SORT_OPTIONS = {
    NEWEST_FIRST: { timestamp: -1 },
    OLDEST_FIRST: { timestamp: 1 },
    BY_FRAMEWORK: { 'metadata.framework': 1 },
    BY_PROVIDER: { provider: 1 },
} as const
