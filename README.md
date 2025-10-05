# AutoDocGen Universal

A universal TypeScript framework documentation generator that works with Express, NestJS, Fastify, Koa, and any TypeScript framework.

## Features

-   🔍 **Universal Framework Support** - Works with any TypeScript framework
-   🤖 **AI Documentation Generation** - Google Gemini, OpenAI GPT, Anthropic Claude
-   🗄️ **MongoDB Integration** - Store analysis and documentation
-   ⚙️ **Flexible Configuration** - Environment variables and config files
-   📁 **File Management** - Save analysis and AI documentation
-   🎯 **Framework Detection** - Automatic framework detection
-   📊 **Comprehensive Analysis** - Routes, controllers, services, types
-   👀 **Watch Mode** - Real-time file watching with automatic analysis
-   🌐 **Build Indicator** - Beautiful HTML dashboard showing build status

## Installation

```bash
npm install @auto-doc-gen/universal
```

## Quick Start

### 1. Run Setup Script

In your project directory, run the setup script:

```bash
npm run docs:setup
```

This will create all necessary configuration files.

### 2. Manual Configuration (Alternative)

Create `autodocgen.config.json` in your project:

```json
{
    "ai": {
        "provider": "google",
        "model": "gemini-2.5-flash",
        "temperature": 0.7,
        "maxTokens": 4000
    },
    "database": {
        "enabled": true,
        "url": "mongodb://localhost:27017/api_docs",
        "database": "api_docs"
    },
    "files": {
        "outputDir": "./docs",
        "saveRawAnalysis": true,
        "saveAIDocs": true,
        "timestampFiles": true
    }
}
```

### 3. Set Environment Variables

Create `.env` file:

```bash
# AI Configuration
GOOGLE_AI_API_KEY=your_google_api_key_here
# OR
OPENAI_API_KEY=your_openai_api_key_here
# OR
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Database (optional)
AUTODOCGEN_DB_ENABLED=true
AUTODOCGEN_DB_URL=mongodb://localhost:27017/api_docs
```

### 4. Add NPM Scripts

Add to your `package.json`:

```json
{
    "scripts": {
        "docs:analyze": "npx auto-doc-gen-universal analyze . --config autodocgen.config.json",
        "docs:generate": "npx auto-doc-gen-universal ai docs/analysis.json --config autodocgen.config.json",
        "docs:full": "npm run docs:analyze && npm run docs:generate",
        "docs:detect": "npx auto-doc-gen-universal detect . --config autodocgen.config.json"
    }
}
```

### 5. Generate Documentation

```bash
# Detect framework
npm run docs:detect

# Analyze project
npm run docs:analyze

# Generate AI documentation
npm run docs:generate

# Full pipeline
npm run docs:full

# Watch mode (NEW!)
npm run watch
```

## CLI Commands Reference

### Installation & Setup

```bash
# Install the package globally
npm install -g @auto-doc-gen/universal

# Install locally in your project
npm install @auto-doc-gen/universal

# Run without installation (using npx)
npx @auto-doc-gen/universal <command>
```

### Project Analysis Commands

#### `analyze` - Analyze Project Structure

```bash
# Basic analysis
npx @auto-doc-gen/universal analyze

# Analyze specific directory
npx @auto-doc-gen/universal analyze ./src

# Analyze with custom output file
npx @auto-doc-gen/universal analyze --output custom-analysis.json

# Analyze with custom config
npx @auto-doc-gen/universal analyze --config ./my-config.json

# Options:
#   -o, --output <file>      Output file path (default: analysis.json)
#   -c, --config <file>      Config file path (default: autodocgen.config.json)
#   -v, --verbose            Enable verbose logging
#   -h, --help               Show help
```

#### `detect` - Detect Framework Type

```bash
# Detect framework in current directory
npx @auto-doc-gen/universal detect

# Detect framework in specific directory
npx @auto-doc-gen/universal detect ./src

# Detect with verbose output
npx @auto-doc-gen/universal detect --verbose

# Options:
#   -c, --config <file>      Config file path
#   -v, --verbose            Show detailed detection results
#   -h, --help               Show help
```

