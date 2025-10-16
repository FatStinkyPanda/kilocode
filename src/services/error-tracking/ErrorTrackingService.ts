import * as vscode from "vscode"
import * as path from "path"
import * as fs from "fs/promises"
import EventEmitter from "events"

export enum ErrorSeverity {
	CRITICAL = "critical",
	ERROR = "error",
	WARNING = "warning",
	INFO = "info",
}

export enum ErrorComponent {
	BUILD = "build",
	RUNTIME = "runtime",
	TYPESCRIPT = "typescript",
	LINTER = "linter",
	TEST = "test",
	DEPENDENCY = "dependency",
	SYNTAX = "syntax",
	SEMANTIC = "semantic",
	FILESYSTEM = "filesystem",
	NETWORK = "network",
	UNKNOWN = "unknown",
}

export interface ErrorPattern {
	pattern: RegExp
	component: ErrorComponent
	severity: ErrorSeverity
	suggestedFix?: string
	contextKeywords?: string[]
}

export interface TrackedError {
	id: string
	timestamp: Date
	component: ErrorComponent
	severity: ErrorSeverity
	message: string
	filePath?: string
	lineNumber?: number
	columnNumber?: number
	stackTrace?: string
	suggestedFix?: string
	relatedFiles?: string[]
	diagnostics?: vscode.Diagnostic[]
	pattern?: string
	occurrenceCount: number
	firstOccurrence: Date
	lastOccurrence: Date
}

export interface ErrorSummary {
	totalErrors: number
	totalWarnings: number
	errorsByComponent: Record<string, number>
	errorsBySeverity: Record<string, number>
	recentErrors: TrackedError[]
	criticalErrors: TrackedError[]
	affectedFiles: string[]
	needsAIAttention: boolean
	aiContextSummary: string
}

export interface ErrorTrackingConfig {
	enabled: boolean
	trackBuild: boolean
	trackDiagnostics: boolean
	trackTerminalOutput: boolean
	autoCreateErrorFolder: boolean
	maxRecentErrors: number
	maxErrorsPerFile: number
	intelligentGrouping: boolean
	aiContextGeneration: boolean
}

/**
 * Intelligent Error Tracking Service for Kilocode
 * Automatically detects, tracks, and categorizes errors from multiple sources
 * Provides smart AI context without overwhelming the model
 */
export class ErrorTrackingService extends EventEmitter {
	private static instance: ErrorTrackingService | undefined
	private config: ErrorTrackingConfig
	private outputChannel: vscode.OutputChannel
	private workspacePath: string | undefined
	private context: vscode.ExtensionContext

	private errors: Map<string, TrackedError> = new Map()
	private errorPatterns: ErrorPattern[] = []
	private diagnosticsSubscription?: vscode.Disposable
	private lastErrorSummary?: ErrorSummary

	private constructor(
		config: ErrorTrackingConfig,
		outputChannel: vscode.OutputChannel,
		context: vscode.ExtensionContext,
		workspacePath?: string,
	) {
		super()
		this.config = config
		this.outputChannel = outputChannel
		this.context = context
		this.workspacePath = workspacePath
		this.initializeErrorPatterns()
		this.outputChannel.appendLine("[ErrorTracking] Service initialized")
	}

	static getInstance(
		config?: ErrorTrackingConfig,
		outputChannel?: vscode.OutputChannel,
		context?: vscode.ExtensionContext,
		workspacePath?: string,
	): ErrorTrackingService {
		if (!ErrorTrackingService.instance && config && outputChannel && context) {
			ErrorTrackingService.instance = new ErrorTrackingService(config, outputChannel, context, workspacePath)
		}
		return ErrorTrackingService.instance!
	}

	updateConfig(config: Partial<ErrorTrackingConfig>) {
		this.config = { ...this.config, ...config }
		this.outputChannel.appendLine(`[ErrorTracking] Config updated`)
	}

	updateWorkspacePath(workspacePath: string) {
		this.workspacePath = workspacePath
	}

