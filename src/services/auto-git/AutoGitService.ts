import * as vscode from "vscode"
import * as path from "path"
import EventEmitter from "events"
import { exec } from "child_process"
import { promisify } from "util"

const execAsync = promisify(exec)

export interface AutoGitConfig {
	enabled: boolean
	repositoryUrl: string
	userEmail: string
	commitOnTaskComplete: boolean
	createBranchOnConflict: boolean
}

export interface WorkspaceGitConfig {
	repositoryUrl?: string
	userEmail?: string
	isSetup?: boolean
}

export interface AutoGitEvents {
	setupRequired: (workspacePath: string) => void
	commitSuccess: (commitHash: string, branch: string) => void
	commitFailed: (error: string) => void
	pushSuccess: (branch: string) => void
	pushFailed: (error: string) => void
	branchCreated: (branchName: string) => void
}

/**
 * Service that automatically commits and pushes changes when tasks complete.
 * Handles git operations including conflict detection and branch creation.
 */
export class AutoGitService extends EventEmitter {
	private static instance: AutoGitService | undefined
	private config: AutoGitConfig
	private outputChannel: vscode.OutputChannel
	private workspacePath: string | undefined
	private context: vscode.ExtensionContext
	private workspaceConfigKey = "autoGitWorkspaceConfig"

	private constructor(
		config: AutoGitConfig,
		outputChannel: vscode.OutputChannel,
		context: vscode.ExtensionContext,
		workspacePath?: string,
	) {
		super()
		this.config = config
		this.outputChannel = outputChannel
		this.context = context
		this.workspacePath = workspacePath
		this.outputChannel.appendLine("[AutoGit] Service initialized")
	}

	/**
	 * Creates or retrieves the singleton instance of AutoGitService
	 */
	static getInstance(
		config?: AutoGitConfig,
		outputChannel?: vscode.OutputChannel,
		context?: vscode.ExtensionContext,
		workspacePath?: string,
	): AutoGitService {
		if (!AutoGitService.instance && config && outputChannel && context) {
			AutoGitService.instance = new AutoGitService(config, outputChannel, context, workspacePath)
		}
		return AutoGitService.instance!
	}

	/**
	 * Updates the configuration
	 */
	updateConfig(config: Partial<AutoGitConfig>) {
		this.config = { ...this.config, ...config }
		this.outputChannel.appendLine(`[AutoGit] Config updated: ${JSON.stringify(this.config)}`)
	}

	/**
	 * Updates the workspace path
	 */
	updateWorkspacePath(workspacePath: string) {
		this.workspacePath = workspacePath
	}

	/**
	 * Gets the workspace-specific git configuration
	 */
	private async getWorkspaceConfig(): Promise<WorkspaceGitConfig> {
		if (!this.workspacePath) {
			return {}
		}
		const configKey = `${this.workspaceConfigKey}_${this.workspacePath}`
		return (await this.context.workspaceState.get<WorkspaceGitConfig>(configKey)) || {}
	}

	/**
	 * Saves the workspace-specific git configuration
	 */
	private async saveWorkspaceConfig(config: WorkspaceGitConfig): Promise<void> {
		if (!this.workspacePath) {
			return
		}
		const configKey = `${this.workspaceConfigKey}_${this.workspacePath}`
		await this.context.workspaceState.update(configKey, config)
		this.outputChannel.appendLine(`[AutoGit] Workspace config saved for ${this.workspacePath}`)
	}

	/**
	 * Gets the effective repository URL (workspace config > global config)
	 */
	private async getRepositoryUrl(): Promise<string | undefined> {
		const workspaceConfig = await this.getWorkspaceConfig()
		return workspaceConfig.repositoryUrl || this.config.repositoryUrl || undefined
	}

	/**
	 * Gets the effective user email (workspace config > global config)
	 */
	private async getUserEmail(): Promise<string | undefined> {
		const workspaceConfig = await this.getWorkspaceConfig()
		return workspaceConfig.userEmail || this.config.userEmail || undefined
	}

	/**
	 * Updates workspace-specific git configuration
	 */
	async updateWorkspaceGitConfig(repositoryUrl: string, userEmail: string): Promise<void> {
		const workspaceConfig = await this.getWorkspaceConfig()
		workspaceConfig.repositoryUrl = repositoryUrl
		workspaceConfig.userEmail = userEmail
		workspaceConfig.isSetup = true
		await this.saveWorkspaceConfig(workspaceConfig)
		this.outputChannel.appendLine(`[AutoGit] Workspace git config updated`)
	}

	/**
	 * Checks if git is initialized in the workspace
	 */
	private async isGitInitialized(): Promise<boolean> {
		if (!this.workspacePath) {
			return false
		}
		try {
			await execAsync("git status", { cwd: this.workspacePath })
			return true
		} catch {
			return false
		}
	}

	/**
	 * Initializes git repository if not already initialized
	 */
	private async initializeGitRepo(): Promise<void> {
		if (!this.workspacePath) {
			throw new Error("Workspace path is not set")
		}
		this.outputChannel.appendLine(`[AutoGit] Initializing git repository in ${this.workspacePath}`)
		await execAsync("git init", { cwd: this.workspacePath })
		this.outputChannel.appendLine(`[AutoGit] Git repository initialized`)
	}

