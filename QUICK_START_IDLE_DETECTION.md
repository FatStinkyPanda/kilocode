# Quick Start: Idle Detection & Auto-Prompt Setup

## Step 1: Enable Idle Detection

### Method A: Using VSCode Settings UI (Recommended)

1. Open VSCode Settings:

    - Press `Ctrl + ,` (Windows/Linux) or `Cmd + ,` (Mac)
    - Or: File > Preferences > Settings

2. Search for: `kilo-code idle`

3. You'll see these 4 settings:

    ![Settings Location](https://i.imgur.com/placeholder.png)

    - **✅ Idle Detection: Enabled** - Check this box to enable
    - **⏱️ Idle Timeout Ms** - Set to `5000` (5 seconds) or your preference
    - **🔔 Enable Notifications** - Keep checked to see idle notifications
    - **📁 Auto Prompt Folder** - Set to `.kilocode-prompts` (default) or your custom path

### Method B: Using settings.json

1. Open Command Palette: `Ctrl + Shift + P` (or `Cmd + Shift + P`)
2. Type: `Preferences: Open User Settings (JSON)`
3. Add these lines:

```json
{
	"kilo-code.idleDetection.enabled": true,
	"kilo-code.idleDetection.idleTimeoutMs": 5000,
	"kilo-code.idleDetection.enableNotifications": true,
	"kilo-code.idleDetection.autoPromptFolder": ".kilocode-prompts"
}
```

## Step 2: Create Auto-Prompt Folder

1. In your workspace root, create a folder named `.kilocode-prompts`:

    ```bash
    mkdir .kilocode-prompts
    ```

2. Add text files with your prompts:

    **Example: `.kilocode-prompts/task1.txt`**

    ```
    Review the authentication code and suggest improvements for security
    ```

    **Example: `.kilocode-prompts/task2.txt`**

    ```
    Add unit tests for the user service module
    ```

## Step 3: Test It Out

1. **Start Kilo Code**: Click the Kilo Code icon in the sidebar (or `Ctrl + Shift + A`)

2. **Run a task**: Ask Kilo Code to do something simple like:

    ```
    "List all files in the project"
    ```

3. **Wait for idle**: After the task completes, wait 5 seconds (or your configured timeout)

4. **Expected behavior**:
    - 🔔 You'll see a notification: "Kilo Code is now idle and ready for your next request."
    - 🤖 If you have text files in `.kilocode-prompts/`, they'll be automatically sent to the AI
    - 📝 Check the Output panel (View > Output, select "Kilo-Code") to see logs

## Settings Reference

| Setting               | Description                | Default             | Range/Options                   |
| --------------------- | -------------------------- | ------------------- | ------------------------------- |
| `enabled`             | Turn idle detection on/off | `false`             | `true` / `false`                |
| `idleTimeoutMs`       | Milliseconds before idle   | `5000`              | `1000` - `300000`               |
| `enableNotifications` | Show idle notifications    | `true`              | `true` / `false`                |
| `autoPromptFolder`    | Folder with prompt files   | `.kilocode-prompts` | Any path (relative or absolute) |

## Common Scenarios

### Scenario 1: Simple Idle Notification

**Goal**: Just get notified when Kilo Code is idle

**Settings**:

```json
{
	"kilo-code.idleDetection.enabled": true,
	"kilo-code.idleDetection.idleTimeoutMs": 5000,
	"kilo-code.idleDetection.enableNotifications": true,
	"kilo-code.idleDetection.autoPromptFolder": ""
}
```

> Note: Empty `autoPromptFolder` disables auto-prompt

### Scenario 2: Batch Task Queue

**Goal**: Queue up multiple tasks in text files

**Settings**:

```json
{
	"kilo-code.idleDetection.enabled": true,
	"kilo-code.idleDetection.idleTimeoutMs": 3000,
	"kilo-code.idleDetection.enableNotifications": false,
	"kilo-code.idleDetection.autoPromptFolder": ".kilocode-prompts"
}
```

**Folder Structure**:

```
your-workspace/
├── .kilocode-prompts/
│   ├── 01-refactor-auth.txt
│   ├── 02-add-tests.txt
│   └── 03-update-docs.txt
```

### Scenario 3: Silent Auto-Prompt

**Goal**: Auto-run tasks without notifications

**Settings**:

```json
{
	"kilo-code.idleDetection.enabled": true,
	"kilo-code.idleDetection.idleTimeoutMs": 10000,
	"kilo-code.idleDetection.enableNotifications": false,
	"kilo-code.idleDetection.autoPromptFolder": "C:\\Users\\YourName\\kilocode-tasks"
}
```

## Troubleshooting

### Settings Not Showing Up?

1. **Restart VSCode** after installing the extension
2. Check extension is installed: `Ctrl + Shift + X`, search "Kilo Code"
3. Verify version is `4.106.0` or higher

### Auto-Prompt Not Working?

1. Check the Output panel for logs:

    - View > Output
    - Select "Kilo-Code" from dropdown
    - Look for `[IdleDetection]` messages

2. Verify folder exists and has `.txt` files:

    ```bash
    ls .kilocode-prompts/
    ```

3. Make sure text files are not empty

4. Check that `enabled` is `true` and folder path is correct

### How to View Logs

1. Open Output panel: View > Output (or `Ctrl + Shift + U`)
2. Select "Kilo-Code" from the dropdown
3. Look for entries like:
    ```
    [IdleDetection] Service initialized and configured
    [IdleDetection] Task started - marking as active
    [IdleDetection] Task completed or message sent - starting idle timer
    [IdleDetection] Idle state detected
    [IdleDetection] Auto-prompt ready, sending to AI
    ```

## Advanced Usage

### Custom Folder Location

Use an absolute path for a shared folder:

```json
{
	"kilo-code.idleDetection.autoPromptFolder": "C:\\Shared\\KilocodePrompts"
}
```

Or a relative path from workspace root:

```json
{
	"kilo-code.idleDetection.autoPromptFolder": "tasks/pending"
}
```

### Multiple Text Files

All `.txt` files in the folder will be combined into one prompt:

**Input**:

- `task1.txt`: "Refactor the auth module"
- `task2.txt`: "Add error handling"

**Combined Prompt Sent to AI**:

```
### Content from task1.txt:
Refactor the auth module

### Content from task2.txt:
Add error handling
```

## Next Steps

- Read the full documentation: [IDLE_DETECTION_FEATURES.md](IDLE_DETECTION_FEATURES.md)
- Try creating a batch of tasks in text files
- Experiment with different timeout values
- Check out the implementation details in the main docs

---

**Need Help?** Check the logs in the Output panel (View > Output > "Kilo-Code")