### AI Documentation Commands

#### `generate` - Generate Complete Documentation (Recommended)

```bash
# Generate complete documentation from current project
npx @auto-doc-gen/universal generate

# Generate from specific directory
npx @auto-doc-gen/universal generate ./src

# Generate with custom output directory
npx @auto-doc-gen/universal generate --output-dir ./docs/chunks

# Generate without saving to database
npx @auto-doc-gen/universal generate --no-save-to-db

# Options:
#   -o, --output-dir <dir>    Output directory for chunks (default: docs/test)
#   --save-to-db              Save AI documentation to MongoDB (default: true)
#   --no-save-to-db           Don't save to database
#   -c, --config <file>       Config file path
#   -v, --verbose             Enable verbose logging
#   -h, --help                Show help
```

#### `ai` - Generate AI Documentation

```bash
# Generate documentation from analysis file
npx @auto-doc-gen/universal ai ./docs/analysis.json

# Generate with custom output
npx @auto-doc-gen/universal ai ./docs/analysis.json --output ./docs/ai-docs.md

# Generate with specific AI provider
npx @auto-doc-gen/universal ai ./docs/analysis.json --provider openai

# Generate with custom model
npx @auto-doc-gen/universal ai ./docs/analysis.json --model gpt-4o

# Options:
#   -o, --output <file>      Output file path (default: ai-analysis.md)
#   -c, --config <file>      Config file path
#   -p, --provider <name>    AI provider (google|openai|anthropic)
#   -m, --model <name>       AI model name
#   -t, --temperature <num>  Temperature setting (0.0-1.0)
#   --max-tokens <num>       Maximum tokens to generate
#   --custom-prompt <text>   Custom prompt template
#   -v, --verbose            Enable verbose logging
#   -h, --help               Show help
```

#### `scalar` - Generate Scalar API Documentation

```bash
# Generate Scalar documentation
npx @auto-doc-gen/universal scalar ./docs/analysis.json

# Generate with custom output
npx @auto-doc-gen/universal scalar ./docs/analysis.json --output ./docs/scalar.html

# Generate with custom title
npx @auto-doc-gen/universal scalar ./docs/analysis.json --title "My API Docs"

# Options:
#   -o, --output <file>      Output file path (default: scalar-docs.html)
#   -c, --config <file>      Config file path
#   -t, --title <text>       Documentation title
#   --theme <name>           Scalar theme (default|purple|blue)
#   -v, --verbose            Enable verbose logging
#   -h, --help               Show help
```

### Watch Mode Commands

#### `watch` - Real-time File Monitoring

```bash
# Basic watch mode
npx @auto-doc-gen/universal watch

# Watch specific directory
npx @auto-doc-gen/universal watch ./src

# Watch with custom port
npx @auto-doc-gen/universal watch --port 3002

# Watch with custom debounce delay
npx @auto-doc-gen/universal watch --debounce 2000

# Watch without auto-analysis
npx @auto-doc-gen/universal watch --no-auto-analyze

# Watch with ignore patterns
npx @auto-doc-gen-universal watch --ignore "node_modules/**,dist/**,*.log"

# Options:
#   -p, --port <port>        Port for build indicator server (default: 3001)
#   -d, --debounce <ms>      Debounce delay in milliseconds (default: 1000)
#   --no-auto-analyze        Disable automatic analysis on file changes
#   --ignore <patterns>      Comma-separated ignore patterns
#   -c, --config <file>      Config file path
#   -v, --verbose            Enable verbose logging
#   -h, --help               Show help
```

### MongoDB Data Commands

#### `db:latest` - Get Latest Documents