	/**
	 * Checks if remote origin exists
	 */
	private async hasRemoteOrigin(): Promise<boolean> {
		if (!this.workspacePath) {
			return false
		}
		try {
			const { stdout } = await execAsync("git remote -v", { cwd: this.workspacePath })
			return stdout.includes("origin")
		} catch {
			return false
		}
	}

	/**
	 * Adds or updates remote origin
	 */
	private async setupRemoteOrigin(repositoryUrl: string): Promise<void> {
		if (!this.workspacePath) {
			throw new Error("Workspace path is not set")
		}
		const hasRemote = await this.hasRemoteOrigin()
		if (hasRemote) {
			this.outputChannel.appendLine(`[AutoGit] Updating remote origin to ${repositoryUrl}`)
			await execAsync(`git remote set-url origin "${repositoryUrl}"`, { cwd: this.workspacePath })
		} else {
			this.outputChannel.appendLine(`[AutoGit] Adding remote origin ${repositoryUrl}`)
			await execAsync(`git remote add origin "${repositoryUrl}"`, { cwd: this.workspacePath })
		}
	}

	/**
	 * Configures git user email
	 */
	private async setupUserEmail(userEmail: string): Promise<void> {
		if (!this.workspacePath) {
			throw new Error("Workspace path is not set")
		}
		this.outputChannel.appendLine(`[AutoGit] Configuring git user email: ${userEmail}`)
		await execAsync(`git config user.email "${userEmail}"`, { cwd: this.workspacePath })
	}

