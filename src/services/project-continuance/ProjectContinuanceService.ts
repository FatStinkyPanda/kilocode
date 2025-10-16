import * as vscode from "vscode"
import * as path from "path"
import * as fs from "fs/promises"
import EventEmitter from "events"

export interface ProjectContinuanceConfig {
	enabled: boolean
	projectFolder: string
	documentationFileName: string
	todoFileName: string
	contextScriptFileName: string
	autoCreateFiles: boolean
	autoUpdateContext: boolean
	includeFileTree: boolean
	maxFileTreeDepth: number
}

export interface ProjectFiles {
	documentationPath?: string
	todoPath?: string
	contextScriptPath?: string
	folderPath: string
}

export interface ProjectContinuanceEvents {
	contextReady: (prompt: string) => void
	filesCreated: (files: ProjectFiles) => void
	error: (error: string) => void
}

/**
 * Service that manages automatic project continuance by maintaining project context,
 * documentation, TODOs, and generating intelligent continuation prompts.
 */
export class ProjectContinuanceService extends EventEmitter {
	private static instance: ProjectContinuanceService | undefined
	public config: ProjectContinuanceConfig
	private outputChannel: vscode.OutputChannel
	private workspacePath: string | undefined

	private constructor(config: ProjectContinuanceConfig, outputChannel: vscode.OutputChannel, workspacePath?: string) {
		super()
		this.config = config
		this.outputChannel = outputChannel
		this.workspacePath = workspacePath
		this.outputChannel.appendLine("[ProjectContinuance] Service initialized")
	}

	/**
	 * Creates or retrieves the singleton instance
	 */
	static getInstance(
		config?: ProjectContinuanceConfig,
		outputChannel?: vscode.OutputChannel,
		workspacePath?: string,
	): ProjectContinuanceService {
		if (!ProjectContinuanceService.instance && config && outputChannel) {
			ProjectContinuanceService.instance = new ProjectContinuanceService(config, outputChannel, workspacePath)
		}
		return ProjectContinuanceService.instance!
	}

	/**
	 * Updates the configuration
	 */
	updateConfig(config: Partial<ProjectContinuanceConfig>) {
		this.config = { ...this.config, ...config }
		this.outputChannel.appendLine(`[ProjectContinuance] Config updated: ${JSON.stringify(this.config)}`)
	}

	/**
	 * Updates the workspace path
	 */
	updateWorkspacePath(workspacePath: string) {
		this.workspacePath = workspacePath
	}

	/**
	 * Gets the project folder path (creates if needed)
	 */
	private async getProjectFolderPath(): Promise<string> {
		if (!this.workspacePath) {
			throw new Error("Workspace path is not set")
		}

		const folderPath = path.isAbsolute(this.config.projectFolder)
			? this.config.projectFolder
			: path.join(this.workspacePath, this.config.projectFolder)

		// Create folder if it doesn't exist and auto-create is enabled
		if (this.config.autoCreateFiles) {
			try {
				await fs.access(folderPath)
			} catch {
				await fs.mkdir(folderPath, { recursive: true })
				this.outputChannel.appendLine(`[ProjectContinuance] Created project folder: ${folderPath}`)
			}
		}

		return folderPath
	}

	/**
	 * Finds a file in the project folder or workspace root
	 */
	private async findFile(fileName: string, folderPath: string): Promise<string | undefined> {
		// First check in project folder
		const projectFilePath = path.join(folderPath, fileName)
		try {
			await fs.access(projectFilePath)
			return projectFilePath
		} catch {
			// File not found in project folder
		}

		// If not found and we have a workspace, search in workspace root and common locations
		if (this.workspacePath) {
			const searchPaths = [
				path.join(this.workspacePath, fileName),
				path.join(this.workspacePath, "docs", fileName),
				path.join(this.workspacePath, "documentation", fileName),
				path.join(this.workspacePath, ".kilo", fileName),
			]

			for (const searchPath of searchPaths) {
				try {
					await fs.access(searchPath)
					return searchPath
				} catch {
					// Continue searching
				}
			}
		}

		return undefined
	}