	/**
	 * Initialize error patterns for intelligent categorization
	 */
	private initializeErrorPatterns() {
		this.errorPatterns = [
			// TypeScript errors
			{
				pattern: /TS\d+:/,
				component: ErrorComponent.TYPESCRIPT,
				severity: ErrorSeverity.ERROR,
				contextKeywords: ["type", "interface", "class", "import"],
			},
			// Syntax errors
			{
				pattern: /SyntaxError|Unexpected token|Missing|Expected/i,
				component: ErrorComponent.SYNTAX,
				severity: ErrorSeverity.ERROR,
				suggestedFix: "Check for missing brackets, parentheses, or semicolons",
			},
			// Module/Import errors
			{
				pattern: /Cannot find module|Module not found|ERR_MODULE_NOT_FOUND/i,
				component: ErrorComponent.DEPENDENCY,
				severity: ErrorSeverity.ERROR,
				suggestedFix: "Run npm install or check import paths",
				contextKeywords: ["import", "require", "package.json"],
			},
			// Build errors
			{
				pattern: /Error: build failed|Build error|Compilation error/i,
				component: ErrorComponent.BUILD,
				severity: ErrorSeverity.ERROR,
			},
			// Runtime errors
			{
				pattern: /TypeError|ReferenceError|RangeError/i,
				component: ErrorComponent.RUNTIME,
				severity: ErrorSeverity.ERROR,
			},
			// File system errors
			{
				pattern: /ENOENT|EACCES|EPERM|File not found/i,
				component: ErrorComponent.FILESYSTEM,
				severity: ErrorSeverity.ERROR,
				suggestedFix: "Check file path and permissions",
			},
			// Network errors
			{
				pattern: /ECONNREFUSED|ETIMEDOUT|ENOTFOUND|Network error/i,
				component: ErrorComponent.NETWORK,
				severity: ErrorSeverity.WARNING,
				suggestedFix: "Check network connection and API endpoints",
			},
		]
	}

	/**
	 * Start monitoring for errors
	 */
	async startMonitoring() {
		if (!this.config.enabled) {
			return
		}

		this.outputChannel.appendLine("[ErrorTracking] Starting error monitoring")

		// Monitor VSCode diagnostics
		if (this.config.trackDiagnostics) {
			this.startDiagnosticsMonitoring()
		}

		// Create error folder if needed
		if (this.config.autoCreateErrorFolder && this.workspacePath) {
			await this.createErrorFolder()
		}
	}

	/**
	 * Monitor VSCode diagnostics (TypeScript, ESLint, etc.)
	 */
	private startDiagnosticsMonitoring() {
		// Subscribe to diagnostic changes
		this.diagnosticsSubscription = vscode.languages.onDidChangeDiagnostics((e) => {
			this.handleDiagnosticsChange(e)
		})

		// Process existing diagnostics
		this.processExistingDiagnostics()
	}

	/**
	 * Process existing diagnostics from all open files
	 */
	private processExistingDiagnostics() {
		const diagnostics = vscode.languages.getDiagnostics()
		for (const [uri, fileDiagnostics] of diagnostics) {
			this.processDiagnostics(uri, fileDiagnostics)
		}
	}

	/**
	 * Handle diagnostics change event
	 */
	private handleDiagnosticsChange(event: vscode.DiagnosticChangeEvent) {
		for (const uri of event.uris) {
			const diagnostics = vscode.languages.getDiagnostics(uri)
			this.processDiagnostics(uri, diagnostics)
		}
	}

	/**
	 * Process diagnostics for a file
	 */
	private processDiagnostics(uri: vscode.Uri, diagnostics: vscode.Diagnostic[]) {
		// Filter to only errors and warnings
		const significantDiagnostics = diagnostics.filter(
			(d) => d.severity === vscode.DiagnosticSeverity.Error || d.severity === vscode.DiagnosticSeverity.Warning,
		)

		if (significantDiagnostics.length === 0) {
			// No errors, clear from tracking if present
			this.clearErrorsForFile(uri.fsPath)
			return
		}

		// Track each diagnostic
		for (const diagnostic of significantDiagnostics) {
			this.trackDiagnostic(uri, diagnostic)
		}
	}

