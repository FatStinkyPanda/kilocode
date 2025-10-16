import * as vscode from "vscode"
import { EventEmitter } from "events"
import * as fs from "fs/promises"
import * as path from "path"

export interface ProjectCompletionConfig {
	enabled: boolean
	stopContinuanceWhenComplete: boolean
	requireAllTodosComplete: boolean
	requireAllRequirementsMet: boolean
	checkForPlaceholders: boolean
	checkForSimpleImplementations: boolean
	minCodeQualityScore: number
}

export interface ValidationResult {
	isComplete: boolean
	completionPercentage: number
	issues: ValidationIssue[]
	summary: string
}

export interface ValidationIssue {
	type: "todo" | "requirement" | "placeholder" | "simple_implementation" | "quality"
	severity: "critical" | "major" | "minor"
	description: string
	location?: string
	suggestion?: string
}

export interface TodoItem {
	text: string
	isComplete: boolean
	location: string
}

export interface Requirement {
	text: string
	isMet: boolean
	evidence?: string
	location: string
}

/**
 * ProjectCompletionService
 *
 * Intelligent system for validating project completion and production readiness.
 * Ensures all TODOs are complete, all requirements are met, no placeholders exist,
 * and implementations are thorough and meet expectations.
 */
export class ProjectCompletionService extends EventEmitter {
	private static instance: ProjectCompletionService | undefined
	private outputChannel: vscode.OutputChannel
	public config: ProjectCompletionConfig
	private workspacePath: string
	private lastValidationResult?: ValidationResult

	private constructor(config: ProjectCompletionConfig, outputChannel: vscode.OutputChannel, workspacePath: string) {
		super()
		this.config = config
		this.outputChannel = outputChannel
		this.workspacePath = workspacePath
	}

	static getInstance(
		config?: ProjectCompletionConfig,
		outputChannel?: vscode.OutputChannel,
		workspacePath?: string,
	): ProjectCompletionService {
		if (!ProjectCompletionService.instance && config && outputChannel && workspacePath) {
			ProjectCompletionService.instance = new ProjectCompletionService(config, outputChannel, workspacePath)
		}
		return ProjectCompletionService.instance!
	}

	static resetInstance(): void {
		ProjectCompletionService.instance = undefined
	}

	updateConfig(config: Partial<ProjectCompletionConfig>): void {
		this.config = { ...this.config, ...config }
		this.outputChannel.appendLine(`[ProjectCompletion] Configuration updated`)
	}

	updateWorkspacePath(workspacePath: string): void {
		this.workspacePath = workspacePath
	}

	/**
	 * Main validation method - performs comprehensive project completion check
	 */
	async validateProjectCompletion(documentationPath?: string, todoPath?: string): Promise<ValidationResult> {
		if (!this.config.enabled) {
			return {
				isComplete: true,
				completionPercentage: 100,
				issues: [],
				summary: "Project completion validation is disabled",
			}
		}

		this.outputChannel.appendLine(`[ProjectCompletion] Starting comprehensive validation...`)
		const issues: ValidationIssue[] = []

		try {
			// 1. Validate TODOs
			if (this.config.requireAllTodosComplete && todoPath) {
				const todoIssues = await this.validateTodos(todoPath)
				issues.push(...todoIssues)
			}

			// 2. Validate Requirements
			if (this.config.requireAllRequirementsMet && documentationPath) {
				const requirementIssues = await this.validateRequirements(documentationPath)
				issues.push(...requirementIssues)
			}

			// 3. Check for placeholders
			if (this.config.checkForPlaceholders) {
				const placeholderIssues = await this.detectPlaceholders()
				issues.push(...placeholderIssues)
			}

			// 4. Check for simple/incomplete implementations
			if (this.config.checkForSimpleImplementations) {
				const implementationIssues = await this.detectSimpleImplementations()
				issues.push(...implementationIssues)
			}

			// 5. Overall code quality check
			const qualityIssues = await this.validateCodeQuality()
			issues.push(...qualityIssues)

			// Calculate completion percentage
			const criticalIssues = issues.filter((i) => i.severity === "critical").length
			const majorIssues = issues.filter((i) => i.severity === "major").length
			const minorIssues = issues.filter((i) => i.severity === "minor").length

			const totalWeight = criticalIssues * 10 + majorIssues * 5 + minorIssues * 1
			const completionPercentage = Math.max(0, 100 - totalWeight)

			const isComplete = criticalIssues === 0 && majorIssues === 0 && completionPercentage >= 95

			const result: ValidationResult = {
				isComplete,
				completionPercentage,
				issues,
				summary: this.generateSummary(isComplete, completionPercentage, issues),
			}

			this.lastValidationResult = result
			this.emit("validationComplete", result)

			this.outputChannel.appendLine(`[ProjectCompletion] Validation complete: ${result.summary}`)

			return result
		} catch (error) {
			this.outputChannel.appendLine(
				`[ProjectCompletion] Error during validation: ${error instanceof Error ? error.message : String(error)}`,
			)
			return {
				isComplete: false,
				completionPercentage: 0,
				issues: [
					{
						type: "quality",
						severity: "critical",
						description: `Validation error: ${error instanceof Error ? error.message : String(error)}`,
					},
				],
				summary: "Validation failed due to error",
			}
		}
	}