	/**
	 * Gets all project-related file paths
	 */
	async getProjectFiles(): Promise<ProjectFiles> {
		const folderPath = await this.getProjectFolderPath()

		const files: ProjectFiles = {
			folderPath,
		}

		// Find documentation file (look for .md files with similar names)
		const docFileName = this.config.documentationFileName
		let docPath = await this.findFile(docFileName, folderPath)

		// If exact name not found, try variations
		if (!docPath && this.workspacePath) {
			const docVariations = [
				docFileName,
				`${path.parse(docFileName).name}.md`,
				`${path.parse(docFileName).name}-documentation.md`,
				`${path.parse(docFileName).name}-complete-documentation.md`,
				"README.md",
				"DEVELOPMENT.md",
				"PROJECT.md",
			]

			for (const variation of docVariations) {
				const foundPath = await this.findFile(variation, folderPath)
				if (foundPath) {
					docPath = foundPath
					break
				}
			}
		}

		files.documentationPath = docPath

		// Find TODO file
		files.todoPath = await this.findFile(this.config.todoFileName, folderPath)

		// Context script is always in project folder
		files.contextScriptPath = path.join(folderPath, this.config.contextScriptFileName)

		return files
	}

	/**
	 * Creates default project files if they don't exist
	 */
	async createDefaultFiles(): Promise<ProjectFiles> {
		if (!this.config.autoCreateFiles) {
			return await this.getProjectFiles()
		}

		const folderPath = await this.getProjectFolderPath()
		const files = await this.getProjectFiles()

		// Create documentation file if it doesn't exist
		if (!files.documentationPath) {
			files.documentationPath = path.join(folderPath, this.config.documentationFileName)
			const docContent = `# Project Documentation

## Overview
This document should contain comprehensive information about the project, including:
- What the project is
- How it should be developed
- Architecture and design decisions
- Implementation guidelines
- Testing requirements
- Deployment instructions

## Instructions for AI Agent
When reading this file, you should:
1. Understand the overall project goals and requirements
2. Follow the architectural guidelines
3. Maintain consistency with existing code
4. Update this documentation as you make significant changes

---
*This file was auto-created by Kilo Code. Please update it with your project details.*
`
			await fs.writeFile(files.documentationPath, docContent, "utf-8")
			this.outputChannel.appendLine(`[ProjectContinuance] Created documentation file: ${files.documentationPath}`)
		}

		// Create TODO file if it doesn't exist
		if (!files.todoPath) {
			files.todoPath = path.join(folderPath, this.config.todoFileName)
			const todoContent = `# Project TODO

## Completed Tasks
- [ ] Initialize project structure

## Pending Tasks
- [ ] Define project requirements
- [ ] Implement core functionality
- [ ] Add tests
- [ ] Update documentation

## Blocked/Waiting Tasks
None

## Next Steps
1. Review project documentation
2. Prioritize pending tasks
3. Begin implementation

---
*This file was auto-created by Kilo Code. Update it as you complete tasks.*
`
			await fs.writeFile(files.todoPath, todoContent, "utf-8")
			this.outputChannel.appendLine(`[ProjectContinuance] Created TODO file: ${files.todoPath}`)
		}

		// Always create/update context script
		await this.generateContextScript(files)

		this.emit("filesCreated", files)
		return files
	}

	/**
	 * Generates a file tree of the project
	 */
	private async generateFileTree(): Promise<string> {
		if (!this.workspacePath || !this.config.includeFileTree) {
			return ""
		}

		try {
			const tree = await this.buildFileTree(this.workspacePath, 0)
			return `## Project File Structure\n\`\`\`\n${tree}\n\`\`\`\n\n`
		} catch (error) {
			this.outputChannel.appendLine(
				`[ProjectContinuance] Error generating file tree: ${error instanceof Error ? error.message : String(error)}`,
			)
			return ""
		}
	}