	/**
	 * Track a diagnostic as an error
	 */
	private trackDiagnostic(uri: vscode.Uri, diagnostic: vscode.Diagnostic) {
		const errorId = this.generateErrorId(uri.fsPath, diagnostic.message, diagnostic.range.start.line)

		const severity =
			diagnostic.severity === vscode.DiagnosticSeverity.Error ? ErrorSeverity.ERROR : ErrorSeverity.WARNING

		const component = this.categorizeError(diagnostic.message, diagnostic.source || "")

		const existingError = this.errors.get(errorId)

		if (existingError) {
			// Update existing error
			existingError.lastOccurrence = new Date()
			existingError.occurrenceCount++
			this.errors.set(errorId, existingError)
		} else {
			// Create new error
			const trackedError: TrackedError = {
				id: errorId,
				timestamp: new Date(),
				component,
				severity,
				message: diagnostic.message,
				filePath: uri.fsPath,
				lineNumber: diagnostic.range.start.line + 1, // VSCode uses 0-based
				columnNumber: diagnostic.range.start.character + 1,
				diagnostics: [diagnostic],
				occurrenceCount: 1,
				firstOccurrence: new Date(),
				lastOccurrence: new Date(),
			}

			// Add suggested fix if pattern matched
			const pattern = this.matchErrorPattern(diagnostic.message)
			if (pattern?.suggestedFix) {
				trackedError.suggestedFix = pattern.suggestedFix
				trackedError.pattern = pattern.pattern.source
			}

			this.errors.set(errorId, trackedError)
			this.outputChannel.appendLine(
				`[ErrorTracking] New ${severity}: ${path.basename(uri.fsPath)}:${trackedError.lineNumber} - ${diagnostic.message}`,
			)

			// Emit event for new error
			this.emit("errorDetected", trackedError)
		}

		// Update summary
		this.updateErrorSummary()
	}

	/**
	 * Track a custom error (from terminal output, build, etc.)
	 */
	trackError(error: Partial<TrackedError> & { message: string }): TrackedError {
		const errorId =
			error.id || this.generateErrorId(error.filePath || "unknown", error.message, error.lineNumber || 0)

		const existingError = this.errors.get(errorId)

		if (existingError) {
			existingError.lastOccurrence = new Date()
			existingError.occurrenceCount++
			this.errors.set(errorId, existingError)
			return existingError
		}

		const component = error.component || this.categorizeError(error.message)
		const severity = error.severity || this.determineSeverniy(error.message)

		const trackedError: TrackedError = {
			id: errorId,
			timestamp: new Date(),
			component,
			severity,
			message: error.message,
			filePath: error.filePath,
			lineNumber: error.lineNumber,
			columnNumber: error.columnNumber,
			stackTrace: error.stackTrace,
			suggestedFix: error.suggestedFix,
			relatedFiles: error.relatedFiles,
			occurrenceCount: 1,
			firstOccurrence: new Date(),
			lastOccurrence: new Date(),
		}

		// Add pattern-based fixes
		const pattern = this.matchErrorPattern(error.message)
		if (pattern && !trackedError.suggestedFix) {
			trackedError.suggestedFix = pattern.suggestedFix
			trackedError.pattern = pattern.pattern.source
		}

		this.errors.set(errorId, trackedError)
		this.outputChannel.appendLine(`[ErrorTracking] Tracked ${severity}: ${error.message}`)
		this.emit("errorDetected", trackedError)
		this.updateErrorSummary()

		return trackedError
	}

	/**
	 * Categorize error based on message and source
	 */
	private categorizeError(message: string, source?: string): ErrorComponent {
		// Check patterns
		for (const pattern of this.errorPatterns) {
			if (pattern.pattern.test(message)) {
				return pattern.component
			}
		}

		// Check source
		if (source) {
			const lowerSource = source.toLowerCase()
			if (lowerSource.includes("typescript") || lowerSource.includes("ts")) {
				return ErrorComponent.TYPESCRIPT
			}
			if (lowerSource.includes("eslint")) {
				return ErrorComponent.LINTER
			}
			if (lowerSource.includes("test") || lowerSource.includes("jest") || lowerSource.includes("mocha")) {
				return ErrorComponent.TEST
			}
		}

		return ErrorComponent.UNKNOWN
	}

