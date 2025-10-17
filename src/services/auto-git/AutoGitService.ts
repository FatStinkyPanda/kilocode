import * as vscode from "vscode"
import EventEmitter from "events"

// VSCode Git API types
interface GitExtension {
	getAPI(version: number): API
}

interface API {
	repositories: Repository[]
	getRepository(uri: vscode.Uri): Repository | null
}

interface Repository {
	rootUri: vscode.Uri
	state: RepositoryState
	add(resources: vscode.Uri[]): Promise<void>
	commit(message: string, opts?: CommitOptions): Promise<void>
	push(remoteName?: string, branchName?: string, setUpstream?: boolean): Promise<void>
	fetch(remote?: string): Promise<void>
	createBranch(name: string, checkout: boolean): Promise<void>
	getBranch(name: string): Promise<Branch>
	status(): Promise<void>
}

interface RepositoryState {
	HEAD: Branch | undefined
	remotes: Remote[]
	workingTreeChanges: Change[]
	indexChanges: Change[]
}

interface Branch {
	name: string | undefined
	commit?: string
	upstream?: { remote: string; name: string }
	ahead?: number
	behind?: number
}

interface Remote {
	name: string
	fetchUrl?: string
	pushUrl?: string
}

interface Change {
	uri: vscode.Uri
	status: number
}

interface CommitOptions {
	all?: boolean
	amend?: boolean
	signoff?: boolean
	signCommit?: boolean
}

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
 * Uses VSCode's native Git API for reliable git operations.
 */