```bash
# Get latest 10 documents
npx @auto-doc-gen/universal db:latest

# Get latest 20 documents
npx @auto-doc-gen/universal db:latest --limit 20

# Get latest 50 documents
npx @auto-doc-gen/universal db:latest -l 50

# Options:
#   -l, --limit <number>     Number of documents to fetch (default: 10)
#   -c, --config <file>      Config file path
#   -h, --help               Show help
```

#### `db:stats` - Get Analysis Statistics

```bash
# Get comprehensive statistics
npx @auto-doc-gen/universal db:stats

# Options:
#   -c, --config <file>      Config file path
#   -h, --help               Show help
```

#### `db:run` - Get Documents by Run ID

```bash
# Get documents from specific run
npx @auto-doc-gen/universal db:run abc123-def456-ghi789

# Options:
#   -c, --config <file>      Config file path
#   -h, --help               Show help
```

#### `db:chunks` - Get Unique Chunk Timestamps

```bash
# Get all unique chunk timestamps
npx @auto-doc-gen/universal db:chunks

# Options:
#   -c, --config <file>      Config file path
#   -h, --help               Show help
```

#### `db:chunk` - Get Documents by Chunk Time

```bash
# Get documents from specific chunk
npx @auto-doc-gen/universal db:chunk 2025-01-05T10:30:00.000Z

# Options:
#   -c, --config <file>      Config file path
#   -h, --help               Show help
```

#### `db:count` - Get Document Count

```bash
# Get total document count
npx @auto-doc-gen/universal db:count

# Options:
#   -c, --config <file>      Config file path
#   -h, --help               Show help
```

### Configuration Commands

#### `config` - Configuration Management

```bash
# Show current configuration
npx @auto-doc-gen/universal config

# Show configuration from specific file
npx @auto-doc-gen/universal config --file ./my-config.json

# Validate configuration
npx @auto-doc-gen/universal config --validate

# Options:
#   -f, --file <path>        Config file path
#   --validate               Validate configuration
#   -h, --help               Show help
```

### Utility Commands

#### `help` - Show Help

```bash
# Show general help
npx @auto-doc-gen/universal help

# Show help for specific command
npx @auto-doc-gen/universal help analyze
npx @auto-doc-gen/universal help watch
npx @auto-doc-gen/universal help db:latest
```

#### `version` - Show Version

```bash
# Show package version
npx @auto-doc-gen/universal --version
npx @auto-doc-gen/universal -V
```

### Global Options

All commands support these global options:

```bash
# Global options available for all commands:
#   -c, --config <file>      Config file path (default: autodocgen.config.json)
#   -v, --verbose            Enable verbose logging
#   -h, --help               Show help
#   --version                Show version
```

### Command Aliases

```bash
# Short aliases for common commands:
npx @auto-doc-gen/universal a          # analyze
npx @auto-doc-gen/universal d          # detect
npx @auto-doc-gen/universal w          # watch
npx @auto-doc-gen/universal s          # scalar
```

### Environment Variables

All commands respect these environment variables:

```bash
# AI Configuration
AUTODOCGEN_AI_PROVIDER=google
GOOGLE_AI_API_KEY=your_key
OPENAI_API_KEY=your_key
ANTHROPIC_API_KEY=your_key

# Database Configuration
AUTODOCGEN_DB_ENABLED=true
AUTODOCGEN_DB_URL=mongodb://localhost:27017/api_docs
AUTODOCGEN_DB_NAME=api_docs

# File Configuration
AUTODOCGEN_OUTPUT_DIR=./docs
AUTODOCGEN_SAVE_RAW=true
AUTODOCGEN_TIMESTAMP_FILES=true
```

## Complete Workflow Examples

### Basic Documentation Generation Workflow