	/**
	 * Determine severity from error message
	 */
	private determineSeverniy(message: string): ErrorSeverity {
		const lowerMessage = message.toLowerCase()

		if (
			lowerMessage.includes("critical") ||
			lowerMessage.includes("fatal") ||
			lowerMessage.includes("cannot continue")
		) {
			return ErrorSeverity.CRITICAL
		}

		if (lowerMessage.includes("error")) {
			return ErrorSeverity.ERROR
		}

		if (lowerMessage.includes("warning") || lowerMessage.includes("warn")) {
			return ErrorSeverity.WARNING
		}

		return ErrorSeverity.INFO
	}

	/**
	 * Match error against patterns
	 */
	private matchErrorPattern(message: string): ErrorPattern | undefined {
		return this.errorPatterns.find((pattern) => pattern.pattern.test(message))
	}

	/**
	 * Generate unique error ID
	 */
	private generateErrorId(filePath: string, message: string, line: number): string {
		const hash = `${filePath}:${line}:${message.slice(0, 50)}`
		return Buffer.from(hash).toString("base64").slice(0, 16)
	}

	/**
	 * Clear errors for a specific file
	 */
	private clearErrorsForFile(filePath: string) {
		let cleared = false
		for (const [id, error] of this.errors.entries()) {
			if (error.filePath === filePath) {
				this.errors.delete(id)
				cleared = true
			}
		}

		if (cleared) {
			this.updateErrorSummary()
		}
	}

	/**
	 * Update error summary
	 */
	private updateErrorSummary() {
		const allErrors = Array.from(this.errors.values())

		const errorsByComponent: Record<string, number> = {}
		const errorsBySeverity: Record<string, number> = {}
		const affectedFilesSet = new Set<string>()

		let totalErrors = 0
		let totalWarnings = 0

		for (const error of allErrors) {
			// Count by component
			errorsByComponent[error.component] = (errorsByComponent[error.component] || 0) + 1

			// Count by severity
			errorsBySeverity[error.severity] = (errorsBySeverity[error.severity] || 0) + 1

			// Track affected files
			if (error.filePath) {
				affectedFilesSet.add(error.filePath)
			}

			// Count errors vs warnings
			if (error.severity === ErrorSeverity.ERROR || error.severity === ErrorSeverity.CRITICAL) {
				totalErrors++
			} else if (error.severity === ErrorSeverity.WARNING) {
				totalWarnings++
			}
		}

		// Get recent errors (sorted by timestamp)
		const recentErrors = allErrors
			.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
			.slice(0, this.config.maxRecentErrors || 10)

		// Get critical errors
		const criticalErrors = allErrors
			.filter((e) => e.severity === ErrorSeverity.CRITICAL)
			.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

		// Determine if AI attention is needed
		const needsAIAttention = criticalErrors.length > 0 || totalErrors > 5 || this.hasRepeatingErrors(allErrors)

		// Generate AI context summary
		const aiContextSummary = this.generateAIContextSummary(allErrors, needsAIAttention)

		this.lastErrorSummary = {
			totalErrors,
			totalWarnings,
			errorsByComponent,
			errorsBySeverity,
			recentErrors,
			criticalErrors,
			affectedFiles: Array.from(affectedFilesSet),
			needsAIAttention,
			aiContextSummary,
		}

		// Emit event
		this.emit("summaryUpdated", this.lastErrorSummary)

		// Save to file if enabled
		if (this.config.aiContextGeneration) {
			this.saveErrorContext()
		}
	}

	/**
	 * Check if there are repeating error patterns
	 */
	private hasRepeatingErrors(errors: TrackedError[]): boolean {
		return errors.some((e) => e.occurrenceCount >= 3)
	}