export class AutoGitService extends EventEmitter {
	private static instance: AutoGitService | undefined
	private config: AutoGitConfig
	private outputChannel: vscode.OutputChannel
	private workspacePath: string | undefined
	private context: vscode.ExtensionContext
	private workspaceConfigKey = "autoGitWorkspaceConfig"
	private gitAPI: API | undefined

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
		this.initializeGitAPI()
		this.outputChannel.appendLine("[AutoGit] Service initialized with VSCode native Git API")
	}

	/**
	 * Initializes the VSCode Git API
	 */
	private async initializeGitAPI() {
		try {
			const gitExtension = vscode.extensions.getExtension<GitExtension>("vscode.git")
			if (!gitExtension) {
				this.outputChannel.appendLine("[AutoGit] VSCode Git extension not found")
				return
			}

			if (!gitExtension.isActive) {
				await gitExtension.activate()
			}

			this.gitAPI = gitExtension.exports.getAPI(1)
			this.outputChannel.appendLine("[AutoGit] Git API initialized successfully")
		} catch (error) {
			this.outputChannel.appendLine(
				`[AutoGit] Failed to initialize Git API: ${error instanceof Error ? error.message : String(error)}`,
			)
		}
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
	 * Gets the Git repository for the current workspace
	 */
	private getRepository(): Repository | undefined {
		if (!this.gitAPI || !this.workspacePath) {
			return undefined
		}

		const workspaceUri = vscode.Uri.file(this.workspacePath)
		const repo = this.gitAPI.getRepository(workspaceUri)

		if (!repo && this.gitAPI.repositories.length > 0) {
			// Try to find a repo that contains our workspace path
			return this.gitAPI.repositories.find((r) => this.workspacePath?.startsWith(r.rootUri.fsPath))
		}

		return repo || undefined
	}

	/**
	 * Checks if the repository is ready for auto-commit
	 */
	async isRepositoryReady(): Promise<boolean> {
		if (!this.config.enabled || !this.workspacePath) {
			return false
		}

		// Check if Git API is available
		if (!this.gitAPI) {
			await this.initializeGitAPI()
			if (!this.gitAPI) {
				this.outputChannel.appendLine("[AutoGit] Git API not available")
				return false
			}
		}

		const repo = this.getRepository()
		if (!repo) {
			this.outputChannel.appendLine(`[AutoGit] No git repository found for workspace ${this.workspacePath}`)
			return false
		}

		// Auto-initialize workspace config if git repository exists but hasn't been set up
		const workspaceConfig = await this.getWorkspaceConfig()
		if (!workspaceConfig.isSetup) {
			this.outputChannel.appendLine(
				`[AutoGit] Auto-initializing git configuration for workspace ${this.workspacePath}`,
			)

			// Try to get remote URL from the git repository
			const remotes = repo.state.remotes
			const originRemote = remotes.find((r) => r.name === "origin")
			const repositoryUrl = originRemote?.pushUrl || originRemote?.fetchUrl || this.config.repositoryUrl || ""

			// Use git config user.email if available, otherwise use config default
			const userEmail = this.config.userEmail || "kilocode@example.com"

			// Auto-setup the workspace
			await this.updateWorkspaceGitConfig(repositoryUrl, userEmail)
			this.outputChannel.appendLine(`[AutoGit] Workspace auto-configured with repository URL: ${repositoryUrl}`)
		}

		// Repository is ready if it exists (we just auto-configured it if needed)
		return true
	}

	/**
	 * Checks if there are uncommitted changes
	 */
	private hasUncommittedChanges(repo: Repository): boolean {
		return repo.state.workingTreeChanges.length > 0 || repo.state.indexChanges.length > 0
	}

	/**
	 * Gets the current branch name
	 */
	private getCurrentBranch(repo: Repository): string | undefined {
		return repo.state.HEAD?.name
	}

	/**
	 * Checks if pushing would cause conflicts (behind remote)
	 */
	private async wouldPushConflict(repo: Repository): Promise<boolean> {
		try {
			// Fetch latest from remote
			await repo.fetch()

			const head = repo.state.HEAD
			if (!head || !head.behind) {
				return false
			}

			// If we're behind the remote, there's a potential conflict
			return head.behind > 0
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
	private async createConflictBranch(repo: Repository): Promise<string> {
		const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5)
		const branchName = `kilocode-auto-${timestamp}`

		this.outputChannel.appendLine(`[AutoGit] Creating conflict resolution branch: ${branchName}`)
		await repo.createBranch(branchName, true)

		this.emit("branchCreated", branchName)
		return branchName
	}

	/**
	 * Commits all changes with a generated commit message
	 */
	private async commitChanges(repo: Repository): Promise<string> {
		// Stage all changes
		this.outputChannel.appendLine(`[AutoGit] Staging all changes...`)

		// Get all changed files
		const changedFiles = [
			...repo.state.workingTreeChanges.map((c) => c.uri),
			...repo.state.indexChanges.map((c) => c.uri),
		]

		if (changedFiles.length > 0) {
			await repo.add(changedFiles)
		}

		// Generate commit message
		const timestamp = new Date().toISOString()
		const commitMessage = `Auto-commit by Kilo Code - ${timestamp}

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>`

		// Create commit
		this.outputChannel.appendLine(`[AutoGit] Creating commit...`)
		await repo.commit(commitMessage, { all: false })

		// Get commit hash from HEAD
		const commitHash = repo.state.HEAD?.commit || "unknown"

		this.outputChannel.appendLine(`[AutoGit] Commit created: ${commitHash}`)
		return commitHash
	}

	/**
	 * Pushes changes to remote repository
	 */
	private async pushChanges(repo: Repository, branch: string): Promise<void> {
		this.outputChannel.appendLine(`[AutoGit] Pushing to origin/${branch}...`)

		// Push with upstream tracking
		await repo.push("origin", branch, true)

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

			// Get repository
			const repo = this.getRepository()
			if (!repo) {
				this.outputChannel.appendLine(`[AutoGit] No repository found`)
				return
			}

			// Refresh repository state
			await repo.status()

			// Check if there are changes to commit
			const hasChanges = this.hasUncommittedChanges(repo)
			if (!hasChanges) {
				this.outputChannel.appendLine(`[AutoGit] No changes to commit, skipping`)
				return
			}

			// Check for potential conflicts
			const wouldConflict = await this.wouldPushConflict(repo)
			let currentBranch = this.getCurrentBranch(repo) || "main"

			if (wouldConflict && this.config.createBranchOnConflict) {
				this.outputChannel.appendLine(`[AutoGit] Conflicts detected, creating new branch`)
				currentBranch = await this.createConflictBranch(repo)
			}

			// Commit changes
			const commitHash = await this.commitChanges(repo)
			this.emit("commitSuccess", commitHash, currentBranch)

			// Push changes
			await this.pushChanges(repo, currentBranch)
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
	 * Validates if Git extension is available and repository exists
	 */
	async setupGitRepository(repositoryUrl: string, userEmail: string): Promise<boolean> {
		if (!this.workspacePath) {
			this.outputChannel.appendLine(`[AutoGit] Cannot setup: workspace path is not set`)
			return false
		}

		try {
			// Ensure Git API is initialized
			if (!this.gitAPI) {
				await this.initializeGitAPI()
				if (!this.gitAPI) {
					throw new Error("Git API not available")
				}
			}

			// Check if repository exists
			const repo = this.getRepository()
			if (!repo) {
				throw new Error("No git repository found. Please initialize git in this workspace first.")
			}

			// Validate that we can access the repository
			await repo.status()

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
