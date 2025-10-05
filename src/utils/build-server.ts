import express, { Request, Response } from 'express'
import { existsSync, readFileSync } from 'fs'
import { join } from 'path'

export interface BuildStatus {
    status: string
    framework?: string
    lastUpdate: string
    filesProcessed: number
    isBuilding: boolean
    error?: string | undefined
    metadata?: {
        totalRoutes?: number
        totalControllers?: number
        totalServices?: number
        totalTypes?: number
        analysisTime?: number
        databaseStats?: {
            totalDocuments: number
            frameworks: { [key: string]: number }
            providers: { [key: string]: number }
            latestRun: string | null
            recentDocuments: Array<{
                id?: string
                source: string
                provider: string
                model: string
                timestamp: Date
                runId?: string
            }>
        }
    }
}

export class BuildServer {
    private app: express.Application
    private server: any
    private port: number
    private status: BuildStatus

    constructor(port: number = 3001) {
        this.port = port
        this.app = express()
        this.status = {
            status: 'Initializing...',
            lastUpdate: new Date().toISOString(),
            filesProcessed: 0,
            isBuilding: false,
        }
        this.setupRoutes()
    }

    private setupRoutes(): void {
        // Serve static files
        this.app.use(express.static(join(__dirname, '../templates')))

        // Main build indicator page
        this.app.get('/', (_req: Request, res: Response) => {
            const htmlPath = join(
                __dirname,
                '../templates/build-indicator.html'
            )
            if (existsSync(htmlPath)) {
                const html = readFileSync(htmlPath, 'utf-8')
                res.send(html)
            } else {
                res.send(this.getFallbackHTML())
            }
        })

        // Status API endpoint
        this.app.get('/api/status', (_req: Request, res: Response) => {
            res.json(this.status)
        })

        // Health check
        this.app.get('/health', (_req: Request, res: Response) => {
            res.json({
                status: 'ok',
                timestamp: new Date().toISOString(),
                buildStatus: this.status,
            })
        })
    }

    public start(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                this.server = this.app.listen(this.port, () => {
                    console.log(
                        `🌐 Build indicator server running at http://localhost:${this.port}`
                    )
                    console.log(
                        `📊 Status API available at http://localhost:${this.port}/api/status`
                    )
                    resolve()
                })
            } catch (error) {
                reject(error)
            }
        })
    }

    public stop(): Promise<void> {
        return new Promise((resolve) => {
            if (this.server) {
                this.server.close(() => {
                    console.log('🛑 Build indicator server stopped')
                    resolve()
                })
            } else {
                resolve()
            }
        })
    }

    public updateStatus(updates: Partial<BuildStatus>): void {
        this.status = {
            ...this.status,
            ...updates,
            lastUpdate: new Date().toISOString(),
        }
    }

    public setBuilding(isBuilding: boolean): void {
        this.status.isBuilding = isBuilding
        this.status.status = isBuilding
            ? 'Building...'
            : 'Watching for changes...'
    }

    public setFramework(framework: string): void {
        this.status.framework = framework
    }

    public incrementFilesProcessed(): void {
        this.status.filesProcessed++
    }

    public setError(error: string): void {
        this.status.error = error
        this.status.status = 'Error occurred'
        this.status.isBuilding = false
    }

    public clearError(): void {
        this.status.error = undefined
    }

    public updateMetadata(metadata: BuildStatus['metadata']): void {
        this.status.metadata = {
            ...this.status.metadata,
            ...metadata,
        }
    }

    public getStatus(): BuildStatus {
        return this.status
    }

    private getFallbackHTML(): string {
        return `
<!DOCTYPE html>
<html>
<head>
    <title>AutoDocGen Universal - Building</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            text-align: center; 
            padding: 50px; 
            background: #f0f0f0; 
        }
        .container { 
            background: white; 
            padding: 30px; 
            border-radius: 10px; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
        }
        .spinner { 
            border: 4px solid #f3f3f3; 
            border-top: 4px solid #3498db; 
            border-radius: 50%; 
            width: 40px; 
            height: 40px; 
            animation: spin 1s linear infinite; 
            margin: 20px auto; 
        }
        @keyframes spin { 
            0% { transform: rotate(0deg); } 
            100% { transform: rotate(360deg); } 
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>📚 AutoDocGen Universal</h1>
        <div class="spinner"></div>
        <h2>Building Documentation...</h2>
        <p>Watch mode is active and monitoring your project files.</p>
        <p><strong>Status:</strong> <span id="status">${
            this.status.status
        }</span></p>
        <p><strong>Last Update:</strong> <span id="lastUpdate">${new Date().toLocaleTimeString()}</span></p>
    </div>
    <script>
        setInterval(() => location.reload(), 5000);
    </script>
</body>
</html>`
    }
}