	/**
	 * Generate intelligent AI context summary
	 * This is designed to be concise and informative without overwhelming the AI
	 */
	private generateAIContextSummary(errors: TrackedError[], needsAttention: boolean): string {
		if (errors.length === 0) {
			return "No active errors detected."
		}

		const lines: string[] = []

		// Critical issues first
		const critical = errors.filter((e) => e.severity === ErrorSeverity.CRITICAL)
		if (critical.length > 0) {
			lines.push(`🚨 ${critical.length} CRITICAL ERROR(S) DETECTED`)
			for (const err of critical.slice(0, 2)) {
				// Limit to 2
				lines.push(
					`  - ${err.filePath ? path.basename(err.filePath) + ":" + err.lineNumber : "Unknown"}: ${err.message}`,
				)
				if (err.suggestedFix) {
					lines.push(`    Fix: ${err.suggestedFix}`)
				}
			}
		}

		// High-frequency errors
		const repeating = errors.filter((e) => e.occurrenceCount >= 3).slice(0, 3)
		if (repeating.length > 0) {
			lines.push(`\n⚠️  ${repeating.length} REPEATING ERROR(S):`)
			for (const err of repeating) {
				lines.push(`  - (${err.occurrenceCount}x) ${err.component}: ${err.message.slice(0, 80)}...`)
			}
		}

		// Component breakdown (only if significant)
		const componentCounts = errors.reduce(
			(acc, e) => {
				acc[e.component] = (acc[e.component] || 0) + 1
				return acc
			},
			{} as Record<string, number>,
		)

		if (Object.keys(componentCounts).length > 1) {
			lines.push(
				`\n📊 Errors by component: ${Object.entries(componentCounts)
					.map(([k, v]) => `${k}(${v})`)
					.join(", ")}`,
			)
		}

		return lines.join("\n")
	}

	/**
	 * Get current error summary
	 */
	getErrorSummary(): ErrorSummary | undefined {
		return this.lastErrorSummary
	}

	/**
	 * Get errors for a specific file
	 */
	getErrorsForFile(filePath: string): TrackedError[] {
		return Array.from(this.errors.values()).filter((e) => e.filePath === filePath)
	}

	/**
	 * Get all tracked errors
	 */
	getAllErrors(): TrackedError[] {
		return Array.from(this.errors.values())
	}

	/**
	 * Clear all tracked errors
	 */
	clearAllErrors() {
		this.errors.clear()
		this.updateErrorSummary()
		this.outputChannel.appendLine("[ErrorTracking] All errors cleared")
	}

	/**
	 * Create error tracking folder structure
	 */
	private async createErrorFolder() {
		if (!this.workspacePath) {
			return
		}

		const errorFolder = path.join(this.workspacePath, ".kilo-errors")

		try {
			await fs.mkdir(errorFolder, { recursive: true })
			await fs.mkdir(path.join(errorFolder, "by_component"), { recursive: true })
			await fs.mkdir(path.join(errorFolder, "snapshots"), { recursive: true })

			// Create README
			const readme = `# Kilo Code Error Tracking

This folder contains automatically tracked errors and diagnostics.

## Structure

- \`error-context.md\` - AI-readable error summary (auto-updated)
- \`error-summary.json\` - Machine-readable error statistics
- \`by_component/\` - Errors organized by component
- \`snapshots/\` - Critical error snapshots

## Note

These files are automatically generated and updated by Kilo Code.
Do not edit manually.
`
			await fs.writeFile(path.join(errorFolder, "README.md"), readme, "utf-8")

			this.outputChannel.appendLine(`[ErrorTracking] Created error folder: ${errorFolder}`)
		} catch (error) {
			this.outputChannel.appendLine(
				`[ErrorTracking] Failed to create error folder: ${error instanceof Error ? error.message : String(error)}`,
			)
		}
	}

