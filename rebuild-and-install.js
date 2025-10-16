#!/usr/bin/env node

/**
 * Automated Kilo Code Extension Rebuild and Reinstall Script
 *
 * This script:
 * 1. Rebuilds the extension using pnpm
 * 2. Finds and uninstalls existing kilo-code extensions only
 * 3. Installs the newly built extension
 *
 * Safety: Only affects extensions with publisher "kilo-code" or containing "kilocode"
 */

const { execSync } = require("child_process")
const fs = require("fs")
const path = require("path")

// ANSI color codes for output
const colors = {
	reset: "\x1b[0m",
	bright: "\x1b[1m",
	red: "\x1b[31m",
	green: "\x1b[32m",
	yellow: "\x1b[33m",
	blue: "\x1b[34m",
	cyan: "\x1b[36m",
}

function log(message, color = colors.reset) {
	console.log(`${color}${message}${colors.reset}`)
}

function logStep(step, message) {
	log(`\n${colors.bright}[${step}]${colors.reset} ${message}`, colors.cyan)
}

function logSuccess(message) {
	log(`✓ ${message}`, colors.green)
}

function logError(message) {
	log(`✗ ${message}`, colors.red)
}

function logWarning(message) {
	log(`⚠ ${message}`, colors.yellow)
}

function executeCommand(command, description) {
	try {
		log(`  Running: ${command}`, colors.blue)
		const output = execSync(command, {
			encoding: "utf8",
			stdio: "pipe",
		})
		if (output.trim()) {
			console.log(output)
		}
		logSuccess(description)
		return output
	} catch (error) {
		logError(`${description} failed`)
		if (error.stdout) console.log(error.stdout)
		if (error.stderr) console.error(error.stderr)
		throw error
	}
}

function findVsixFile() {
	const srcDir = path.join(__dirname, "src")

	if (!fs.existsSync(srcDir)) {
		throw new Error("src directory not found")
	}

	const files = fs.readdirSync(srcDir)
	const vsixFiles = files.filter((file) => file.endsWith(".vsix"))

	if (vsixFiles.length === 0) {
		throw new Error("No .vsix file found in src directory")
	}

	// Sort by modification time, newest first
	vsixFiles.sort((a, b) => {
		const statA = fs.statSync(path.join(srcDir, a))
		const statB = fs.statSync(path.join(srcDir, b))
		return statB.mtime - statA.mtime
	})

	return path.join(srcDir, vsixFiles[0])
}

function getInstalledKiloCodeExtensions() {
	try {
		const output = executeCommand("code --list-extensions --show-versions", "Listing installed extensions")
		const extensions = output.split("\n").filter((line) => line.trim())

		// Filter for kilo-code extensions only
		// Match: kilo-code.*, kilocode.*, or extensions containing "kilocode" in the name
		const kiloCodeExtensions = extensions.filter((ext) => {
			const lowerExt = ext.toLowerCase()
			return (
				lowerExt.includes("kilocode") ||
				lowerExt.includes("kilo-code") ||
				lowerExt.startsWith("kilo-code.") ||
				lowerExt.startsWith("kilocode.")
			)
		})

		return kiloCodeExtensions
	} catch (error) {
		logWarning("Could not list extensions. VSCode CLI may not be available.")
		return []
	}
}

function uninstallExtension(extensionId) {
	try {
		const extensionName = extensionId.split("@")[0]
		executeCommand(`code --uninstall-extension "${extensionName}"`, `Uninstalled ${extensionName}`)
		return true
	} catch (error) {
		logError(`Failed to uninstall ${extensionId}`)
		return false
	}
}

function installExtension(vsixPath) {
	executeCommand(`code --install-extension "${vsixPath}"`, "Installed new extension")
}

async function main() {
	log("\n" + "=".repeat(70), colors.bright)
	log("  Kilo Code Extension - Automated Rebuild and Reinstall", colors.bright)
	log("=".repeat(70) + "\n", colors.bright)

	try {
		// Step 1: Clean previous builds
		logStep("1/5", "Cleaning previous builds")
		try {
			executeCommand("pnpm run clean", "Cleaned build artifacts")
		} catch (error) {
			logWarning("Clean command not available, continuing...")
		}

		// Step 2: Run type check
		logStep("2/5", "Running type check")
		executeCommand("pnpm run check-types", "Type check passed")

		// Step 3: Build the extension
		logStep("3/5", "Building extension")
		executeCommand("pnpm run bundle", "Extension built successfully")

		// Wait a moment for file system to settle
		await new Promise((resolve) => setTimeout(resolve, 1000))

		// Find the .vsix file
		const vsixPath = findVsixFile()
		logSuccess(`Found extension package: ${path.basename(vsixPath)}`)

		// Step 4: Uninstall existing kilo-code extensions
		logStep("4/5", "Checking for existing Kilo Code extensions")
		const installedExtensions = getInstalledKiloCodeExtensions()

		if (installedExtensions.length === 0) {
			log("  No existing Kilo Code extensions found", colors.yellow)
		} else {
			log(`  Found ${installedExtensions.length} Kilo Code extension(s):`, colors.cyan)
			installedExtensions.forEach((ext) => {
				log(`    - ${ext}`, colors.blue)
			})

			log("\n  Uninstalling existing extensions...", colors.cyan)
			let uninstalledCount = 0
			for (const ext of installedExtensions) {
				if (uninstallExtension(ext)) {
					uninstalledCount++
				}
			}
			logSuccess(`Uninstalled ${uninstalledCount} extension(s)`)
		}

		// Step 5: Install the new extension
		logStep("5/5", "Installing new extension")
		installExtension(vsixPath)

		// Success summary
		log("\n" + "=".repeat(70), colors.green)
		log("  ✓ REBUILD AND INSTALL COMPLETED SUCCESSFULLY", colors.green)
		log("=".repeat(70), colors.green)
		log("\nNext steps:", colors.bright)
		log("  1. Restart VSCode or reload the window (Ctrl+R / Cmd+R)")
		log("  2. The updated Kilo Code extension should now be active")
		log("")
	} catch (error) {
		log("\n" + "=".repeat(70), colors.red)
		log("  ✗ REBUILD AND INSTALL FAILED", colors.red)
		log("=".repeat(70), colors.red)
		console.error("\nError details:", error.message)
		process.exit(1)
	}
}

// Run the script
main().catch((error) => {
	console.error("Unexpected error:", error)
	process.exit(1)
})
