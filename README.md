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

## Installation

```bash
npm install @auto-doc-gen/universal
```

## Quick Start

### 1. Create Configuration

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

### 2. Set Environment Variables

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

### 3. Add NPM Scripts

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

### 4. Generate Documentation

```bash
# Detect framework
npm run docs:detect

# Analyze project
npm run docs:analyze

# Generate AI documentation
npm run docs:generate

# Full pipeline
npm run docs:full
```

## CLI Commands

### Analysis

```bash
# Analyze project
npx auto-doc-gen-universal analyze <path> [options]

# Detect framework
npx auto-doc-gen-universal detect <path> [options]
```

### AI Documentation

```bash
# Generate AI documentation
npx auto-doc-gen-universal ai <analysis-file> [options]
```

### Configuration

```bash
# Show configuration
npx auto-doc-gen-universal config show [options]

# Validate configuration
npx auto-doc-gen-universal config validate [options]

# Initialize configuration
npx auto-doc-gen-universal config init [options]
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