```bash
# 1. Install the package
npm install @auto-doc-gen/universal

# 2. Create configuration file
cat > autodocgen.config.json << EOF
{
    "ai": {
        "provider": "google",
        "model": "gemini-2.5-flash",
        "temperature": 0.7
    },
    "database": {
        "enabled": true,
        "url": "mongodb://localhost:27017/api_docs"
    },
    "files": {
        "outputDir": "./docs",
        "saveRawAnalysis": true,
        "saveAIDocs": true
    }
}
EOF

# 3. Set up environment variables
export GOOGLE_AI_API_KEY="your_google_api_key_here"

# 4. Generate complete documentation (recommended)
npx @auto-doc-gen/universal generate

# OR use individual commands:
# 4a. Analyze your project
npx @auto-doc-gen/universal analyze ./src

# 4b. Generate AI documentation
npx @auto-doc-gen/universal ai ./docs/analysis.json

# 4c. Generate Scalar API docs
npx @auto-doc-gen/universal scalar ./docs/analysis.json
```

### Development Workflow with Watch Mode

```bash
# 1. Start watch mode for real-time analysis
npx @auto-doc-gen/universal watch ./src --port 3001

# 2. Open build indicator dashboard
# Visit: http://localhost:3001

# 3. Make changes to your code
# Watch mode will automatically analyze and update

# 4. Check database for latest documents
npx @auto-doc-gen/universal db:latest

# 5. Get analysis statistics
npx @auto-doc-gen/universal db:stats
```

### Advanced Workflow with Custom Configuration

```bash
# 1. Create custom config for different environments
cat > config.production.json << EOF
{
    "ai": {
        "provider": "openai",
        "model": "gpt-4o",
        "temperature": 0.3
    },
    "database": {
        "enabled": true,
        "url": "mongodb://prod-server:27017/api_docs"
    },
    "files": {
        "outputDir": "./dist/docs",
        "timestampFiles": true
    }
}
EOF

# 2. Analyze with production config
npx @auto-doc-gen/universal analyze ./src --config config.production.json

# 3. Generate documentation with specific settings
npx @auto-doc-gen/universal ai ./dist/docs/analysis.json \
    --config config.production.json \
    --output ./dist/docs/api-documentation.md \
    --provider openai \
    --model gpt-4o

# 4. Generate Scalar docs with custom theme
npx @auto-doc-gen/universal scalar ./dist/docs/analysis.json \
    --output ./dist/docs/scalar.html \
    --title "Production API Documentation" \
    --theme purple
```

### Database Management Workflow

```bash
# 1. Check database connection and stats
npx @auto-doc-gen/universal db:stats

# 2. Get latest analysis results
npx @auto-doc-gen/universal db:latest --limit 5

# 3. Find documents from specific analysis run
npx @auto-doc-gen/universal db:run abc123-def456-ghi789

# 4. Get all available chunk timestamps
npx @auto-doc-gen/universal db:chunks

# 5. Get documents from specific time period
npx @auto-doc-gen/universal db:chunk 2025-01-05T10:30:00.000Z

# 6. Count total documents
npx @auto-doc-gen/universal db:count
```

### NPM Scripts Integration

Add these scripts to your `package.json`:

```json
{
    "scripts": {
        "docs:setup": "npx @auto-doc-gen/universal config --validate",
        "docs:generate": "npx @auto-doc-gen/universal generate",
        "docs:detect": "npx @auto-doc-gen/universal detect ./src",
        "docs:analyze": "npx @auto-doc-gen/universal analyze ./src",
        "docs:ai": "npx @auto-doc-gen/universal ai ./docs/analysis.json",
        "docs:scalar": "npx @auto-doc-gen/universal scalar ./docs/analysis.json",
        "docs:watch": "npx @auto-doc-gen/universal watch ./src",
        "docs:db:stats": "npx @auto-doc-gen/universal db:stats",
        "docs:db:latest": "npx @auto-doc-gen/universal db:latest",
        "docs:full": "npm run docs:analyze && npm run docs:ai && npm run docs:scalar",
        "docs:dev": "npm run docs:watch"
    }
}
```

Then use them like:

```bash
# Quick setup and validation
npm run docs:setup

# Generate complete documentation (recommended)
npm run docs:generate

# Full documentation generation (alternative)
npm run docs:full

# Development with watch mode
npm run docs:dev

# Check database status
npm run docs:db:stats
```