	/**
	 * Recursively builds file tree
	 */
	private async buildFileTree(dirPath: string, depth: number): Promise<string> {
		if (depth > this.config.maxFileTreeDepth) {
			return ""
		}

		let tree = ""
		const indent = "  ".repeat(depth)

		try {
			const entries = await fs.readdir(dirPath, { withFileTypes: true })

			// Filter out common ignored directories
			const filteredEntries = entries.filter((entry) => {
				const ignoreDirs = [
					"node_modules",
					".git",
					".vscode",
					"dist",
					"build",
					"out",
					".next",
					"coverage",
					".turbo",
					".cache",
				]
				return !ignoreDirs.includes(entry.name) && !entry.name.startsWith(".")
			})

			for (const entry of filteredEntries.slice(0, 50)) {
				// Limit to 50 entries per directory
				const fullPath = path.join(dirPath, entry.name)

				if (entry.isDirectory()) {
					tree += `${indent}📁 ${entry.name}/\n`
					const subtree = await this.buildFileTree(fullPath, depth + 1)
					tree += subtree
				} else {
					tree += `${indent}📄 ${entry.name}\n`
				}
			}

			if (filteredEntries.length > 50) {
				tree += `${indent}... (${filteredEntries.length - 50} more items)\n`
			}
		} catch (error) {
			// Skip directories we can't read
		}

		return tree
	}

	/**
	 * Generates the context refresh script
	 */
	async generateContextScript(files?: ProjectFiles): Promise<string> {
		if (!files) {
			files = await this.getProjectFiles()
		}

		let script = `# Kilo Code Project Context Script

This file is automatically generated to help you continue development of this project.

## Instructions

Hello, AI agent and development team!

If you are reading this file, you have been assigned to continue development of this project.

This project has documentation and task tracking that you must follow to ensure consistent and effective development.

## Step 1: View Project Structure

First, get a high-level view of the project structure. Execute this command:

\`\`\`bash
find . -type f -not -path '*/\\.*' -not -path '*/node_modules/*' 2>/dev/null | head -50
\`\`\`

Or for a more detailed tree view:

\`\`\`bash
tree -L 3 -I 'node_modules|.git|dist|build|out' || ls -R | head -100
\`\`\`

`

		// Add file tree if configured
		if (this.config.includeFileTree) {
			const fileTree = await this.generateFileTree()
			if (fileTree) {
				script += fileTree
			}
		}

		script += `## Step 2: Read the TODO File

The project TODO file tracks completed tasks, pending tasks, blocked tasks, and next steps.

`

		if (files.todoPath) {
			const relativeTodoPath = this.workspacePath
				? path.relative(this.workspacePath, files.todoPath)
				: files.todoPath
			script += `**TODO File Location:** \`${relativeTodoPath}\`

Read this file to understand:
- What has been completed
- What needs to be done next
- What tasks are blocked and why
- Upcoming features and improvements

\`\`\`
Read file: ${relativeTodoPath}
\`\`\`

**Important:** Keep this TODO file up to date as you work. Update it to reflect:
- Tasks you've completed (move to "Completed" section with timestamp)
- New tasks you've identified
- Any blockers you encounter
- Changes in priorities

`
		} else {
			script += `**TODO File:** Not found. Create one at \`${this.config.todoFileName}\`

`
		}

		script += `## Step 3: Read the Project Documentation

The project documentation contains the complete specification of what needs to be built and how.

`

		if (files.documentationPath) {
			const relativeDocPath = this.workspacePath
				? path.relative(this.workspacePath, files.documentationPath)
				: files.documentationPath
			script += `**Documentation Location:** \`${relativeDocPath}\`

This documentation should include:
- Project overview and goals
- Architecture and design decisions
- Implementation guidelines
- API specifications
- Testing requirements
- Deployment procedures

\`\`\`
Read file: ${relativeDocPath}
\`\`\`

**Critical:** Follow this documentation carefully. Do not deviate from the specified architecture and guidelines without good reason.

`
		} else {
			script += `**Documentation:** Not found. Looking for \`${this.config.documentationFileName}\`

If you cannot find the project documentation:
1. Check for README.md, DEVELOPMENT.md, or similar files
2. Ask the user where the project documentation is located
3. Create documentation as you understand the project

`
		}

		script += `## Step 4: Understand Your TODO List

Review your own AI agent TODO list (if you maintain one) to understand:
- What you were working on last
- Any notes or context from previous sessions
- Specific implementation decisions or patterns to follow

## Step 5: Continue Development

Now that you have:
1. ✅ Viewed the project structure
2. ✅ Read the project TODO file
3. ✅ Read the project documentation
4. ✅ Reviewed your own notes

You are ready to continue development from where it was left off.

### Development Guidelines

- **Stay Focused:** Work on the highest priority items from the TODO list
- **Update TODOs:** Keep the TODO file current as you complete or add tasks
- **Test Your Work:** Ensure changes work correctly before moving to the next task
- **Document Changes:** Update documentation when you make significant changes
- **Commit Regularly:** Make small, focused commits with clear messages
- **Ask Questions:** If something is unclear in the documentation, ask for clarification

### Next Actions

Based on the current state of the project, your next actions should be:

1. Identify the highest priority task from the TODO file
2. Implement the task following the project documentation guidelines
3. Test your implementation
4. Update the TODO file to reflect your progress
5. Commit your changes
6. Move to the next task

---

*This context script was automatically generated by Kilo Code's Project Continuance Service*
*Last updated: ${new Date().toISOString()}*
`

		// Write the script to file if auto-update is enabled
		if (this.config.autoUpdateContext && files.contextScriptPath) {
			try {
				await fs.writeFile(files.contextScriptPath, script, "utf-8")
				this.outputChannel.appendLine(`[ProjectContinuance] Updated context script: ${files.contextScriptPath}`)
			} catch (error) {
				this.outputChannel.appendLine(
					`[ProjectContinuance] Error writing context script: ${error instanceof Error ? error.message : String(error)}`,
				)
			}
		}

		return script
	}