	/**
	 * Validates and sets up git repository with provided configuration
	 */
	async setupGitRepository(repositoryUrl: string, userEmail: string): Promise<boolean> {
		if (!this.workspacePath) {
			this.outputChannel.appendLine(`[AutoGit] Cannot setup: workspace path is not set`)
			return false
		}

		try {
			// Initialize git if needed
			const isInitialized = await this.isGitInitialized()
			if (!isInitialized) {
				await this.initializeGitRepo()
			}

			// Setup remote origin
			await this.setupRemoteOrigin(repositoryUrl)

			// Setup user email
			await this.setupUserEmail(userEmail)

			// Validate by fetching from remote
			this.outputChannel.appendLine(`[AutoGit] Validating remote repository...`)
			await execAsync("git fetch origin", { cwd: this.workspacePath, timeout: 30000 })

			// Save workspace config
			await this.updateWorkspaceGitConfig(repositoryUrl, userEmail)

			this.outputChannel.appendLine(`[AutoGit] Git repository setup successful`)
			return true
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error)
			this.outputChannel.appendLine(`[AutoGit] Setup failed: ${errorMessage}`)
			throw new Error(`Failed to setup git repository: ${errorMessage}`)
		}
	}

	/**
	 * Checks if the repository is ready for auto-commit
	 */
	async isRepositoryReady(): Promise<boolean> {
		if (!this.config.enabled || !this.workspacePath) {
			return false
		}

		const workspaceConfig = await this.getWorkspaceConfig()
		if (!workspaceConfig.isSetup) {
			this.outputChannel.appendLine(`[AutoGit] Repository not setup for workspace ${this.workspacePath}`)
			return false
		}

		const repositoryUrl = await this.getRepositoryUrl()
		const userEmail = await this.getUserEmail()

		if (!repositoryUrl || !userEmail) {
			this.outputChannel.appendLine(`[AutoGit] Missing repository URL or user email`)
			return false
		}

		return true
	}

	/**
	 * Checks if there are uncommitted changes
	 */
	private async hasUncommittedChanges(): Promise<boolean> {
		if (!this.workspacePath) {
			return false
		}
		try {
			const { stdout } = await execAsync("git status --porcelain", { cwd: this.workspacePath })
			return stdout.trim().length > 0
		} catch {
			return false
		}
	}

	/**
	 * Gets the current branch name
	 */
	private async getCurrentBranch(): Promise<string> {
		if (!this.workspacePath) {
			throw new Error("Workspace path is not set")
		}
		const { stdout } = await execAsync("git branch --show-current", { cwd: this.workspacePath })
		return stdout.trim()
	}

	/**
	 * Checks if pushing would cause conflicts
	 */
	private async wouldPushConflict(): Promise<boolean> {
		if (!this.workspacePath) {
			return false
		}
		try {
			// Fetch latest from remote
			await execAsync("git fetch origin", { cwd: this.workspacePath, timeout: 15000 })

			const currentBranch = await this.getCurrentBranch()

			// Check if remote branch exists
			try {
				await execAsync(`git rev-parse origin/${currentBranch}`, { cwd: this.workspacePath })
			} catch {
				// Remote branch doesn't exist, no conflict possible
				return false
			}

			// Check if we're behind remote
			const { stdout: behindCount } = await execAsync(`git rev-list --count HEAD..origin/${currentBranch}`, {
				cwd: this.workspacePath,
			})

			return parseInt(behindCount.trim()) > 0
		} catch (error) {
			this.outputChannel.appendLine(
				`[AutoGit] Error checking for conflicts: ${error instanceof Error ? error.message : String(error)}`,
			)
			return false
		}
	}

	/**
	 * Creates a new branch with a timestamp-based name
	 */
	private async createConflictBranch(): Promise<string> {
		if (!this.workspacePath) {
			throw new Error("Workspace path is not set")
		}

		const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5)
		const branchName = `kilocode-auto-${timestamp}`

		this.outputChannel.appendLine(`[AutoGit] Creating conflict resolution branch: ${branchName}`)
		await execAsync(`git checkout -b "${branchName}"`, { cwd: this.workspacePath })

		this.emit("branchCreated", branchName)
		return branchName
	}

	/**
	 * Commits all changes with a generated commit message
	 */
	private async commitChanges(): Promise<string> {
		if (!this.workspacePath) {
			throw new Error("Workspace path is not set")
		}

		// Stage all changes
		this.outputChannel.appendLine(`[AutoGit] Staging all changes...`)
		await execAsync("git add .", { cwd: this.workspacePath })

		// Generate commit message
		const timestamp = new Date().toISOString()
		const commitMessage = `Auto-commit by Kilo Code - ${timestamp}

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>`

		// Create commit
		this.outputChannel.appendLine(`[AutoGit] Creating commit...`)
		const { stdout } = await execAsync(`git commit -m "${commitMessage.replace(/"/g, '\\"')}"`, {
			cwd: this.workspacePath,
		})

		// Get commit hash
		const { stdout: commitHash } = await execAsync("git rev-parse HEAD", { cwd: this.workspacePath })

		this.outputChannel.appendLine(`[AutoGit] Commit created: ${commitHash.trim()}`)
		return commitHash.trim()
	}

	/**
	 * Pushes changes to remote repository
	 */
	private async pushChanges(branch: string): Promise<void> {
		if (!this.workspacePath) {
			throw new Error("Workspace path is not set")
		}

		this.outputChannel.appendLine(`[AutoGit] Pushing to origin/${branch}...`)
		await execAsync(`git push -u origin "${branch}"`, { cwd: this.workspacePath, timeout: 60000 })
		this.outputChannel.appendLine(`[AutoGit] Push successful`)
	}

	/**
	 * Main method to handle task completion and perform auto-commit/push
	 */
	async handleTaskComplete(): Promise<void> {
		if (!this.config.enabled || !this.config.commitOnTaskComplete) {
			this.outputChannel.appendLine(`[AutoGit] Auto-commit disabled, skipping`)
			return
		}

		if (!this.workspacePath) {
			this.outputChannel.appendLine(`[AutoGit] No workspace path set, skipping`)
			return
		}

		try {
			// Check if repository is ready
			const isReady = await this.isRepositoryReady()
			if (!isReady) {
				this.outputChannel.appendLine(`[AutoGit] Repository not ready, emitting setup required`)
				this.emit("setupRequired", this.workspacePath)
				return
			}

			// Check if there are changes to commit
			const hasChanges = await this.hasUncommittedChanges()
			if (!hasChanges) {
				this.outputChannel.appendLine(`[AutoGit] No changes to commit, skipping`)
				return
			}

			// Check for potential conflicts
			const wouldConflict = await this.wouldPushConflict()
			let currentBranch = await this.getCurrentBranch()

			if (wouldConflict && this.config.createBranchOnConflict) {
				this.outputChannel.appendLine(`[AutoGit] Conflicts detected, creating new branch`)
				currentBranch = await this.createConflictBranch()
			}

			// Commit changes
			const commitHash = await this.commitChanges()
			this.emit("commitSuccess", commitHash, currentBranch)

			// Push changes
			await this.pushChanges(currentBranch)
			this.emit("pushSuccess", currentBranch)

			// Show success notification
			if (wouldConflict && this.config.createBranchOnConflict) {
				vscode.window.showInformationMessage(
					`Auto-commit successful! Changes pushed to new branch: ${currentBranch}`,
					"OK",
				)
			} else {
				vscode.window.showInformationMessage(`Auto-commit successful! Changes pushed to ${currentBranch}`, "OK")
			}
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error)
			this.outputChannel.appendLine(`[AutoGit] Error during auto-commit: ${errorMessage}`)
			this.emit("commitFailed", errorMessage)
			vscode.window.showErrorMessage(`Auto-commit failed: ${errorMessage}`)
		}
	}

	/**
	 * Requests setup if configuration is missing
	 */
	async requestSetupIfNeeded(): Promise<{ repositoryUrl?: string; userEmail?: string; needsSetup: boolean }> {
		const repositoryUrl = await this.getRepositoryUrl()
		const userEmail = await this.getUserEmail()
		const workspaceConfig = await this.getWorkspaceConfig()

		const needsSetup = !workspaceConfig.isSetup || !repositoryUrl || !userEmail

		return {
			repositoryUrl: repositoryUrl || undefined,
			userEmail: userEmail || undefined,
			needsSetup,
		}
	}

	/**
	 * Cleans up resources
	 */
	dispose() {
		this.removeAllListeners()
		AutoGitService.instance = undefined
	}
}