### Configuration

Configuration is handled by the consuming project. Use the setup script:

```bash
# Run setup script in your project
npm run docs:setup
```

## Command Reference Table

| Command     | Description                     | Usage Example                                             |
| ----------- | ------------------------------- | --------------------------------------------------------- |
| `generate`  | Generate complete documentation | `npx @auto-doc-gen/universal generate`                    |
| `analyze`   | Analyze project structure       | `npx @auto-doc-gen/universal analyze ./src`               |
| `detect`    | Detect framework type           | `npx @auto-doc-gen/universal detect`                      |
| `ai`        | Generate AI documentation       | `npx @auto-doc-gen/universal ai ./docs/analysis.json`     |
| `scalar`    | Generate Scalar API docs        | `npx @auto-doc-gen/universal scalar ./docs/analysis.json` |
| `watch`     | Real-time file monitoring       | `npx @auto-doc-gen/universal watch ./src`                 |
| `db:latest` | Get latest documents            | `npx @auto-doc-gen/universal db:latest`                   |
| `db:stats`  | Get analysis statistics         | `npx @auto-doc-gen/universal db:stats`                    |
| `db:run`    | Get documents by run ID         | `npx @auto-doc-gen/universal db:run <runId>`              |
| `db:chunks` | Get unique chunk timestamps     | `npx @auto-doc-gen/universal db:chunks`                   |
| `db:chunk`  | Get documents by chunk time     | `npx @auto-doc-gen/universal db:chunk <time>`             |
| `db:count`  | Get document count              | `npx @auto-doc-gen/universal db:count`                    |
| `config`    | Configuration management        | `npx @auto-doc-gen/universal config`                      |
| `help`      | Show help                       | `npx @auto-doc-gen/universal help`                        |
| `version`   | Show version                    | `npx @auto-doc-gen/universal --version`                   |

## Troubleshooting

### Common Issues

#### 1. "Cannot find module" Error

```bash
# Solution: Install the package first
npm install @auto-doc-gen/universal

# Or use npx to run without installation
npx @auto-doc-gen/universal <command>
```

#### 2. "No .env file found" Warning

```bash
# Solution: Create .env file with your API keys
cat > .env << EOF
GOOGLE_AI_API_KEY=your_google_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
EOF
```

#### 3. MongoDB Connection Issues

```bash
# Check if MongoDB is running
mongosh --eval "db.runCommand('ping')"

# Verify connection string in config
npx @auto-doc-gen/universal config --validate
```

#### 4. Watch Mode Not Detecting Changes

```bash
# Check ignore patterns
npx @auto-doc-gen/universal watch --ignore "node_modules/**,dist/**"

# Increase debounce delay
npx @auto-doc-gen/universal watch --debounce 2000
```

#### 5. Build Indicator Not Loading

```bash
# Check if port is available
npx @auto-doc-gen/universal watch --port 3002

# Verify firewall settings
curl http://localhost:3001/api/status
```

### Debug Mode

Enable verbose logging for troubleshooting:

```bash
# Run any command with verbose flag
npx @auto-doc-gen/universal analyze --verbose
npx @auto-doc-gen/universal watch --verbose
npx @auto-doc-gen/universal db:stats --verbose
```

### Getting Help

```bash
# General help
npx @auto-doc-gen/universal help

# Command-specific help
npx @auto-doc-gen/universal help analyze
npx @auto-doc-gen/universal help watch
npx @auto-doc-gen/universal help db:latest

# Show version
npx @auto-doc-gen/universal --version
```

## Configuration Options

### AI Configuration

```json
{
    "ai": {
        "provider": "google|openai|anthropic",
        "model": "model-name",
        "temperature": 0.7,
        "maxTokens": 4000,
        "customPrompt": "optional custom prompt"
    }
}
```

### Database Configuration

```json
{
    "database": {
        "enabled": true,
        "url": "mongodb://localhost:27017/api_docs",
        "database": "api_docs",
        "collections": {
            "documentation": "documentation",
            "endpoints": "endpoints",
            "types": "types"
        }
    }
}
```