	/**
	 * Save error context to file for AI access
	 */
	private async saveErrorContext() {
		if (!this.workspacePath || !this.lastErrorSummary) {
			return
		}

		const errorFolder = path.join(this.workspacePath, ".kilo-errors")

		try {
			// Ensure folder exists
			await fs.mkdir(errorFolder, { recursive: true })

			// Save AI-readable context
			const contextFile = path.join(errorFolder, "error-context.md")
			const contextContent = this.generateAIContextFile(this.lastErrorSummary)
			await fs.writeFile(contextFile, contextContent, "utf-8")

			// Save machine-readable summary
			const summaryFile = path.join(errorFolder, "error-summary.json")
			await fs.writeFile(
				summaryFile,
				JSON.stringify(
					{
						...this.lastErrorSummary,
						recentErrors: this.lastErrorSummary.recentErrors.map((e) => ({
							...e,
							diagnostics: undefined, // Remove diagnostics object for JSON serialization
						})),
						criticalErrors: this.lastErrorSummary.criticalErrors.map((e) => ({
							...e,
							diagnostics: undefined,
						})),
						generatedAt: new Date().toISOString(),
					},
					null,
					2,
				),
				"utf-8",
			)
		} catch (error) {
			this.outputChannel.appendLine(
				`[ErrorTracking] Failed to save error context: ${error instanceof Error ? error.message : String(error)}`,
			)
		}
	}

	/**
	 * Generate AI-readable error context file
	 */
	private generateAIContextFile(summary: ErrorSummary): string {
		const lines: string[] = []

		lines.push("# Kilo Code Error Context")
		lines.push("")
		lines.push("*Auto-generated error context for AI debugging*")
		lines.push("")
		lines.push(`**Generated:** ${new Date().toISOString()}`)
		lines.push("")

		// Summary stats
		lines.push("## Summary")
		lines.push("")
		lines.push(`- **Total Errors:** ${summary.totalErrors}`)
		lines.push(`- **Total Warnings:** ${summary.totalWarnings}`)
		lines.push(`- **Affected Files:** ${summary.affectedFiles.length}`)
		lines.push(`- **Needs Attention:** ${summary.needsAIAttention ? "YES ⚠️" : "No"}`)
		lines.push("")

		// AI Context Summary
		if (summary.aiContextSummary) {
			lines.push("## Quick Context")
			lines.push("")
			lines.push(summary.aiContextSummary)
			lines.push("")
		}

		// Critical errors
		if (summary.criticalErrors.length > 0) {
			lines.push("## Critical Errors")
			lines.push("")
			for (const err of summary.criticalErrors) {
				lines.push(`### ${err.component.toUpperCase()}: ${err.message}`)
				if (err.filePath) {
					lines.push(`**File:** \`${err.filePath}:${err.lineNumber}\``)
				}
				if (err.suggestedFix) {
					lines.push(`**Suggested Fix:** ${err.suggestedFix}`)
				}
				lines.push("")
			}
		}

		// Recent errors (limited to avoid context bloat)
		if (summary.recentErrors.length > 0) {
			lines.push("## Recent Errors (Last 5)")
			lines.push("")
			for (const err of summary.recentErrors.slice(0, 5)) {
				lines.push(`- **${err.severity.toUpperCase()}** [${err.component}]: ${err.message}`)
				if (err.filePath) {
					lines.push(`  File: \`${path.relative(this.workspacePath!, err.filePath)}:${err.lineNumber}\``)
				}
				if (err.occurrenceCount > 1) {
					lines.push(`  *(Occurred ${err.occurrenceCount} times)*`)
				}
			}
			lines.push("")
		}

		// Component breakdown
		lines.push("## Errors by Component")
		lines.push("")
		for (const [component, count] of Object.entries(summary.errorsByComponent)) {
			lines.push(`- **${component}**: ${count}`)
		}
		lines.push("")

		// Debugging hints
		lines.push("## Debugging Hints")
		lines.push("")
		lines.push("1. Check the files listed above for specific error locations")
		lines.push("2. Review suggested fixes for quick resolution")
		lines.push("3. Focus on critical and repeating errors first")
		lines.push("4. Check related files if errors seem interconnected")
		lines.push("")

		return lines.join("\n")
	}

	/**
	 * Stop monitoring
	 */
	stopMonitoring() {
		if (this.diagnosticsSubscription) {
			this.diagnosticsSubscription.dispose()
			this.diagnosticsSubscription = undefined
		}
		this.outputChannel.appendLine("[ErrorTracking] Stopped monitoring")
	}

	/**
	 * Cleanup resources
	 */
	dispose() {
		this.stopMonitoring()
		this.clearAllErrors()
		this.removeAllListeners()
		ErrorTrackingService.instance = undefined
	}
}
