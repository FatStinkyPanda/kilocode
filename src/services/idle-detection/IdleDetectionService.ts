import * as vscode from "vscode"
import * as path from "path"
import * as fs from "fs/promises"
import EventEmitter from "events"

export type IdleDetectionMethod = "auto" | "button" | "events" | "hybrid"

export interface IdleDetectionConfig {
	enabled: boolean
	detectionMethod: IdleDetectionMethod
	idleTimeoutMs: number
	enableNotifications: boolean
	autoPromptFolder: string
	showStatusBar: boolean
}

export type IdleStatus = "active" | "waiting" | "idle" | "paused"

export interface IdleDetectionEvents {
	idle: () => void
	active: () => void
	autoPromptReady: (prompt: string) => void
	statusChanged: (status: IdleStatus) => void
	paused: () => void
	resumed: () => void
}

/**
 * Service that detects when the AI model has become idle after completing a task.
 * Monitors task state changes and activity to determine when the system is idle.
 */
export class IdleDetectionService extends EventEmitter {
	private static instance: IdleDetectionService | undefined
	private idleTimer: NodeJS.Timeout | undefined
	private isIdle: boolean = false
	private isTaskActive: boolean = false
	private config: IdleDetectionConfig
	private outputChannel: vscode.OutputChannel
	private workspacePath: string | undefined
	private currentStatus: IdleStatus = "active"
	private lastIdleDetectionSource: "button" | "events" | "none" = "none"
	private isPaused: boolean = false
	private pausedState: { isIdle: boolean; isTaskActive: boolean } | undefined

	private constructor(config: IdleDetectionConfig, outputChannel: vscode.OutputChannel, workspacePath?: string) {
		super()
		this.config = config
		this.outputChannel = outputChannel
		this.workspacePath = workspacePath
		this.outputChannel.appendLine("[IdleDetection] Service initialized")
	}

	/**
	 * Creates or retrieves the singleton instance of IdleDetectionService
	 */
	static getInstance(
		config?: IdleDetectionConfig,
		outputChannel?: vscode.OutputChannel,
		workspacePath?: string,
	): IdleDetectionService {
		if (!IdleDetectionService.instance && config && outputChannel) {
			IdleDetectionService.instance = new IdleDetectionService(config, outputChannel, workspacePath)
		}
		return IdleDetectionService.instance!
	}

	/**
	 * Updates the configuration
	 */
	updateConfig(config: Partial<IdleDetectionConfig>) {
		this.config = { ...this.config, ...config }
		this.outputChannel.appendLine(`[IdleDetection] Config updated: ${JSON.stringify(this.config)}`)

		// If disabled, clear any pending timers and reset state
		if (!this.config.enabled) {
			this.clearIdleTimer()
			this.isIdle = false
			this.isTaskActive = false
		}
	}

	/**
	 * Updates the workspace path
	 */
	updateWorkspacePath(workspacePath: string) {
		this.workspacePath = workspacePath
	}

	/**
	 * Gets the current idle status
	 */
	getStatus(): IdleStatus {
		return this.currentStatus
	}

	/**
	 * Updates the current status and emits status change event
	 */
	private updateStatus(newStatus: IdleStatus) {
		if (this.currentStatus !== newStatus) {
			this.currentStatus = newStatus
			this.outputChannel.appendLine(`[IdleDetection] Status changed to: ${newStatus}`)
			this.emit("statusChanged", newStatus)
		}
	}

	/**
	 * Notifies the service that a task has started
	 */
	notifyTaskStarted() {
		if (!this.config.enabled) {
			return
		}

		// Only use event-based detection for certain methods
		if (!this.shouldUseEventDetection()) {
			return
		}

		this.outputChannel.appendLine("[IdleDetection:Events] Task started - marking as active")
		this.isTaskActive = true
		this.isIdle = false
		this.clearIdleTimer()
		this.lastIdleDetectionSource = "events"
		this.updateStatus("active")
		this.emit("active")
	}

	/**
	 * Notifies the service that a task has completed or the AI has sent a message
	 */
	notifyTaskCompletedOrMessageSent() {
		if (!this.config.enabled) {
			return
		}

		// Only use event-based detection for certain methods
		if (!this.shouldUseEventDetection()) {
			return
		}

		this.outputChannel.appendLine("[IdleDetection:Events] Task completed or message sent - starting idle timer")
		this.isTaskActive = false
		this.lastIdleDetectionSource = "events"
		this.updateStatus("waiting")
		this.startIdleTimer()
	}