### File Configuration

```json
{
    "files": {
        "outputDir": "./docs",
        "analysisFilename": "analysis.json",
        "docsFilename": "ai-analysis.md",
        "saveRawAnalysis": true,
        "saveAIDocs": true,
        "timestampFiles": true
    }
}
```

## Environment Variables

### AI Configuration

```bash
AUTODOCGEN_AI_PROVIDER=google
GOOGLE_AI_API_KEY=your_key
AUTODOCGEN_GOOGLE_MODEL=gemini-2.5-flash
```

### Database Configuration

```bash
AUTODOCGEN_DB_ENABLED=true
AUTODOCGEN_DB_URL=mongodb://localhost:27017/api_docs
AUTODOCGEN_DB_NAME=api_docs
```

### File Configuration

```bash
AUTODOCGEN_OUTPUT_DIR=./docs
AUTODOCGEN_SAVE_RAW=true
AUTODOCGEN_TIMESTAMP_FILES=true
```

## Watch Mode Features

### Real-time Monitoring

-   👀 **File Watching** - Monitors TypeScript files for changes
-   🔄 **Auto Analysis** - Automatically analyzes project on file changes
-   ⏱️ **Debounced Processing** - Prevents excessive analysis with configurable delays
-   🚫 **Smart Ignoring** - Ignores node_modules, dist, and other build artifacts

### Build Indicator Dashboard

-   🌐 **Web Interface** - Beautiful HTML dashboard at `http://localhost:3001`
-   📊 **Real-time Status** - Live updates of analysis progress
-   📈 **Progress Tracking** - Shows files processed and current status
-   🔄 **Auto-refresh** - Dashboard updates automatically every 5 seconds
-   📱 **Responsive Design** - Works on desktop and mobile devices

### Usage Examples

```bash
# Basic watch mode
npx auto-doc-gen-universal watch

# Watch specific directory
npx auto-doc-gen-universal watch ./src

# Custom port and debounce
npx auto-doc-gen-universal watch -p 8080 -d 2000

# Disable auto-analysis (watch only)
npx auto-doc-gen-universal watch --no-auto-analyze

# Custom ignore patterns
npx auto-doc-gen-universal watch --ignore "*.test.ts,*.spec.ts"
```

## Supported Frameworks

-   ✅ **NestJS** - Controllers, services, decorators
-   ✅ **Express** - Routes, middleware, handlers
-   ✅ **Fastify** - Routes, plugins, schemas
-   ✅ **Koa** - Middleware, routes, context
-   ✅ **Any TypeScript** - Generic pattern matching

## AI Providers

### Google Gemini

```json
{
    "ai": {
        "provider": "google",
        "model": "gemini-2.5-flash"
    }
}
```

### OpenAI

```json
{
    "ai": {
        "provider": "openai",
        "model": "gpt-4o"
    }
}
```

### Anthropic

```json
{
    "ai": {
        "provider": "anthropic",
        "model": "claude-3-5-sonnet"
    }
}
```

## Output Examples

### Analysis JSON

```json
{
    "framework": "nestjs",
    "routes": [
        {
            "method": "GET",
            "path": "/products",
            "controller": "ProductsController",
            "handler": "findAll"
        }
    ],
    "controllers": [
        {
            "name": "ProductsController",
            "path": "src/products/products.controller.ts"
        }
    ],
    "services": [
        {
            "name": "ProductsService",
            "path": "src/products/products.service.ts"
        }
    ],
    "types": [
        {
            "name": "Product",
            "properties": [
                {
                    "name": "id",
                    "type": "string"
                }
            ]
        }
    ]
}
```

### AI Documentation

````markdown
# API Documentation

## Products API

### GET /products

Get all products

**Response:**

```json
{
    "products": [
        {
            "id": "string",
            "name": "string",
            "price": "number"
        }
    ]
}
```
````

```

## License

MIT
```
