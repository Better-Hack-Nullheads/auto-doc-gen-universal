// AutoDocGen Universal - Build Indicator JavaScript

class BuildIndicator {
    constructor() {
        this.refreshInterval = 5000 // 5 seconds
        this.updateInterval = 60000 // 1 minute
        this.init()
    }

    init() {
        this.setupAutoRefresh()
        this.setupStatusUpdates()
        this.setupPeriodicUpdates()
    }

    setupAutoRefresh() {
        // Auto-refresh every 5 seconds
        setInterval(() => {
            location.reload()
        }, this.refreshInterval)
    }

    setupStatusUpdates() {
        // Update status from server if available
        fetch('/api/status')
            .then((response) => response.json())
            .then((data) => {
                this.updateStatus(data)
            })
            .catch((error) => {
                console.log('Status API not available yet')
            })
    }

    setupPeriodicUpdates() {
        // Update last update time every minute
        setInterval(() => {
            this.updateLastUpdateTime()
        }, this.updateInterval)
    }

    updateStatus(data) {
        const statusIndicator = document.getElementById('statusIndicator')
        const statusText = document.getElementById('statusText')
        const mainInfo = document.getElementById('mainInfo')
        const statsGrid = document.getElementById('statsGrid')

        // Update status text and indicator
        if (data.status) {
            document.getElementById('status').textContent = data.status

            // Update status indicator based on state
            if (data.isBuilding) {
                this.setStatusIndicator(statusIndicator, 'building')
                statusText.textContent = 'Building Documentation...'
                mainInfo.className = 'info'
            } else if (data.error) {
                this.setStatusIndicator(statusIndicator, 'error')
                statusText.textContent = 'Error Occurred'
                mainInfo.className = 'info error'
            } else if (this.isCompleteStatus(data.status)) {
                this.setStatusIndicator(statusIndicator, 'success')
                statusText.textContent = 'Analysis Complete! ✅'
                mainInfo.className = 'info success'
                statsGrid.style.display = 'grid'
            } else {
                this.setStatusIndicator(statusIndicator, 'watching')
                statusText.textContent = 'Watching for Changes...'
                mainInfo.className = 'info'
            }
        }

        // Update framework
        if (data.framework) {
            document.getElementById('framework').textContent = data.framework
        }

        // Update last update time
        if (data.lastUpdate) {
            document.getElementById('lastUpdate').textContent = new Date(
                data.lastUpdate
            ).toLocaleTimeString()
        }

        // Update files processed
        if (data.filesProcessed !== undefined) {
            document.getElementById('filesProcessed').textContent =
                data.filesProcessed
        }

        // Update stats if available
        if (data.metadata) {
            this.updateStats(data.metadata)

            // Update database stats if available
            if (data.metadata.databaseStats) {
                this.updateDatabaseStats(data.metadata.databaseStats)
            }
        }
    }

    setStatusIndicator(element, status) {
        element.className = `status-indicator ${status}`
    }

    isCompleteStatus(status) {
        return (
            status.includes('complete') ||
            status.includes('success') ||
            status.includes('Analysis complete')
        )
    }

    updateStats(metadata) {
        const stats = {
            totalRoutes: metadata.totalRoutes,
            totalControllers: metadata.totalControllers,
            totalServices: metadata.totalServices,
            totalTypes: metadata.totalTypes,
        }

        Object.entries(stats).forEach(([key, value]) => {
            if (value !== undefined) {
                const element = document.getElementById(key)
                if (element) {
                    element.textContent = value
                }
            }
        })
    }

    updateDatabaseStats(dbStats) {
        // Show database section
        const dbSection = document.getElementById('databaseSection')
        if (dbSection) {
            dbSection.style.display = 'block'
        }

        // Update total documents
        const totalDocsElement = document.getElementById('dbTotalDocuments')
        if (totalDocsElement) {
            totalDocsElement.textContent = dbStats.totalDocuments
        }

        // Update latest run
        const latestRunElement = document.getElementById('dbLatestRun')
        if (latestRunElement) {
            latestRunElement.textContent = dbStats.latestRun || 'N/A'
        }

        // Update frameworks
        this.updateFrameworkList(dbStats.frameworks)

        // Update providers
        this.updateProviderList(dbStats.providers)

        // Update recent documents
        this.updateRecentDocuments(dbStats.recentDocuments)
    }

    updateFrameworkList(frameworks) {
        const frameworksElement = document.getElementById('dbFrameworks')
        if (!frameworksElement) return

        frameworksElement.innerHTML = ''
        Object.entries(frameworks).forEach(([framework, count]) => {
            const item = document.createElement('div')
            item.className = 'framework-item'
            item.textContent = `${framework}: ${count}`
            frameworksElement.appendChild(item)
        })
    }

    updateProviderList(providers) {
        const providersElement = document.getElementById('dbProviders')
        if (!providersElement) return

        providersElement.innerHTML = ''
        Object.entries(providers).forEach(([provider, count]) => {
            const item = document.createElement('div')
            item.className = 'provider-item'
            item.textContent = `${provider}: ${count}`
            providersElement.appendChild(item)
        })
    }

    updateRecentDocuments(documents) {
        const documentsElement = document.getElementById('recentDocuments')
        if (!documentsElement) return

        documentsElement.innerHTML = ''
        documents.forEach((doc) => {
            const item = document.createElement('div')
            item.className = 'document-item'

            const info = document.createElement('div')
            info.className = 'document-info'

            const source = document.createElement('div')
            source.className = 'document-source'
            source.textContent = doc.source

            const meta = document.createElement('div')
            meta.className = 'document-meta'
            meta.textContent = `${doc.provider} • ${doc.model}`

            info.appendChild(source)
            info.appendChild(meta)

            const time = document.createElement('div')
            time.className = 'document-time'
            time.textContent = new Date(doc.timestamp).toLocaleString()

            item.appendChild(info)
            item.appendChild(time)
            documentsElement.appendChild(item)
        })
    }

    updateLastUpdateTime() {
        const element = document.getElementById('lastUpdate')
        if (element) {
            element.textContent = new Date().toLocaleTimeString()
        }
    }
}

// Initialize the build indicator when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new BuildIndicator()
})
