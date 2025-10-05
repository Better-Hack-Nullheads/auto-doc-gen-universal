import { MongoDBAdapter } from '../adapters/mongodb-adapter'
import { ConfigManager } from '../config/config'

export interface DocumentationData {
    _id?: string
    content: string
    source: string
    provider: string
    model: string
    timestamp: Date
    metadata: any
    runId?: string
}

export interface QueryOptions {
    limit?: number
    sort?: { [key: string]: 1 | -1 }
    filter?: any
}

export class MongoDBDataService {
    private dbAdapter: MongoDBAdapter
    private configManager: ConfigManager

    constructor() {
        this.configManager = ConfigManager.getInstance()
        const config = this.configManager.getConfig()
        this.dbAdapter = new MongoDBAdapter(config.database)
    }

    /**
     * Connect to MongoDB
     */
    async connect(): Promise<void> {
        await this.dbAdapter.connect()
    }

    /**
     * Disconnect from MongoDB
     */
    async disconnect(): Promise<void> {
        await this.dbAdapter.disconnect()
    }

    /**
     * Get latest documents from the database
     */
    async getLatestDocuments(limit: number = 10): Promise<DocumentationData[]> {
        try {
            await this.connect()

            const documents = await this.dbAdapter.getLatestDocumentation(limit)

            return documents.map((doc: any) => ({
                _id: doc._id?.toString(),
                content: doc.content,
                source: doc.source,
                provider: doc.provider,
                model: doc.model,
                timestamp: doc.timestamp,
                metadata: doc.metadata,
                runId: doc.runId,
            }))
        } catch (error) {
            console.error('Error fetching latest documents:', error)
            throw error
        } finally {
            await this.disconnect()
        }
    }

    /**
     * Get documents by run ID
     */
    async getDocumentsByRunId(runId: string): Promise<DocumentationData[]> {
        try {
            await this.connect()

            const documents = await this.dbAdapter.getDocumentsByRunId(runId)

            return documents.map((doc: any) => ({
                _id: doc._id?.toString(),
                content: doc.content,
                source: doc.source,
                provider: doc.provider,
                model: doc.model,
                timestamp: doc.timestamp,
                metadata: doc.metadata,
                runId: doc.runId,
            }))
        } catch (error) {
            console.error('Error fetching documents by run ID:', error)
            throw error
        } finally {
            await this.disconnect()
        }
    }

    /**
     * Get total document count
     */
    async getDocumentCount(): Promise<number> {
        try {
            await this.connect()

            return await this.dbAdapter.getDocumentCount()
        } catch (error) {
            console.error('Error getting document count:', error)
            throw error
        } finally {
            await this.disconnect()
        }
    }

    /**
     * Get unique chunk timestamps
     */
    async getUniqueChunkTimes(): Promise<string[]> {
        try {
            await this.connect()

            return await this.dbAdapter.getUniqueChunkTimes()
        } catch (error) {
            console.error('Error getting unique chunk times:', error)
            throw error
        } finally {
            await this.disconnect()
        }
    }

    /**
     * Get documents by chunk timestamp
     */
    async getDocumentsByChunkTime(
        chunkTime: string
    ): Promise<DocumentationData[]> {
        try {
            await this.connect()

            const documents = await this.dbAdapter.getDocumentsByChunkTime(
                chunkTime
            )

            return documents.map((doc: any) => ({
                _id: doc._id?.toString(),
                content: doc.content,
                source: doc.source,
                provider: doc.provider,
                model: doc.model,
                timestamp: doc.timestamp,
                metadata: doc.metadata,
                runId: doc.runId,
            }))
        } catch (error) {
            console.error('Error fetching documents by chunk time:', error)
            throw error
        } finally {
            await this.disconnect()
        }
    }

    /**
     * Update document content
     */
    async updateDocumentContent(
        id: string,
        content: string
    ): Promise<DocumentationData | null> {
        try {
            await this.connect()

            const result = await this.dbAdapter.updateDocumentContent(
                id,
                content
            )

            if (!result) {
                return null
            }

            return {
                _id: result._id?.toString(),
                content: result['content'],
                source: result['source'],
                provider: result['provider'],
                model: result['model'],
                timestamp: result['timestamp'],
                metadata: result['metadata'],
                runId: result['runId'],
            }
        } catch (error) {
            console.error('Error updating document content:', error)
            throw error
        } finally {
            await this.disconnect()
        }
    }

    /**
     * Get documents with custom query options
     */
    async getDocumentsWithOptions(
        options: QueryOptions
    ): Promise<DocumentationData[]> {
        try {
            await this.connect()

            const collection = this.dbAdapter.getCollection('documentation')
            let query = collection.find(options.filter || {})

            if (options.sort) {
                query = query.sort(options.sort)
            }

            if (options.limit) {
                query = query.limit(options.limit)
            }

            const documents = await query.toArray()

            return documents.map((doc: any) => ({
                _id: doc._id?.toString(),
                content: doc.content,
                source: doc.source,
                provider: doc.provider,
                model: doc.model,
                timestamp: doc.timestamp,
                metadata: doc.metadata,
                runId: doc.runId,
            }))
        } catch (error) {
            console.error('Error fetching documents with options:', error)
            throw error
        } finally {
            await this.disconnect()
        }
    }

    /**
     * Get documents by framework type
     */
    async getDocumentsByFramework(
        framework: string
    ): Promise<DocumentationData[]> {
        return this.getDocumentsWithOptions({
            filter: { 'metadata.framework': framework },
            sort: { timestamp: -1 },
        })
    }

    /**
     * Get documents by provider
     */
    async getDocumentsByProvider(
        provider: string
    ): Promise<DocumentationData[]> {
        return this.getDocumentsWithOptions({
            filter: { provider },
            sort: { timestamp: -1 },
        })
    }

    /**
     * Get analysis statistics
     */
    async getAnalysisStats(): Promise<{
        totalDocuments: number
        frameworks: { [key: string]: number }
        providers: { [key: string]: number }
        latestRun: string | null
    }> {
        try {
            await this.connect()

            return await this.dbAdapter.getAnalysisStats()
        } catch (error) {
            console.error('Error getting analysis stats:', error)
            throw error
        } finally {
            await this.disconnect()
        }
    }
}
