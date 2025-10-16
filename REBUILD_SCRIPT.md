# Kilo Code - Automated Rebuild and Reinstall Script

## Overview

This script automates the complete process of rebuilding the Kilo Code extension from the latest source files and installing it in VSCode.

## What It Does

1. **Cleans** previous build artifacts (if clean script exists)
2. **Type Checks** the entire codebase to ensure no TypeScript errors
3. **Builds** the extension package (.vsix file)
4. **Finds** all installed Kilo Code extensions (safety: only kilo-code extensions)
5. **Uninstalls** existing Kilo Code extensions
6. **Installs** the newly built extension

## Safety Features

- **Selective Uninstall**: Only uninstalls extensions matching:
    - Extensions containing "kilocode" in the name
    - Extensions containing "kilo-code" in the name
    - Extensions starting with "kilo-code." or "kilocode."
- **No Other Extensions Affected**: Your other VSCode extensions remain untouched
- **Error Handling**: Stops on critical errors, provides detailed output
- **Verification**: Shows exactly which extensions will be uninstalled before proceeding

## Usage

### Windows

Double-click `rebuild-and-install.bat` or run in terminal:

```cmd
rebuild-and-install.bat
```

### macOS/Linux

Make executable (first time only):

```bash
chmod +x rebuild-and-install.sh
```

Then run:

```bash
./rebuild-and-install.sh
```

### Cross-Platform (Node.js)

```bash
node rebuild-and-install.js
```

### Via package.json

```bash
pnpm run rebuild-install
```

## Prerequisites

1. **Node.js** installed and in PATH
2. **pnpm** package manager installed
3. **VSCode CLI** available (`code` command in PATH)
    - On Windows: Usually installed automatically with VSCode
    - On macOS: Run "Shell Command: Install 'code' command in PATH" from VSCode Command Palette
    - On Linux: May need manual PATH setup

## What You'll See

The script provides detailed, color-coded output:

```
======================================================================
  Kilo Code Extension - Automated Rebuild and Reinstall
======================================================================

[1/5] Cleaning previous builds
  Running: pnpm run clean
  ✓ Cleaned build artifacts

[2/5] Running type check
  Running: pnpm run check-types
  ✓ Type check passed

[3/5] Building extension
  Running: pnpm run bundle
  ✓ Extension built successfully
  ✓ Found extension package: kilo-code-0.1.0.vsix

[4/5] Checking for existing Kilo Code extensions
  Found 1 Kilo Code extension(s):
    - kilocode.kilo-code@0.1.0

  Uninstalling existing extensions...
  ✓ Uninstalled kilocode.kilo-code
  ✓ Uninstalled 1 extension(s)

[5/5] Installing new extension
  Running: code --install-extension "src/kilo-code-0.1.0.vsix"
  ✓ Installed new extension

======================================================================
  ✓ REBUILD AND INSTALL COMPLETED SUCCESSFULLY
======================================================================

Next steps:
  1. Restart VSCode or reload the window (Ctrl+R / Cmd+R)
  2. The updated Kilo Code extension should now be active
```

## After Running

1. **Reload VSCode**: Press `Ctrl+R` (Windows/Linux) or `Cmd+R` (macOS) to reload the window
2. **Verify Installation**: Check that Kilo Code is running with the latest changes
3. **Check Output**: Look for any warnings or messages in the VSCode Output panel

## Troubleshooting

### "code command not found"

The VSCode CLI is not in your PATH.

**Fix for macOS:**

1. Open VSCode
2. Press `Cmd+Shift+P`
3. Type "shell command"
4. Select "Shell Command: Install 'code' command in PATH"

**Fix for Windows:**

- Reinstall VSCode and ensure "Add to PATH" is checked
- Or manually add to PATH: `C:\Program Files\Microsoft VS Code\bin`

**Fix for Linux:**

- Add to PATH: `/usr/share/code/bin` or wherever VSCode is installed

### "pnpm command not found"

Install pnpm:

```bash
npm install -g pnpm
```

### Type Check Fails

Fix the TypeScript errors before the script can proceed:

```bash
pnpm run check-types
```

Review errors and fix them in the source code.

### Build Fails

Common causes:

- Missing dependencies: Run `pnpm install`
- Corrupted node_modules: Delete and run `pnpm install` again
- Disk space: Ensure you have enough disk space

### No .vsix File Found

The build may have failed silently. Try:

```bash
pnpm run bundle
```

Check the output for errors.

### Extension Still Shows Old Version

After installing, make sure to:

1. Fully reload VSCode window (`Ctrl+R` / `Cmd+R`)
2. Or restart VSCode completely
3. Check the extension version in Extensions panel

## Development Workflow

Recommended workflow when developing Kilo Code:

1. Make changes to source files
2. Run `pnpm run rebuild-install` (or platform-specific script)
3. Reload VSCode window
4. Test changes
5. Repeat

## Script Files

- **`rebuild-and-install.js`** - Main Node.js script (cross-platform)
- **`rebuild-and-install.bat`** - Windows wrapper
- **`rebuild-and-install.sh`** - Unix/Linux/macOS wrapper
- **`REBUILD_SCRIPT.md`** - This documentation

## Adding to package.json

Add this script to `package.json` for easy access:

```json
{
	"scripts": {
		"rebuild-install": "node rebuild-and-install.js"
	}
}
```

Then run with:

```bash
pnpm run rebuild-install
```

## Technical Details

### Extension Detection Logic

The script identifies Kilo Code extensions using these criteria:

```javascript
const isKiloCodeExtension = (extensionId) => {
	const lowerExt = extensionId.toLowerCase()
	return (
		lowerExt.includes("kilocode") ||
		lowerExt.includes("kilo-code") ||
		lowerExt.startsWith("kilo-code.") ||
		lowerExt.startsWith("kilocode.")
	)
}
```

### Commands Used

- `pnpm run clean` - Cleans build artifacts (optional)
- `pnpm run check-types` - TypeScript type checking
- `pnpm run bundle` - Builds the .vsix package
- `code --list-extensions --show-versions` - Lists installed extensions
- `code --uninstall-extension <id>` - Uninstalls extension
- `code --install-extension <path>` - Installs extension from .vsix

## Safety Guarantees

1. ✅ **Only Kilo Code extensions are affected**
2. ✅ **All other extensions remain installed**
3. ✅ **Shows what will be uninstalled before proceeding**
4. ✅ **Stops on errors, never continues with invalid state**
5. ✅ **Cross-platform compatible**
6. ✅ **Detailed logging of every step**

## License

Part of the Kilo Code project. Same license as the main project.
