# @auto-doc-gen/universal

🚀 **Universal TypeScript Framework Documentation Generator**

Works with **any TypeScript Node.js framework** - Express, NestJS, Fastify, Koa, and more!

## ✨ Features

-   🔍 **Auto-Detection** - Automatically identifies your framework
-   🌐 **Universal Support** - Works with Express, NestJS, Fastify, Koa
-   📊 **Smart Analysis** - Extracts routes, controllers, services, and types
-   🤖 **AI-Powered** - Generate documentation with AI
-   📄 **Multiple Outputs** - JSON, Markdown, and more
-   ⚡ **Fast & Lightweight** - Optimized for performance

## 🚀 Quick Start

### Installation

```bash
npm install -g @auto-doc-gen/universal
```

### Basic Usage

```bash
# Auto-detect framework and analyze
auto-doc-gen-universal analyze ./src

# Force specific framework
auto-doc-gen-universal analyze ./src --framework express

# Generate AI documentation
auto-doc-gen-universal ai ./analysis.json
```

## 🎯 Supported Frameworks

### Express.js

-   ✅ Route extraction (`app.get()`, `router.post()`)
-   ✅ Middleware analysis
-   ✅ Controller grouping
-   ✅ Parameter extraction

### NestJS

-   ✅ Controller decorators (`@Controller`, `@Get`, `@Post`)
-   ✅ Service dependency injection
-   ✅ Guard and interceptor detection
-   ✅ Module relationships

### Fastify

-   ✅ Route registration patterns
-   ✅ Plugin analysis
-   ✅ Schema extraction

### Koa

-   ✅ Middleware chains
-   ✅ Route handlers
-   ✅ Context analysis

### Generic TypeScript

-   ✅ Function extraction
-   ✅ Class analysis
-   ✅ Type definitions
-   ✅ Import/export mapping

## 📋 Commands

### `analyze` - Analyze your project

```bash
# Auto-detect framework
auto-doc-gen-universal analyze ./src

# Specify framework
auto-doc-gen-universal analyze ./src --framework express

# Multiple frameworks (monorepo)
auto-doc-gen-universal analyze ./src --frameworks express,nestjs

# With options
auto-doc-gen-universal analyze ./src --output analysis.json --verbose
```

### `detect` - Detect framework

```bash
# Detect framework in project
auto-doc-gen-universal detect ./src

# Show detection details
auto-doc-gen-universal detect ./src --verbose
```

### `ai` - Generate AI documentation

```bash
# Generate from analysis
auto-doc-gen-universal ai analysis.json

# With custom settings
auto-doc-gen-universal ai analysis.json --provider openai --model gpt-4
```

## 🔧 Configuration

Create `autodocgen.config.json`:

```json
{
    "frameworks": {
        "express": { "enabled": true },
        "nestjs": { "enabled": true },
        "fastify": { "enabled": false }
    },
    "extraction": {
        "includeTypes": true,
        "includeMiddleware": true,
        "includeTests": false
    },
    "output": {
        "format": "json",
        "directory": "./docs"
    },
    "ai": {
        "enabled": true,
        "provider": "openai",
        "model": "gpt-4"
    }
}
```

## 📊 Output Format

Universal analysis result:

```json
{
  "framework": "express",
  "routes": [
    {
      "path": "/api/users",
      "method": "GET",
      "handler": "getUsers",
      "middleware": ["auth", "validate"],
      "parameters": [
        { "name": "req", "type": "Request" },
        { "name": "res", "type": "Response" }
      ]
    }
  ],
  "controllers": [...],
  "services": [...],
  "types": [...],
  "metadata": {
    "totalRoutes": 15,
    "totalControllers": 3,
    "analysisTime": 1.2
  }
}
```

## 🏗️ Architecture

```
@auto-doc-gen/universal
├── 🔍 Framework Detection
├── 📊 Universal Extractors
├── 🔄 Framework Adapters
├── 📄 Unified Output
└── ⚙️ CLI Interface
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 Support

-   📖 [Documentation](https://github.com/better-hack/auto-doc-gen-universal/wiki)
-   🐛 [Issues](https://github.com/better-hack/auto-doc-gen-universal/issues)
-   💬 [Discussions](https://github.com/better-hack/auto-doc-gen-universal/discussions)

---

**Made with ❤️ by Better-Hack-Nullheads**
