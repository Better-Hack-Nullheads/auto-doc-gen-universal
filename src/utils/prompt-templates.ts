// Universal analysis data interface (works with any framework)
interface UniversalAnalysisData {
    framework?: string
    routes?: any[]
    controllers?: any[]
    services?: any[]
    types?: any[]
    metadata?: {
        totalFiles?: number
        totalControllers?: number
        totalServices?: number
        totalMethods?: number
        totalTypes?: number
        totalRoutes?: number
        analysisTime?: number
    }
}

export class PromptTemplates {
    static getDefaultTemplate(): string {
        return `
        You are a technical writer specialized in APIs. Given a universal TypeScript project analysis (works with Express, NestJS, Fastify, Koa, and any framework), generate documentation in MDX format — suitable for modern documentation frameworks such as Next.js, Nextra, or Docusaurus.

        Your goal is to produce clear, professional, and visually structured documentation with interactive MDX components when appropriate.

        🎯 Requirements

        **Title & Overview**
        - Use a top-level heading (#) for the API name.
        - Include metadata (version, date, framework) in frontmatter or as a JSX component.
        - Provide a short, meaningful description of what the endpoint does (business or technical context).
        - Optionally include <Info>, <Note>, or <Warning> components for key highlights.

        **Framework Information**
        - Specify the detected framework (Express, NestJS, Fastify, Koa, etc.).
        - Explain framework-specific patterns and conventions used.
        - Mention any framework-specific features or middleware.

        **Authentication & Security**
        - Specify authentication type (e.g. API key, Bearer token).
        - List required headers or tokens.
        - Mention permission roles if applicable.
        - Use <Auth type="Bearer" /> or similar illustrative MDX components if available.

        **Endpoint Definition**
        - Show HTTP method and full path inside a styled code block, e.g. \`GET /api/v1/users\`
        - Present query parameters, request headers, and request body using MDX tables or JSX table components:
        - Include example JSON requests in fenced code blocks (json).

        **Response**
        - List all relevant HTTP status codes with short descriptions.
        - Show success and error response bodies using JSON code blocks.
        - Optionally, use <ResponseExample status="200"> or <ErrorExample status="400"> components for better visual separation.

        **Examples & Code Snippets**
        - Include at least two language examples (e.g. cURL + JavaScript/Python).
        - Highlight authentication in examples.
        - Use MDX code blocks with syntax highlighting.
        - Include one realistic example that mimics real-world usage.

        **Error Handling**
        - List all possible error codes and messages.
        - Add a <Callout type="error"> or <Warning> for common troubleshooting notes.

        **Best Practices / Notes**
        - Mention rate limits, payload size limits, pagination rules, etc.
        - Use callout components like <Tip> or <Warning> where appropriate.
        - Highlight deprecated fields with <Deprecated> if available.

        **Versioning & Changelog**
        - Document version history and notable changes.
        - If MDX supports tabs or accordions, use them for version comparison.

        💡 Style & Formatting Rules
        - Use proper MDX syntax (Markdown + JSX).
        - Headings must follow a consistent hierarchy (#, ##, ###).
        - Use MDX tables or JSX components (e.g., <ParamTable />, <ResponseTable />) for structured data.
        - Use fenced code blocks with language identifiers (json, bash, ts, etc.) for syntax highlighting.
        - Keep writing concise, direct, and active.
        - Use backticks for inline code, e.g. \`user_id\`.
        - Use American English spelling and consistent naming conventions.

        📄 Output Format
        Produce a valid MDX document containing:

        Optional YAML frontmatter with:
        \`\`\`yaml
        ---
        title: "API Documentation"
        version: "v1.0"
        date: "2025-01-XX"
        framework: "{{framework}}"
        ---
        \`\`\`

        Sections in this order:
        1. Overview
        2. Framework Information
        3. Authentication
        4. Endpoint Definition
        5. Request (Headers, Query Parameters, Request Body, Example Request)
        6. Response (Success Response, Error Responses, Example Response)
        7. Examples / Code Snippets
        8. Error Handling
        9. Notes / Best Practices
        10. Changelog / Version History

        ⚙️ Instruction
        Given the universal TypeScript project analysis below, generate the MDX documentation following all the rules and structure above.

        Project Analysis:
        - Framework: {{framework}}
        - Routes: {{totalRoutes}}
        - Controllers: {{totalControllers}}
        - Services: {{totalServices}}
        - Types: {{totalTypes}}
        
        Routes: {{routes}}
        Controllers: {{controllers}}
        Services: {{services}}
        Data Models: {{types}}
        `
    }

    static getSecurityFocusedTemplate(): string {
        return `
        Focus on security analysis for this universal TypeScript project:
        Framework: {{framework}}
        {{projectData}}
        
        Provide security recommendations for:
        - Authentication and authorization
        - Input validation
        - Data protection
        - API security best practices
        - Common vulnerabilities and mitigations
        - Framework-specific security considerations
        `
    }

    static getPerformanceFocusedTemplate(): string {
        return `
        Analyze performance aspects of this universal TypeScript project:
        Framework: {{framework}}
        {{projectData}}
        
        Focus on:
        - Database query optimization
        - Caching strategies
        - API response optimization
        - Memory usage patterns
        - Scalability considerations
        - Framework-specific performance optimizations
        `
    }

    static getArchitectureFocusedTemplate(): string {
        return `
        Analyze the architecture and design patterns of this universal TypeScript project:
        Framework: {{framework}}
        {{projectData}}
        
        Focus on:
        - Design patterns used
        - Module organization
        - Dependency injection patterns (if applicable)
        - Code organization and structure
        - Architectural best practices
        - Framework-specific architectural patterns
        `
    }

    static buildPrompt(template: string, analysisData: UniversalAnalysisData): string {
        const metadata = analysisData.metadata || {}
        const framework = analysisData.framework || 'unknown'
        const routes = JSON.stringify(analysisData.routes || [], null, 2)
        const controllers = JSON.stringify(analysisData.controllers || [], null, 2)
        const services = JSON.stringify(analysisData.services || [], null, 2)
        const types = JSON.stringify(analysisData.types || [], null, 2)
        const projectData = JSON.stringify(analysisData, null, 2)

        return template
            .replace(/\{\{framework\}\}/g, framework)
            .replace(
                /\{\{totalFiles\}\}/g,
                (metadata.totalFiles || 0).toString()
            )
            .replace(
                /\{\{totalControllers\}\}/g,
                (metadata.totalControllers || 0).toString()
            )
            .replace(
                /\{\{totalServices\}\}/g,
                (metadata.totalServices || 0).toString()
            )
            .replace(
                /\{\{totalMethods\}\}/g,
                (metadata.totalMethods || 0).toString()
            )
            .replace(
                /\{\{totalTypes\}\}/g,
                (metadata.totalTypes || 0).toString()
            )
            .replace(
                /\{\{totalRoutes\}\}/g,
                (metadata.totalRoutes || 0).toString()
            )
            .replace(/\{\{routes\}\}/g, routes)
            .replace(/\{\{controllers\}\}/g, controllers)
            .replace(/\{\{services\}\}/g, services)
            .replace(/\{\{types\}\}/g, types)
            .replace(/\{\{projectData\}\}/g, projectData)
    }

    static getTemplate(templateName: string): string {
        switch (templateName) {
            case 'security':
                return this.getSecurityFocusedTemplate()
            case 'performance':
                return this.getPerformanceFocusedTemplate()
            case 'architecture':
                return this.getArchitectureFocusedTemplate()
            case 'default':
            default:
                return this.getDefaultTemplate()
        }
    }
}
