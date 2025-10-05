import chokidar from 'chokidar'
import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'
import { ConfigManager } from '../config/config'
import { UniversalAnalyzer } from '../core/universal-analyzer'
import { BuildServer } from '../utils/build-server'
import { MongoDBDataService } from './mongodb-data-service'

export interface WatchOptions {
    path: string
    port?: number
    debounceMs?: number
    ignorePatterns?: string[]
    autoAnalyze?: boolean
}

export class WatchService {
    private watcher: chokidar.FSWatcher | null = null
    private buildServer: BuildServer
    private configManager: ConfigManager
    private dataService: MongoDBDataService
    private options: WatchOptions
    private debounceTimer: NodeJS.Timeout | null = null
    private isAnalyzing = false

    constructor(options: WatchOptions) {
        this.options = {
            debounceMs: 1000,
            ignorePatterns: [
                'node_modules/**',
                'dist/**',
                '.git/**',
                '*.log',
                '*.tmp',
                'coverage/**',
                '.nyc_output/**',
                '**/*.js.map',
                '**/*.d.ts',
                '**/*.d.ts.map',
                'build/**',
                'out/**',
                '.next/**',
                '.nuxt/**',
                '.vuepress/dist/**',
                '.vitepress/cache/**',
                '.vitepress/dist/**',
            ],
            autoAnalyze: true,
            ...options,
        }

        this.buildServer = new BuildServer(options.port)
        this.configManager = ConfigManager.getInstance()
        this.dataService = new MongoDBDataService()
    }

    public async start(): Promise<void> {
        try {
            // Start the build server
            await this.buildServer.start()

            // Initialize status
            this.buildServer.updateStatus({
                status: 'Starting watch mode...',
                framework: 'Detecting...',
                filesProcessed: 0,
                isBuilding: false,
            })

            // Start file watching
            await this.startWatching()

            console.log(`👀 Watching directory: ${this.options.path}`)
            console.log(
                `🌐 Build indicator: http://localhost:${
                    this.options.port || 3001
                }`
            )
            console.log('Press Ctrl+C to stop watching')
        } catch (error) {
            console.error('❌ Failed to start watch service:', error)
            this.buildServer.setError(`Failed to start: ${error}`)
            throw error
        }
    }

    public async stop(): Promise<void> {
        if (this.watcher) {
            await this.watcher.close()
            this.watcher = null
        }

        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer)
            this.debounceTimer = null
        }

        await this.buildServer.stop()
        console.log('🛑 Watch service stopped')
    }

    private async startWatching(): Promise<void> {
        this.watcher = chokidar.watch(this.options.path, {
            ignored: this.options.ignorePatterns || [],
            persistent: true,
            ignoreInitial: true,
            followSymlinks: false,
            cwd: this.options.path,
        })

        this.watcher
            .on('add', (path) => this.handleFileChange('add', path))
            .on('change', (path) => this.handleFileChange('change', path))
            .on('unlink', (path) => this.handleFileChange('unlink', path))
            .on('error', (error) => {
                console.error('❌ Watch error:', error)
                this.buildServer.setError(`Watch error: ${error}`)
            })
            .on('ready', () => {
                console.log('✅ File watcher ready')
                this.buildServer.updateStatus({
                    status: 'Watching for changes...',
                    isBuilding: false,
                })

                // Run initial analysis if auto-analyze is enabled
                if (this.options.autoAnalyze) {
                    this.debouncedAnalyze()
                }
            })
    }

    private handleFileChange(event: string, filePath: string): void {
        // Only watch TypeScript files
        if (!filePath.endsWith('.ts') && !filePath.endsWith('.js')) {
            return
        }

        console.log(`📝 File ${event}: ${filePath}`)
        this.buildServer.incrementFilesProcessed()

        this.buildServer.updateStatus({
            status: `File ${event}: ${filePath}`,
            isBuilding: true,
        })

        // Debounce analysis to avoid multiple rapid triggers
        this.debouncedAnalyze()
    }

    private debouncedAnalyze(): void {
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer)
        }

        this.debounceTimer = setTimeout(() => {
            this.performAnalysis()
        }, this.options.debounceMs)
    }

    private async performAnalysis(): Promise<void> {
        if (this.isAnalyzing) {
            console.log('⏳ Analysis already in progress, skipping...')
            return
        }

        try {
            this.isAnalyzing = true
            this.buildServer.updateStatus({
                status: 'Analyzing project...',
                isBuilding: true,
            })

            console.log('🔍 Starting project analysis...')

            const analyzer = new UniversalAnalyzer(this.options.path)
            const result = await analyzer.analyze()

            // Update framework info
            this.buildServer.setFramework(result.framework)

            // Update metadata
            this.buildServer.updateMetadata({
                totalRoutes: result.metadata.totalRoutes,
                totalControllers: result.metadata.totalControllers,
                totalServices: result.metadata.totalServices,
                totalTypes: result.types.length,
                analysisTime: result.metadata.analysisTime,
            })

            // Update database statistics
            await this.updateDatabaseStats()

            // Save analysis if configured
            const config = this.configManager.getConfig()
            if (config.files.saveRawAnalysis) {
                const outputDir = config.files.outputDir
                if (!existsSync(outputDir)) {
                    mkdirSync(outputDir, { recursive: true })
                }

                const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
                const outputFile = config.files.timestampFiles
                    ? join(outputDir, `analysis-${timestamp}.json`)
                    : join(outputDir, config.files.analysisFilename)

                writeFileSync(outputFile, JSON.stringify(result, null, 2))
                console.log(`✅ Analysis saved to ${outputFile}`)
            }

            this.buildServer.updateStatus({
                status: 'Analysis complete - watching for changes...',
                isBuilding: false,
            })

            console.log('✅ Analysis completed successfully')
            console.log(`📊 Framework: ${result.framework}`)
            console.log(`📊 Routes: ${result.metadata.totalRoutes}`)
            console.log(`📊 Controllers: ${result.metadata.totalControllers}`)
            console.log(`📊 Services: ${result.metadata.totalServices}`)
        } catch (error) {
            console.error('❌ Analysis failed:', error)
            this.buildServer.setError(`Analysis failed: ${error}`)
        } finally {
            this.isAnalyzing = false
        }
    }

    private async updateDatabaseStats(): Promise<void> {
        try {
            const stats = await this.dataService.getAnalysisStats()
            const latestDocs = await this.dataService.getLatestDocuments(5)

            // Update build server with database data
            this.buildServer.updateMetadata({
                ...this.buildServer.getStatus().metadata,
                databaseStats: {
                    totalDocuments: stats.totalDocuments,
                    frameworks: stats.frameworks,
                    providers: stats.providers,
                    latestRun: stats.latestRun,
                    recentDocuments: latestDocs.map((doc) => {
                        const result: any = {
                            source: doc.source,
                            provider: doc.provider,
                            model: doc.model,
                            timestamp: doc.timestamp,
                        }
                        if (doc._id) result.id = doc._id
                        if (doc.runId) result.runId = doc.runId
                        return result
                    }),
                },
            })
        } catch (error) {
            console.warn('⚠️ Could not fetch database stats:', error)
        }
    }
}
