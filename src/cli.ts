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
