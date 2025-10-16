# Idle Detection and Auto-Prompt Features

This document describes the new idle detection and auto-prompt features added to Kilocode.

## Overview

Kilocode now includes an idle detection system that monitors when the AI model has completed a task and is now idle. When idle state is detected, Kilocode can:

1. Show a notification to inform you that it's ready for the next request
2. Automatically read text files from a designated folder and send them to the AI as prompts

## Configuration Settings

All settings can be configured in VSCode settings (File > Preferences > Settings, then search for "kilo-code idle"):

### `kilo-code.idleDetection.enabled`

- **Type**: Boolean
- **Default**: `false`
- **Description**: Enable idle detection to monitor when Kilo Code becomes idle after completing tasks

### `kilo-code.idleDetection.idleTimeoutMs`

- **Type**: Number
- **Default**: `5000`
- **Range**: 1000-300000 (1 second to 5 minutes)
- **Description**: Time in milliseconds to wait before considering Kilo Code idle

### `kilo-code.idleDetection.enableNotifications`

- **Type**: Boolean
- **Default**: `true`
- **Description**: Show a notification when Kilo Code becomes idle

### `kilo-code.idleDetection.autoPromptFolder`

- **Type**: String
- **Default**: `.kilocode-prompts`
- **Description**: Folder path (relative to workspace root or absolute) containing text files to automatically send to AI when idle

### `kilo-code.idleDetection.showStatusBar`

- **Type**: Boolean
- **Default**: `true`
- **Description**: Show idle detection status in the VSCode status bar

### `kilo-code.idleDetection.method`

- **Type**: String (Enum)
- **Default**: `"auto"`
- **Options**: `"auto"`, `"button"`, `"events"`, `"hybrid"`
- **Description**: Detection method to use for idle state monitoring

## How It Works

### Idle Detection

1. **Task Monitoring**: The system monitors task lifecycle events:

    - When a task starts, the system is marked as active
    - When a task completes or the AI sends a message, a timer starts
    - If no user activity occurs within the configured timeout period, the system enters idle state

2. **User Activity**: Any user interaction (sending a message, starting a new task) resets the idle state

3. **Notifications**: When idle state is detected and notifications are enabled, a VSCode notification appears informing you that Kilocode is ready for the next request

### Pause/Resume Control

You can pause and resume the auto-prompt functionality directly from the chat interface:

1. **Location**: Look for the pause/play button in the task header (visible in both collapsed and expanded states)
2. **Pause**: Click the pause button to temporarily stop auto-prompt processing
    - Auto-prompt files will not be read or sent to the AI while paused
    - The idle detection continues to monitor activity, but won't trigger auto-prompts
    - Status bar shows "Paused" state with a debug-pause icon
3. **Resume**: Click the play button to resume auto-prompt processing
    - Returns to the previous idle state
    - If already idle, auto-prompts will be processed immediately
    - Status bar returns to normal state

**Use Cases for Pause/Resume**:

- Temporarily stop automated prompts while working on something manually
- Prevent queued tasks from running while reviewing previous results
- Control when batch processing should occur

### Auto-Prompt System

When idle state is detected, the system automatically:

1. **Scans the Auto-Prompt Folder**: Reads all `.txt` files from the configured folder
2. **Combines Content**: Concatenates the content from all text files into a single prompt
3. **Sends to AI**: Automatically creates a new task with the combined content

#### Auto-Prompt Folder Structure

Create a folder in your workspace root (or specify a custom path) named `.kilocode-prompts` (or your configured name):

```
your-workspace/
├── .kilocode-prompts/
│   ├── task1.txt
│   ├── task2.txt
│   └── instructions.txt
├── src/
└── ...
```

Each text file will be read and combined with a header indicating which file it came from:

```
### Content from task1.txt:
[content of task1.txt]

### Content from task2.txt:
[content of task2.txt]

### Content from instructions.txt:
[content of instructions.txt]
```

## Usage Examples

### Example 1: Basic Idle Notification

Enable idle detection with notifications:

```json
{
	"kilo-code.idleDetection.enabled": true,
	"kilo-code.idleDetection.idleTimeoutMs": 3000,
	"kilo-code.idleDetection.enableNotifications": true
}
```

Result: After the AI completes a task, wait 3 seconds. If no user activity occurs, a notification appears.

### Example 2: Auto-Prompt Queue

Set up an auto-prompt folder with multiple tasks:

1. Enable idle detection with auto-prompt:

```json
{
	"kilo-code.idleDetection.enabled": true,
	"kilo-code.idleDetection.idleTimeoutMs": 5000,
	"kilo-code.idleDetection.autoPromptFolder": ".kilocode-prompts"
}
```

2. Create text files in `.kilocode-prompts/`:

    - `01-refactor.txt`: "Refactor the authentication module"
    - `02-tests.txt`: "Add unit tests for the user service"
    - `03-docs.txt`: "Update the API documentation"

3. When Kilocode becomes idle, it will automatically:
    - Read all three files
    - Combine their content
    - Send the combined content as a new task to the AI

### Example 3: Batch Processing Workflow

Use auto-prompts for batch processing:

1. Configure with longer timeout:

```json
{
	"kilo-code.idleDetection.enabled": true,
	"kilo-code.idleDetection.idleTimeoutMs": 10000,
	"kilo-code.idleDetection.enableNotifications": false,
	"kilo-code.idleDetection.autoPromptFolder": "~/kilocode-batch-tasks"
}
```

2. Create tasks in the batch folder
3. Start the first task manually
4. After each task completes and 10 seconds of idle time, the next batch automatically starts

## Implementation Details

### Service Architecture

- **IdleDetectionService**: Singleton service that manages idle state detection
    - Located at: `src/services/idle-detection/IdleDetectionService.ts`
    - Emits events: `idle`, `active`, `autoPromptReady`

### Integration Points

1. **ClineProvider**: Main integration point

    - Initializes the service
    - Listens to task lifecycle events
    - Handles auto-prompt requests

2. **Task Events**: Hooked into these events:
    - `TaskStarted`: Marks system as active
    - `TaskCompleted`: Starts idle timer
    - `TaskIdle`: Starts idle timer
    - `TaskUserMessage`: Resets idle state

### Logging

All idle detection activity is logged to the "Kilo-Code" output channel. To view logs:

1. Open the Output panel (View > Output)
2. Select "Kilo-Code" from the dropdown
3. Look for entries prefixed with `[IdleDetection]`

## Troubleshooting

### Idle detection not working

- Check that `kilo-code.idleDetection.enabled` is set to `true`
- Verify the timeout value is reasonable (default: 5000ms)
- Check the Output channel for any error messages

### Auto-prompt not triggering

- Verify the folder path is correct
- Ensure the folder contains `.txt` files with content
- Check that the folder is accessible (permissions)
- Look for error messages in the Output channel
- **Check if auto-prompts are paused**: Look for the pause button in the task header - if it shows a "play" icon, click it to resume

### Notifications not showing

- Ensure `kilo-code.idleDetection.enableNotifications` is `true`
- Check VSCode notification settings
- Verify notifications are not being blocked by your OS

## Best Practices

1. **Set Reasonable Timeouts**: Start with 5-10 seconds to avoid premature idle detection
2. **Use Descriptive Filenames**: Name your auto-prompt files to indicate their purpose
3. **Monitor Logs**: Keep an eye on the Output channel when testing
4. **Clean Up Prompts**: Remove or move processed text files to avoid re-triggering
5. **Test Incrementally**: Start with notifications only, then add auto-prompts
6. **Use Pause/Resume**: Pause auto-prompts when you need manual control, then resume when ready for automation

## Future Enhancements

Potential future improvements:

- Option to delete/archive text files after processing
- Support for other file formats (markdown, json)
- Priority ordering for auto-prompts
- Conditional auto-prompts based on task results
- Integration with external task queues

## Support

For issues or questions:

- Check the logs in the Output channel
- Review this documentation
- Open an issue on the Kilocode GitHub repository