	/**
	 * Notifies the service that the user has interacted (e.g., sent a message)
	 */
	notifyUserActivity() {
		if (!this.config.enabled) {
			return
		}

		this.outputChannel.appendLine("[IdleDetection] User activity detected - resetting idle state")
		this.isIdle = false
		this.clearIdleTimer()
	}

	/**
	 * Manually triggers idle state (for testing or external control)
	 */
	triggerIdle() {
		if (!this.config.enabled) {
			return
		}

		this.handleIdleTimeout()
	}

	/**
	 * Pauses auto-prompt detection. When paused, idle state will be detected but auto-prompts won't be sent.
	 */
	pause() {
		if (this.isPaused) {
			return
		}

		this.outputChannel.appendLine("[IdleDetection] Pausing auto-prompt")
		this.isPaused = true

		// Save current state
		this.pausedState = {
			isIdle: this.isIdle,
			isTaskActive: this.isTaskActive,
		}

		// Clear any pending idle timers
		this.clearIdleTimer()

		// Update status to paused
		this.updateStatus("paused")
		this.emit("paused")
	}

	/**
	 * Resumes auto-prompt detection.
	 */
	resume() {
		if (!this.isPaused) {
			return
		}

		this.outputChannel.appendLine("[IdleDetection] Resuming auto-prompt")
		this.isPaused = false

		// Restore previous state if we had one
		if (this.pausedState) {
			this.isIdle = this.pausedState.isIdle
			this.isTaskActive = this.pausedState.isTaskActive
			this.pausedState = undefined

			// If we were idle before pausing, trigger it again
			if (this.isIdle) {
				this.updateStatus("idle")
				this.emit("idle")
			} else if (!this.isTaskActive) {
				this.updateStatus("waiting")
				this.startIdleTimer()
			} else {
				this.updateStatus("active")
			}
		} else {
			// No saved state, default to active
			this.updateStatus("active")
		}

		this.emit("resumed")
	}

	/**
	 * Returns whether auto-prompt is currently paused
	 */
	isPausedState(): boolean {
		return this.isPaused
	}

	/**
	 * Notifies the service that the "Start New Task" button became visible (button-based detection)
	 */
	notifyButtonVisible() {
		if (!this.config.enabled) {
			return
		}

		// Only use button-based detection for certain methods
		if (!this.shouldUseButtonDetection()) {
			return
		}

		this.outputChannel.appendLine("[IdleDetection:Button] Start New Task button visible - starting idle timer")
		this.isTaskActive = false
		this.lastIdleDetectionSource = "button"
		this.updateStatus("waiting")
		this.startIdleTimer()
	}

	/**
	 * Notifies the service that the "Start New Task" button became hidden (task started)
	 */
	notifyButtonHidden() {
		if (!this.config.enabled) {
			return
		}

		// Only use button-based detection for certain methods
		if (!this.shouldUseButtonDetection()) {
			return
		}

		this.outputChannel.appendLine("[IdleDetection:Button] Start New Task button hidden - marking as active")
		this.isTaskActive = true
		this.isIdle = false
		this.clearIdleTimer()
		this.lastIdleDetectionSource = "button"
		this.updateStatus("active")
		this.emit("active")
	}

	/**
	 * Determines if event-based detection should be used
	 */
	private shouldUseEventDetection(): boolean {
		return (
			this.config.detectionMethod === "events" ||
			this.config.detectionMethod === "hybrid" ||
			this.config.detectionMethod === "auto"
		)
	}

	/**
	 * Determines if button-based detection should be used
	 */
	private shouldUseButtonDetection(): boolean {
		return (
			this.config.detectionMethod === "button" ||
			this.config.detectionMethod === "hybrid" ||
			this.config.detectionMethod === "auto"
		)
	}

	/**
	 * Starts the idle timer
	 */
	private startIdleTimer() {
		this.clearIdleTimer()
		this.idleTimer = setTimeout(() => {
			this.handleIdleTimeout()
		}, this.config.idleTimeoutMs)
	}

	/**
	 * Clears the idle timer
	 */
	private clearIdleTimer() {
		if (this.idleTimer) {
			clearTimeout(this.idleTimer)
			this.idleTimer = undefined
		}
	}

	/**
	 * Handles the idle timeout event
	 */
	private async handleIdleTimeout() {
		if (this.isIdle || this.isTaskActive) {
			return
		}

		this.outputChannel.appendLine("[IdleDetection] Idle state detected")
		this.isIdle = true
		this.updateStatus("idle")
		this.emit("idle")

		// Show notification if enabled
		if (this.config.enableNotifications) {
			this.showIdleNotification()
		}

		// Process auto-prompt folder if configured
		await this.processAutoPromptFolder()
	}

