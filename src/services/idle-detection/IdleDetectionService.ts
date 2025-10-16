import * as vscode from "vscode"
import * as path from "path"
import * as fs from "fs/promises"
import EventEmitter from "events"

export interface IdleDetectionConfig {
	enabled: boolean
	idleTimeoutMs: number
	enableNotifications: boolean
	autoPromptFolder: string
}

export interface IdleDetectionEvents {
	idle: () => void
	active: () => void
	autoPromptReady: (prompt: string) => void
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

	private constructor(
		config: IdleDetectionConfig,
		outputChannel: vscode.OutputChannel,
		workspacePath?: string,
	) {
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
	 * Notifies the service that a task has started
	 */
	notifyTaskStarted() {
		if (!this.config.enabled) {
			return
		}

		this.outputChannel.appendLine("[IdleDetection] Task started - marking as active")
		this.isTaskActive = true
		this.isIdle = false
		this.clearIdleTimer()
		this.emit("active")
	}

	/**
	 * Notifies the service that a task has completed or the AI has sent a message
	 */
	notifyTaskCompletedOrMessageSent() {
		if (!this.config.enabled) {
			return
		}

		this.outputChannel.appendLine("[IdleDetection] Task completed or message sent - starting idle timer")
		this.isTaskActive = false
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

		try {
			const folderPath = path.isAbsolute(this.config.autoPromptFolder)
				? this.config.autoPromptFolder
				: path.join(this.workspacePath, this.config.autoPromptFolder)

			this.outputChannel.appendLine(`[IdleDetection] Checking auto-prompt folder: ${folderPath}`)

			// Check if folder exists
			try {
				await fs.access(folderPath)
			} catch {
				this.outputChannel.appendLine(`[IdleDetection] Auto-prompt folder does not exist: ${folderPath}`)
				return
			}

			// Read all text files in the folder
			const files = await fs.readdir(folderPath)
			const textFiles = files.filter((file) => file.endsWith(".txt"))

			if (textFiles.length === 0) {
				this.outputChannel.appendLine(`[IdleDetection] No text files found in auto-prompt folder`)
				return
			}

			this.outputChannel.appendLine(`[IdleDetection] Found ${textFiles.length} text file(s) in auto-prompt folder`)

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
