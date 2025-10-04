#!/usr/bin/env node

import { Command } from 'commander'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { MongoDBAdapter } from './adapters/mongodb-adapter'
import { FrameworkDetector } from './core/framework-detector'
import { UniversalAnalyzer } from './core/universal-analyzer'
import { AIService } from './services/ai-service'
import { AIConfig } from './types/ai.types'

const program = new Command()

program
    .name('auto-doc-gen-universal')
    .description('Universal TypeScript framework documentation generator')
    .version('1.0.0')

program
    .command('analyze')
    .description('Analyze TypeScript project and extract documentation')
    .argument('<path>', 'Project path to analyze')
    .option('-o, --output <file>', 'Output file path', 'analysis.json')
    .option('-f, --framework <framework>', 'Force specific framework')
    .option('--ai', 'Generate AI documentation after analysis')
    .option('--save-to-db', 'Save analysis to MongoDB')
    .option('--provider <provider>', 'AI provider (google, openai, anthropic)')
    .option('--model <model>', 'AI model to use')
    .option('--api-key <key>', 'AI API key')
    .option('-v, --verbose', 'Verbose output')
    .action(async (path, options) => {
        try {
            console.log(`🔍 Analyzing project: ${path}`)

            const analyzer = new UniversalAnalyzer(path)
            const result = await analyzer.analyze()

            if (options.verbose) {
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

            // Save raw analysis
            writeFileSync(options.output, JSON.stringify(result, null, 2))
            console.log(`✅ Analysis saved to ${options.output}`)

            // Save to MongoDB if requested
            if (options.saveToDb) {
                try {
                    const dbAdapter = new MongoDBAdapter({
                        type: 'mongodb',
                        url: 'mongodb://localhost:27017/api_docs',
                        database: 'api_docs',
                        collections: {
                            documentation: 'documentation',
                            endpoints: 'endpoints',
                            types: 'types',
                        },
                        mapping: {
                            createCollections: true,
                            includeTypeSchemas: true,
                        },
                    })

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
                await generateAIDocumentation(result, options)
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
    .option(
        '--provider <provider>',
        'AI provider (google, openai, anthropic)',
        'google'
    )
    .option('--model <model>', 'AI model to use')
    .option('--api-key <key>', 'AI API key')
    .option(
        '--template <template>',
        'Prompt template (default, security, performance, architecture)',
        'default'
    )
    .option('--save-to-db', 'Save AI documentation to MongoDB')
    .option('-v, --verbose', 'Verbose output')
    .action(async (input, options) => {
        try {
            if (!existsSync(input)) {
                console.error(`❌ Analysis file not found: ${input}`)
                process.exit(1)
            }

            const analysisData = JSON.parse(readFileSync(input, 'utf-8'))
            await generateAIDocumentation(analysisData, options)
        } catch (error) {
            console.error('❌ AI generation failed:', error)
            process.exit(1)
        }
    })

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

async function generateAIDocumentation(analysisData: any, options: any) {
    try {
        // Get API key from options or environment
        const apiKey =
            options.apiKey ||
            process.env['GOOGLE_AI_API_KEY'] ||
            process.env['OPENAI_API_KEY'] ||
            process.env['ANTHROPIC_API_KEY']

        if (!apiKey) {
            console.error(
                '❌ AI API key required. Set via --api-key or environment variable.'
            )
            process.exit(1)
        }

        // Create AI config
        const aiConfig: AIConfig = {
            provider: options.provider || 'google',
            model:
                options.model || getDefaultModel(options.provider || 'google'),
            apiKey: apiKey,
            temperature: 0.7,
            maxTokens: 4000,
        }

        console.log(
            `🤖 Generating AI documentation with ${aiConfig.provider}/${aiConfig.model}...`
        )

        const aiService = new AIService(aiConfig)
        const documentation = await aiService.analyzeProject(analysisData)

        // Create output directory if it doesn't exist
        const outputDir = './docs'
        if (!existsSync(outputDir)) {
            mkdirSync(outputDir, { recursive: true })
        }

        // Generate output filename
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
        const outputFile =
            options.output || join(outputDir, `ai-analysis-${timestamp}.md`)

        // Save AI documentation
        writeFileSync(outputFile, documentation)
        console.log(`✅ AI documentation saved to ${outputFile}`)

        // Save to MongoDB if requested
        if (options.saveToDb) {
            try {
                const dbAdapter = new MongoDBAdapter({
                    type: 'mongodb',
                    url: 'mongodb://localhost:27017/api_docs',
                    database: 'api_docs',
                    collections: {
                        documentation: 'documentation',
                        endpoints: 'endpoints',
                        types: 'types',
                    },
                    mapping: {
                        createCollections: true,
                        includeTypeSchemas: true,
                    },
                })

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

function getDefaultModel(provider: string): string {
    switch (provider) {
        case 'google':
            return 'gemini-2.5-flash'
        case 'openai':
            return 'gpt-4o'
        case 'anthropic':
            return 'claude-3-5-sonnet'
        default:
            return 'gemini-2.5-flash'
    }
}

program.parse()