	/**
	 * Shows a notification that the system is idle
	 */
	private showIdleNotification() {
		vscode.window.showInformationMessage("Kilo Code is now idle and ready for your next request.", "OK")
	}

	/**
	 * Processes text files from the auto-prompt folder and sends them to the AI
	 */
	private async processAutoPromptFolder() {
		if (!this.config.autoPromptFolder || !this.workspacePath) {
			return
		}

		// Skip processing if paused
		if (this.isPaused) {
			this.outputChannel.appendLine("[IdleDetection] Auto-prompt is paused, skipping folder processing")
			return
		}

		try {
			const folderPath = path.isAbsolute(this.config.autoPromptFolder)
				? this.config.autoPromptFolder
				: path.join(this.workspacePath, this.config.autoPromptFolder)

			this.outputChannel.appendLine(`[IdleDetection] Checking auto-prompt folder: ${folderPath}`)

			// Check if folder exists, create it if it doesn't
			try {
				await fs.access(folderPath)
				this.outputChannel.appendLine(`[IdleDetection] Auto-prompt folder exists: ${folderPath}`)
			} catch {
				this.outputChannel.appendLine(
					`[IdleDetection] Auto-prompt folder does not exist, creating: ${folderPath}`,
				)
				try {
					await fs.mkdir(folderPath, { recursive: true })
					this.outputChannel.appendLine(
						`[IdleDetection] Auto-prompt folder created successfully: ${folderPath}`,
					)

					// Create a README file to explain the folder's purpose
					const readmePath = path.join(folderPath, "README.txt")
					const readmeContent = `# Kilo Code Auto-Prompt Folder

This folder is used by Kilo Code's idle detection feature.

How it works:
1. When Kilo Code becomes idle after completing a task
2. All .txt files in this folder are automatically read
3. Their contents are combined and sent to the AI as a new task

To use this feature:
- Create .txt files in this folder with your task descriptions
- Enable idle detection in VSCode settings (search for "kilo-code idle")
- When Kilo Code becomes idle, your tasks will be automatically processed

Example: Create a file named "review-code.txt" with content like:
"Review the authentication module for security issues"

For more information, see: IDLE_DETECTION_FEATURES.md in the project root.
`
					await fs.writeFile(readmePath, readmeContent, "utf-8")
					this.outputChannel.appendLine(`[IdleDetection] Created README.txt in auto-prompt folder`)
				} catch (createError) {
					this.outputChannel.appendLine(
						`[IdleDetection] Error creating auto-prompt folder: ${createError instanceof Error ? createError.message : String(createError)}`,
					)
					return
				}

				// No text files yet since we just created the folder
				return
			}

			// Read all text files in the folder
			const files = await fs.readdir(folderPath)
			const textFiles = files.filter((file) => file.endsWith(".txt"))

			if (textFiles.length === 0) {
				this.outputChannel.appendLine(`[IdleDetection] No text files found in auto-prompt folder`)
				return
			}

			this.outputChannel.appendLine(
				`[IdleDetection] Found ${textFiles.length} text file(s) in auto-prompt folder`,
			)

			// Read and concatenate content from all text files
			const fileContents: string[] = []
			for (const file of textFiles) {
				const filePath = path.join(folderPath, file)
				try {
					const content = await fs.readFile(filePath, "utf-8")
					if (content.trim()) {
						fileContents.push(`### Content from ${file}:\n${content}`)
						this.outputChannel.appendLine(`[IdleDetection] Read ${content.length} characters from ${file}`)
					}
				} catch (error) {
					this.outputChannel.appendLine(
						`[IdleDetection] Error reading file ${file}: ${error instanceof Error ? error.message : String(error)}`,
					)
				}
			}

			if (fileContents.length === 0) {
				this.outputChannel.appendLine(`[IdleDetection] All text files were empty`)
				return
			}

			// Create the combined prompt
			const combinedPrompt = fileContents.join("\n\n")
			this.outputChannel.appendLine(
				`[IdleDetection] Created auto-prompt with ${combinedPrompt.length} characters from ${fileContents.length} file(s)`,
			)

			// Emit event with the prompt content
			this.emit("autoPromptReady", combinedPrompt)

			// Optionally delete the files after reading (if configured)
			// For now, we'll leave them in place - user can manually delete or we can add a config option
		} catch (error) {
			this.outputChannel.appendLine(
				`[IdleDetection] Error processing auto-prompt folder: ${error instanceof Error ? error.message : String(error)}`,
			)
		}
	}

	/**
	 * Cleans up resources
	 */
	dispose() {
		this.clearIdleTimer()
		this.removeAllListeners()
		IdleDetectionService.instance = undefined
	}
}