	/**
	 * Generates a comprehensive continuation prompt
	 */
	async generateContinuationPrompt(): Promise<string> {
		if (!this.config.enabled || !this.workspacePath) {
			return ""
		}

		try {
			// Ensure files exist
			const files = await this.createDefaultFiles()

			// Read the context script (which includes instructions for what to read)
			if (files.contextScriptPath) {
				try {
					const contextScript = await fs.readFile(files.contextScriptPath, "utf-8")
					return contextScript
				} catch (error) {
					// If we can't read the script, generate it fresh
					return await this.generateContextScript(files)
				}
			} else {
				// Generate script without file path
				return await this.generateContextScript(files)
			}
		} catch (error) {
			const errorMessage = `Error generating continuation prompt: ${error instanceof Error ? error.message : String(error)}`
			this.outputChannel.appendLine(`[ProjectContinuance] ${errorMessage}`)
			this.emit("error", errorMessage)
			return ""
		}
	}

	/**
	 * Updates the TODO file with a new entry
	 */
	async updateTODO(section: "completed" | "pending" | "blocked", task: string, details?: string): Promise<void> {
		try {
			const files = await this.getProjectFiles()
			if (!files.todoPath) {
				this.outputChannel.appendLine("[ProjectContinuance] TODO file not found, cannot update")
				return
			}

			let todoContent = await fs.readFile(files.todoPath, "utf-8")

			// Add timestamp to completed tasks
			const timestamp = section === "completed" ? ` (${new Date().toISOString().split("T")[0]})` : ""
			const entry = `- [ ] ${task}${timestamp}${details ? `\n  ${details}` : ""}\n`

			// Find the appropriate section and add the entry
			const sectionHeaders: { [key: string]: string } = {
				completed: "## Completed Tasks",
				pending: "## Pending Tasks",
				blocked: "## Blocked/Waiting Tasks",
			}

			const header = sectionHeaders[section]
			if (todoContent.includes(header)) {
				// Insert after the header
				const headerIndex = todoContent.indexOf(header)
				const nextLineIndex = todoContent.indexOf("\n", headerIndex) + 1
				todoContent = todoContent.slice(0, nextLineIndex) + entry + todoContent.slice(nextLineIndex)
			} else {
				// Append to end
				todoContent += `\n${header}\n${entry}`
			}

			await fs.writeFile(files.todoPath, todoContent, "utf-8")
			this.outputChannel.appendLine(`[ProjectContinuance] Updated TODO file with new ${section} task`)
		} catch (error) {
			this.outputChannel.appendLine(
				`[ProjectContinuance] Error updating TODO: ${error instanceof Error ? error.message : String(error)}`,
			)
		}
	}

	/**
	 * Cleans up resources
	 */
	dispose() {
		this.removeAllListeners()
		ProjectContinuanceService.instance = undefined
	}
}