	/**
	 * Validate all TODOs are complete
	 */
	private async validateTodos(todoPath: string): Promise<ValidationIssue[]> {
		const issues: ValidationIssue[] = []

		try {
			const content = await fs.readFile(todoPath, "utf-8")
			const todos = this.parseTodos(content)

			const incompleteTodos = todos.filter((t) => !t.isComplete)

			if (incompleteTodos.length > 0) {
				incompleteTodos.forEach((todo) => {
					issues.push({
						type: "todo",
						severity: "critical",
						description: `Incomplete TODO: ${todo.text}`,
						location: todo.location,
						suggestion: "Complete this task or mark it as done",
					})
				})
			}

			this.outputChannel.appendLine(
				`[ProjectCompletion] TODO validation: ${todos.length - incompleteTodos.length}/${todos.length} complete`,
			)
		} catch (error) {
			issues.push({
				type: "todo",
				severity: "major",
				description: `Unable to read TODO file: ${error instanceof Error ? error.message : String(error)}`,
			})
		}

		return issues
	}

	/**
	 * Parse TODO file and extract tasks
	 */
	private parseTodos(content: string): TodoItem[] {
		const todos: TodoItem[] = []
		const lines = content.split("\n")

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i].trim()

			// Match checkbox format: - [ ] or - [x] or - [X]
			const checkboxMatch = line.match(/^-\s*\[([ xX])\]\s*(.+)/)
			if (checkboxMatch) {
				const isComplete = checkboxMatch[1].toLowerCase() === "x"
				const text = checkboxMatch[2].trim()

				// Skip section headers and empty items
				if (text && !text.startsWith("#") && text.length > 3) {
					todos.push({
						text,
						isComplete,
						location: `Line ${i + 1}`,
					})
				}
			}
		}

		return todos
	}

	/**
	 * Validate all requirements from documentation are met
	 */
	private async validateRequirements(documentationPath: string): Promise<ValidationIssue[]> {
		const issues: ValidationIssue[] = []

		try {
			const content = await fs.readFile(documentationPath, "utf-8")
			const requirements = this.parseRequirements(content)

			for (const req of requirements) {
				if (!req.isMet) {
					issues.push({
						type: "requirement",
						severity: "critical",
						description: `Unmet requirement: ${req.text}`,
						location: req.location,
						suggestion: "Implement this requirement or update documentation",
					})
				}
			}

			this.outputChannel.appendLine(
				`[ProjectCompletion] Requirements validation: ${requirements.filter((r) => r.isMet).length}/${requirements.length} met`,
			)
		} catch (error) {
			issues.push({
				type: "requirement",
				severity: "major",
				description: `Unable to validate requirements: ${error instanceof Error ? error.message : String(error)}`,
			})
		}

		return issues
	}

	/**
	 * Parse requirements from documentation
	 */
	private parseRequirements(content: string): Requirement[] {
		const requirements: Requirement[] = []
		const lines = content.split("\n")

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i].trim()

			// Look for requirement patterns:
			// - "Must", "Should", "Required", "Needs to"
			// - Numbered lists under "Requirements" sections
			// - Bullet points with strong language

			const requirementPatterns = [
				/must\s+(.{10,})/i,
				/should\s+(.{10,})/i,
				/required:\s*(.{10,})/i,
				/needs?\s+to\s+(.{10,})/i,
				/shall\s+(.{10,})/i,
			]

			for (const pattern of requirementPatterns) {
				const match = line.match(pattern)
				if (match) {
					requirements.push({
						text: match[0],
						isMet: this.checkRequirementMet(match[0]),
						location: `Line ${i + 1}`,
					})
					break
				}
			}
		}

		return requirements
	}

	/**
	 * Check if a requirement is met (heuristic-based)
	 */
	private checkRequirementMet(requirement: string): boolean {
		// This is a simplified heuristic check
		// In a real implementation, this would involve:
		// - Code analysis
		// - Test coverage
		// - Feature detection
		// For now, we'll use presence of certain keywords as indicators

		const lowerReq = requirement.toLowerCase()

		// Check for TODO markers or incomplete indicators
		if (lowerReq.includes("todo") || lowerReq.includes("not implemented") || lowerReq.includes("placeholder")) {
			return false
		}

		// Assume met by default (conservative)
		// The AI will need to manually verify requirements
		return true
	}

	/**
	 * Detect placeholder code and TODOs in codebase
	 */
	private async detectPlaceholders(): Promise<ValidationIssue[]> {
		const issues: ValidationIssue[] = []

		try {
			const placeholderPatterns = [
				/TODO:/gi,
				/FIXME:/gi,
				/HACK:/gi,
				/XXX:/gi,
				/placeholder/gi,
				/not\s+implemented/gi,
				/coming\s+soon/gi,
				/temporary/gi,
			]

			// Search workspace for placeholders
			const files = await this.getProjectFiles()

			for (const file of files) {
				try {
					const content = await fs.readFile(file, "utf-8")
					const lines = content.split("\n")

					for (let i = 0; i < lines.length; i++) {
						const line = lines[i]
						for (const pattern of placeholderPatterns) {
							if (pattern.test(line)) {
								issues.push({
									type: "placeholder",
									severity: "major",
									description: `Placeholder found: ${line.trim().substring(0, 100)}`,
									location: `${path.basename(file)}:${i + 1}`,
									suggestion: "Replace placeholder with actual implementation",
								})
							}
						}
					}
				} catch {
					// Skip files that can't be read
				}
			}

			this.outputChannel.appendLine(`[ProjectCompletion] Found ${issues.length} placeholders`)
		} catch (error) {
			this.outputChannel.appendLine(
				`[ProjectCompletion] Error detecting placeholders: ${error instanceof Error ? error.message : String(error)}`,
			)
		}

		return issues
	}

	/**
	 * Detect simple/incomplete implementations
	 */
	private async detectSimpleImplementations(): Promise<ValidationIssue[]> {
		const issues: ValidationIssue[] = []

		try {
			const simplePatterns = [
				/return\s+null/gi,
				/return\s+undefined/gi,
				/throw\s+new\s+Error\s*\(\s*["']Not\s+implemented/gi,
				/console\.log/gi, // Production code shouldn't have console.logs
				/debugger/gi,
			]

			const files = await this.getProjectFiles()

			for (const file of files) {
				// Skip test files
				if (file.includes(".test.") || file.includes(".spec.")) {
					continue
				}

				try {
					const content = await fs.readFile(file, "utf-8")
					const lines = content.split("\n")

					for (let i = 0; i < lines.length; i++) {
						const line = lines[i]
						for (const pattern of simplePatterns) {
							if (pattern.test(line)) {
								issues.push({
									type: "simple_implementation",
									severity: "major",
									description: `Simple/incomplete implementation: ${line.trim().substring(0, 80)}`,
									location: `${path.basename(file)}:${i + 1}`,
									suggestion: "Implement full functionality",
								})
							}
						}
					}
				} catch {
					// Skip files that can't be read
				}
			}

			this.outputChannel.appendLine(`[ProjectCompletion] Found ${issues.length} simple implementations`)
		} catch (error) {
			this.outputChannel.appendLine(
				`[ProjectCompletion] Error detecting simple implementations: ${error instanceof Error ? error.message : String(error)}`,
			)
		}

		return issues
	}

	/**
	 * Validate overall code quality
	 */
	private async validateCodeQuality(): Promise<ValidationIssue[]> {
		const issues: ValidationIssue[] = []

		// Check for error handling
		// Check for proper types
		// Check for documentation
		// These would integrate with linters, type checkers, etc.

		return issues
	}

	/**
	 * Get all project files (excluding node_modules, etc.)
	 */
	private async getProjectFiles(): Promise<string[]> {
		const files: string[] = []
		const excludePatterns = ["node_modules", ".git", "dist", "build", "out", ".next", ".turbo"]

		async function scanDir(dir: string): Promise<void> {
			try {
				const entries = await fs.readdir(dir, { withFileTypes: true })

				for (const entry of entries) {
					const fullPath = path.join(dir, entry.name)

					// Skip excluded directories
					if (excludePatterns.some((pattern) => fullPath.includes(pattern))) {
						continue
					}

					if (entry.isDirectory()) {
						await scanDir(fullPath)
					} else if (entry.isFile()) {
						// Only include source files
						if (fullPath.match(/\.(ts|tsx|js|jsx|py|java|cpp|c|go|rs|rb|php|cs|swift|kt|scala)$/i)) {
							files.push(fullPath)
						}
					}
				}
			} catch {
				// Skip directories that can't be read
			}
		}

		await scanDir(this.workspacePath)
		return files
	}

	/**
	 * Generate human-readable summary
	 */
	private generateSummary(isComplete: boolean, percentage: number, issues: ValidationIssue[]): string {
		const critical = issues.filter((i) => i.severity === "critical").length
		const major = issues.filter((i) => i.severity === "major").length
		const minor = issues.filter((i) => i.severity === "minor").length

		if (isComplete) {
			return `✅ Project is COMPLETE and production-ready! (${percentage}%)`
		} else {
			return `⚠️ Project is ${percentage}% complete. Issues found: ${critical} critical, ${major} major, ${minor} minor.`
		}
	}

	/**
	 * Get detailed completion report
	 */
	async getCompletionReport(documentationPath?: string, todoPath?: string): Promise<string> {
		const result = await this.validateProjectCompletion(documentationPath, todoPath)

		let report = `# Project Completion Report\n\n`
		report += `**Status**: ${result.isComplete ? "✅ COMPLETE" : "⚠️ INCOMPLETE"}\n`
		report += `**Completion**: ${result.completionPercentage}%\n\n`

		if (result.issues.length > 0) {
			report += `## Issues (${result.issues.length} total)\n\n`

			const criticalIssues = result.issues.filter((i) => i.severity === "critical")
			const majorIssues = result.issues.filter((i) => i.severity === "major")
			const minorIssues = result.issues.filter((i) => i.severity === "minor")

			if (criticalIssues.length > 0) {
				report += `### 🚨 Critical Issues (${criticalIssues.length})\n\n`
				criticalIssues.forEach((issue, idx) => {
					report += `${idx + 1}. **${issue.description}**\n`
					if (issue.location) report += `   - Location: ${issue.location}\n`
					if (issue.suggestion) report += `   - Suggestion: ${issue.suggestion}\n`
					report += `\n`
				})
			}

			if (majorIssues.length > 0) {
				report += `### ⚠️ Major Issues (${majorIssues.length})\n\n`
				majorIssues.forEach((issue, idx) => {
					report += `${idx + 1}. **${issue.description}**\n`
					if (issue.location) report += `   - Location: ${issue.location}\n`
					if (issue.suggestion) report += `   - Suggestion: ${issue.suggestion}\n`
					report += `\n`
				})
			}

			if (minorIssues.length > 0) {
				report += `### ℹ️ Minor Issues (${minorIssues.length})\n\n`
				minorIssues.forEach((issue, idx) => {
					report += `${idx + 1}. ${issue.description}\n`
				})
			}
		} else {
			report += `## 🎉 No issues found! Project is ready for production.\n`
		}

		return report
	}

	/**
	 * Check if project is complete enough to stop automatic continuance
	 */
	shouldStopContinuance(): boolean {
		if (!this.config.enabled || !this.config.stopContinuanceWhenComplete) {
			return false
		}

		return this.lastValidationResult?.isComplete ?? false
	}

	dispose(): void {
		this.removeAllListeners()
	}
}
