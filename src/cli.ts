#!/usr/bin/env node

import { Command } from 'commander'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { MongoDBAdapter } from './adapters/mongodb-adapter'
import { ConfigManager } from './config/config'
import { FrameworkDetector } from './core/framework-detector'
import { UniversalAnalyzer } from './core/universal-analyzer'
import { AIService } from './services/ai-service'

// Environment variables loaded by ConfigManager

const program = new Command()

// Initialize configuration
const configManager = ConfigManager.getInstance()

program
    .name('auto-doc-gen-universal')
    .description('Universal TypeScript framework documentation generator')
    .version('1.0.0')
    .option('-c, --config <file>', 'Configuration file path')
    .option('--verbose', 'Verbose output')
    .hook('preAction', (thisCommand) => {
        // Load config file if specified
        const configFile = thisCommand.getOptionValue('config')
        if (configFile) {
            configManager.loadConfigFile(configFile)
        } else {
            configManager.loadConfigFile()
        }

        // Update verbose setting
        if (thisCommand.getOptionValue('verbose')) {
            configManager.updateConfig({ verbose: true })
        }
    })

program
    .command('analyze')
    .description('Analyze TypeScript project and extract documentation')
    .argument('<path>', 'Project path to analyze')
    .option('-o, --output <file>', 'Output file path')
    .option('-f, --framework <framework>', 'Force specific framework')
    .option('--ai', 'Generate AI documentation after analysis')
    .option('--save-to-db', 'Save analysis to MongoDB')
    .option('--provider <provider>', 'AI provider (google, openai, anthropic)')
    .option('--model <model>', 'AI model to use')
    .option('--api-key <key>', 'AI API key')
    .action(async (path, options) => {
        try {
            const config = configManager.getConfig()

            console.log(`🔍 Analyzing project: ${path}`)

            const analyzer = new UniversalAnalyzer(path)
            const result = await analyzer.analyze()

            if (config.verbose) {
                console.log('📊 Analysis Results:')
                console.log(`   Framework: ${result.framework}`)
                console.log(`   Routes: ${result.metadata.totalRoutes}`)
                console.log(
                    `   Controllers: ${result.metadata.totalControllers}`
                )
                console.log(`   Services: ${result.metadata.totalServices}`)
                console.log(`   Types: ${result.types.length}`)
                console.log(
                    `   Analysis Time: ${result.metadata.analysisTime}s`
                )
            }

            // Determine output file
            const outputFile =
                options.output ||
                (config.files.timestampFiles
                    ? `${config.files.analysisFilename.replace(
                          '.json',
                          ''
                      )}-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
                    : config.files.analysisFilename)

            // Save raw analysis if enabled
            if (config.files.saveRawAnalysis) {
                writeFileSync(outputFile, JSON.stringify(result, null, 2))
                console.log(`✅ Analysis saved to ${outputFile}`)
            }

            // Save to MongoDB if requested or enabled in config
            if (options.saveToDb || config.database.enabled) {
                try {
                    const dbAdapter = new MongoDBAdapter(config.database)
                    await dbAdapter.connect()
                    await dbAdapter.saveAnalysis(result)
                    await dbAdapter.disconnect()
                    console.log('✅ Analysis saved to MongoDB')
                } catch (error) {
                    console.warn('⚠️ MongoDB save failed:', error)
                }
            }

            // Generate AI documentation if requested
            if (options.ai) {
                await generateAIDocumentation(result, options, config)
            }
        } catch (error) {
            console.error('❌ Analysis failed:', error)
            process.exit(1)
        }
    })

program
    .command('ai')
    .description('Generate AI documentation from analysis file')
    .argument('<input>', 'Analysis JSON file path')
    .option('-o, --output <file>', 'Output markdown file path')
    .option('--provider <provider>', 'AI provider (google, openai, anthropic)')
    .option('--model <model>', 'AI model to use')
    .option('--api-key <key>', 'AI API key')
    .option(
        '--template <template>',
        'Prompt template (default, security, performance, architecture)'
    )
    .option('--save-to-db', 'Save AI documentation to MongoDB')
    .action(async (input, options) => {
        try {
            if (!existsSync(input)) {
                console.error(`❌ Analysis file not found: ${input}`)
                process.exit(1)
            }

            const config = configManager.getConfig()
            const analysisData = JSON.parse(readFileSync(input, 'utf-8'))
            await generateAIDocumentation(analysisData, options, config)
        } catch (error) {
            console.error('❌ AI generation failed:', error)
            process.exit(1)
        }
    })

program
    .command('ai:chunks')
    .description(
        'Generate AI documentation in chunks for each module/controller'
    )
    .argument('<input>', 'Analysis JSON file path')
    .option('-o, --output-dir <dir>', 'Output directory for chunked docs')
    .option('--provider <provider>', 'AI provider (google, openai, anthropic)')
    .option('--model <model>', 'AI model to use')
    .option('--api-key <key>', 'AI API key')
    .option(
        '--template <template>',
        'Prompt template (default, security, performance, architecture)'
    )
    .option('--save-to-db', 'Save AI documentation to MongoDB')
    .action(async (input, options) => {
        try {
            if (!existsSync(input)) {
                console.error(`❌ Analysis file not found: ${input}`)
                process.exit(1)
            }

            const config = configManager.getConfig()
            const analysisData = JSON.parse(readFileSync(input, 'utf-8'))
            await generateChunkedAIDocumentation(analysisData, options, config)
        } catch (error) {
            console.error('❌ Chunked AI generation failed:', error)
            process.exit(1)
        }
    })

// Configuration commands removed - handled by consuming projects

program
    .command('detect')
    .description('Detect framework in project')
    .argument('<path>', 'Project path to analyze')
    .option('-v, --verbose', 'Verbose output')
    .action((path, options) => {
        try {
            console.log(`🔍 Detecting framework: ${path}`)

            const detector = new FrameworkDetector(path)
            const result = detector.detectFramework()

            console.log(`📋 Framework: ${result.framework}`)
            console.log(`🎯 Confidence: ${result.confidence}%`)

            if (options.verbose) {
                console.log('🔍 Indicators:')
                result.indicators.forEach((indicator) => {
                    console.log(`   - ${indicator}`)
                })
            }
        } catch (error) {
            console.error('❌ Detection failed:', error)
            process.exit(1)
        }
    })

async function generateAIDocumentation(
    analysisData: any,
    options: any,
    config: any
) {
    try {
        // Merge options with config and environment variables
        const aiConfig = {
            provider: options.provider || config.ai.provider,
            model: options.model || config.ai.model,
            apiKey:
                options.apiKey ||
                config.ai.apiKey ||
                getAPIKeyFromEnv(config.ai.provider),
            temperature: config.ai.temperature,
            maxTokens: config.ai.maxTokens,
        }

        if (!aiConfig.apiKey) {
            console.error(
                '❌ AI API key required. Set via --api-key, environment variable, or config file.'
            )
            process.exit(1)
        }

        console.log(
            `🤖 Generating AI documentation with ${aiConfig.provider}/${aiConfig.model}...`
        )

        const aiService = new AIService(aiConfig)
        const documentation = await aiService.analyzeProject(analysisData)

        // Create output directory if it doesn't exist
        if (!existsSync(config.files.outputDir)) {
            mkdirSync(config.files.outputDir, { recursive: true })
        }

        // Generate output filename
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
        const outputFile =
            options.output ||
            (config.files.timestampFiles
                ? join(config.files.outputDir, `ai-analysis-${timestamp}.md`)
                : join(config.files.outputDir, config.files.docsFilename))

        // Save AI documentation if enabled
        if (config.files.saveAIDocs) {
            writeFileSync(outputFile, documentation)
            console.log(`✅ AI documentation saved to ${outputFile}`)
        }

        // Save to MongoDB if requested or enabled in config
        if (options.saveToDb || config.database.enabled) {
            try {
                const dbAdapter = new MongoDBAdapter(config.database)
                await dbAdapter.connect()
                await dbAdapter.saveDocumentation({
                    content: documentation,
                    source: 'ai-generation',
                    provider: aiConfig.provider,
                    model: aiConfig.model,
                    timestamp: new Date().toISOString(),
                    metadata: {
                        framework: analysisData.framework,
                        totalRoutes: analysisData.metadata?.totalRoutes || 0,
                        totalControllers:
                            analysisData.metadata?.totalControllers || 0,
                    },
                })
                await dbAdapter.disconnect()
                console.log('✅ AI documentation saved to MongoDB')
            } catch (error) {
                console.warn('⚠️ MongoDB save failed:', error)
            }
        }
    } catch (error) {
        console.error('❌ AI documentation generation failed:', error)
        throw error
    }
}

async function generateChunkedAIDocumentation(
    analysisData: any,
    options: any,
    config: any
) {
    try {
        // Merge options with config and environment variables
        const aiConfig = {
            provider: options.provider || config.ai.provider,
            model: options.model || config.ai.model,
            apiKey:
                options.apiKey ||
                config.ai.apiKey ||
                getAPIKeyFromEnv(config.ai.provider),
            temperature: config.ai.temperature,
            maxTokens: config.ai.maxTokens,
        }

        if (!aiConfig.apiKey) {
            console.error(
                '❌ AI API key required. Set via --api-key, environment variable, or config file.'
            )
            process.exit(1)
        }

        console.log(
            `🤖 Generating chunked AI documentation with ${aiConfig.provider}/${aiConfig.model}...`
        )

        const aiService = new AIService(aiConfig)

        // Create output directory for chunks
        const outputDir =
            options.outputDir || join(config.files.outputDir, 'chunks')
        if (!existsSync(outputDir)) {
            mkdirSync(outputDir, { recursive: true })
        }

        // Group routes by controller/module
        const chunks = groupRoutesByController(
            analysisData.routes,
            analysisData.services,
            analysisData.types
        )

        console.log(
            `📦 Found ${Object.keys(chunks).length} modules to document`
        )

        // Generate documentation for each chunk
        for (const [moduleName, moduleData] of Object.entries(chunks)) {
            console.log(`📝 Generating documentation for ${moduleName}...`)

            // Get related services and types for this module
            const relatedServices = getRelatedServices(
                moduleName,
                analysisData.services
            )
            const relatedTypes = getRelatedTypes(moduleName, analysisData.types)

            const chunkData = {
                ...analysisData,
                routes: moduleData,
                services: relatedServices,
                types: relatedTypes,
                metadata: {
                    ...analysisData.metadata,
                    totalRoutes: moduleData.length,
                    totalServices: relatedServices.length,
                    totalTypes: relatedTypes.length,
                    moduleName: moduleName,
                },
            }

            // Save JSON analysis for this chunk
            const jsonFile = join(outputDir, `${moduleName}-analysis.json`)
            writeFileSync(jsonFile, JSON.stringify(chunkData, null, 2))
            console.log(`💾 ${moduleName} analysis saved to ${jsonFile}`)

            const documentation = await aiService.analyzeProject(chunkData)

            // Generate output filename for this chunk (no timestamp - overwrite)
            const outputFile = join(outputDir, `${moduleName}.md`)

            writeFileSync(outputFile, documentation)
            console.log(`✅ ${moduleName} documentation saved to ${outputFile}`)

            // Save to MongoDB if requested
            if (options.saveToDb || config.database.enabled) {
                try {
                    const dbAdapter = new MongoDBAdapter(config.database)
                    await dbAdapter.connect()
                    await dbAdapter.saveDocumentation({
                        content: documentation,
                        source: 'ai-generation-chunked',
                        provider: aiConfig.provider,
                        model: aiConfig.model,
                        timestamp: new Date().toISOString(),
                        metadata: {
                            framework: analysisData.framework,
                            moduleName: moduleName,
                            totalRoutes: moduleData.length,
                        },
                    })
                    await dbAdapter.disconnect()
                } catch (error) {
                    console.warn(
                        `⚠️ MongoDB save failed for ${moduleName}:`,
                        error
                    )
                }
            }
        }

        console.log(
            `🎉 Generated ${
                Object.keys(chunks).length
            } chunked documentation files in ${outputDir}`
        )
    } catch (error) {
        console.error('❌ Chunked AI documentation generation failed:', error)
        throw error
    }
}

function getRelatedServices(moduleName: string, services: any[]): any[] {
    return services.filter((service) => {
        const serviceName = service.name.toLowerCase()
        return (
            serviceName.includes(moduleName.toLowerCase()) ||
            (moduleName === 'app' && serviceName.includes('app'))
        )
    })
}

function getRelatedTypes(moduleName: string, types: any[]): any[] {
    return types.filter((type) => {
        const typeName = type.name.toLowerCase()
        return (
            typeName.includes(moduleName.toLowerCase()) ||
            (moduleName === 'app' && typeName.includes('app'))
        )
    })
}

function groupRoutesByController(
    routes: any[],
    services: any[] = [],
    types: any[] = []
): Record<string, any[]> {
    const chunks: Record<string, any[]> = {}

    // First, extract module names from services and types
    const detectedModules = new Set<string>()

    // Extract modules from service names
    services.forEach((service) => {
        if (service.name) {
            const moduleName = extractModuleFromName(service.name)
            if (moduleName) {
                detectedModules.add(moduleName)
            }
        }
    })

    // Extract modules from type names
    types.forEach((type) => {
        if (type.name) {
            const moduleName = extractModuleFromName(type.name)
            if (moduleName) {
                detectedModules.add(moduleName)
            }
        }
    })

    // Group routes by detected modules or fallback to generic grouping
    routes.forEach((route) => {
        let moduleName = 'unknown'

        // Strategy 1: Try to match against detected modules
        for (const detectedModule of detectedModules) {
            if (
                route.handler &&
                route.handler
                    .toLowerCase()
                    .includes(detectedModule.toLowerCase())
            ) {
                moduleName = detectedModule
                break
            }
            if (
                route.path &&
                route.path.toLowerCase().includes(detectedModule.toLowerCase())
            ) {
                moduleName = detectedModule
                break
            }
        }

        // Strategy 2: Try to extract from handler name using generic patterns
        if (moduleName === 'unknown' && route.handler) {
            const handlerLower = route.handler.toLowerCase()
            // Look for common CRUD patterns
            if (
                handlerLower.includes('create') ||
                handlerLower.includes('add')
            ) {
                moduleName = 'create'
            } else if (
                handlerLower.includes('find') ||
                handlerLower.includes('get') ||
                handlerLower.includes('list')
            ) {
                moduleName = 'read'
            } else if (
                handlerLower.includes('update') ||
                handlerLower.includes('edit') ||
                handlerLower.includes('modify')
            ) {
                moduleName = 'update'
            } else if (
                handlerLower.includes('delete') ||
                handlerLower.includes('remove')
            ) {
                moduleName = 'delete'
            } else if (
                handlerLower.includes('hello') ||
                handlerLower.includes('health') ||
                handlerLower.includes('status')
            ) {
                moduleName = 'app'
            }
        }

        // Strategy 3: Try to extract from path structure
        if (moduleName === 'unknown' && route.path) {
            const pathSegments = route.path.split('/').filter(Boolean)
            if (pathSegments.length > 0) {
                // Skip parameter segments like :id
                const validSegments = pathSegments.filter(
                    (segment: string) => !segment.startsWith(':')
                )
                if (validSegments.length > 0) {
                    moduleName = validSegments[0]
                }
            }
        }

        // Strategy 4: Group by HTTP method patterns
        if (moduleName === 'unknown') {
            if (
                route.method === 'GET' &&
                (route.path === '/' || route.path === '')
            ) {
                moduleName = 'app'
            } else if (route.method === 'POST') {
                moduleName = 'create'
            } else if (route.method === 'GET') {
                moduleName = 'read'
            } else if (route.method === 'PATCH' || route.method === 'PUT') {
                moduleName = 'update'
            } else if (route.method === 'DELETE') {
                moduleName = 'delete'
            } else {
                moduleName = 'misc'
            }
        }

        // Sanitize module name for file system
        moduleName = moduleName.replace(/[^a-zA-Z0-9-_]/g, '_')

        if (!chunks[moduleName]) {
            chunks[moduleName] = []
        }
        chunks[moduleName]!.push(route)
    })

    return chunks
}

function extractModuleFromName(name: string): string | null {
    if (!name) return null

    // Remove common suffixes like "Service", "Controller", "Dto", etc.
    const cleanName = name
        .replace(/(Service|Controller|Dto|Entity|Model|Type|Interface)$/i, '')
        .toLowerCase()

    // Convert to plural if it's a singular noun
    if (cleanName.endsWith('y')) {
        return cleanName.slice(0, -1) + 'ies'
    } else if (cleanName.endsWith('s')) {
        return cleanName
    } else {
        return cleanName + 's'
    }
}

function getAPIKeyFromEnv(provider: string): string {
    switch (provider) {
        case 'google':
            return (
                process.env['GOOGLE_AI_API_KEY'] ||
                process.env['GOOGLE_GENERATIVE_AI_API_KEY'] ||
                process.env['AUTODOCGEN_GOOGLE_API_KEY'] ||
                ''
            )
        case 'openai':
            return (
                process.env['OPENAI_API_KEY'] ||
                process.env['AUTODOCGEN_OPENAI_API_KEY'] ||
                ''
            )
        case 'anthropic':
            return (
                process.env['ANTHROPIC_API_KEY'] ||
                process.env['AUTODOCGEN_ANTHROPIC_API_KEY'] ||
                ''
            )
        default:
            return ''
    }
}

program.parse()
