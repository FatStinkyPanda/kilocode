# Idle Status Monitor Feature

## Overview

The idle status monitor is a live status indicator that appears in the VSCode status bar (bottom toolbar), showing the real-time idle detection state of Kilo Code.

## Status Bar Display

The status bar shows one of three states:

### 1. Active (Task Running)

- **Display**: `$(sync~spin) Kilo Code: Active`
- **Icon**: Spinning sync icon
- **Color**: Default VSCode colors
- **Meaning**: A task is currently running in Kilo Code

### 2. Waiting (Countdown to Idle)

- **Display**: `$(clock) Kilo Code: Waiting`
- **Icon**: Clock icon
- **Color**: Warning foreground color (typically yellow/orange)
- **Meaning**: Task has completed, waiting for idle timeout before marking as idle

### 3. Idle (Ready for Next Task)

- **Display**: `$(check) Kilo Code: Idle`
- **Icon**: Check mark icon
- **Color**: Warning background and foreground (typically yellow/orange background)
- **Meaning**: System is idle and ready for the next task

## Settings

### kilo-code.idleDetection.showStatusBar

- **Type**: Boolean
- **Default**: `true`
- **Description**: Show idle status in the VSCode status bar (bottom toolbar)

To configure:

1. Open Settings (Ctrl+, or Cmd+,)
2. Search for "kilo-code idle status"
3. Check or uncheck "Show Status Bar"

Or in settings.json:

```json
{
	"kilo-code.idleDetection.showStatusBar": true
}
```

## How It Works

### State Transitions

```
[Task Starts]
    ↓
Active (spinning icon)
    ↓
[Task Completes/Message Sent]
    ↓
Waiting (clock icon)
    ↓
[Timeout Expires - default 5 seconds]
    ↓
Idle (check icon)
    ↓
[User Sends Message / New Task Starts]
    ↓
Active (back to spinning icon)
```

### Real-Time Updates

The status bar updates **instantly** when:

- A task starts (→ Active)
- A task completes (→ Waiting)
- The idle timeout expires (→ Idle)
- The user sends a new message (→ Active)

### Dynamic Configuration

The status bar:

- **Appears** when idle detection is enabled AND showStatusBar is true
- **Disappears** when idle detection is disabled OR showStatusBar is false
- **Updates** automatically when settings change (no restart required)

## Use Cases

### 1. Visual Confirmation

Always know at a glance if Kilo Code is idle without checking logs or waiting for notifications.

### 2. Task Coordination

See when Kilo Code is ready for the next task, perfect for:

- Queuing up multiple tasks
- Knowing when to add new work
- Coordinating with auto-prompt features

### 3. Status Monitoring

Monitor idle detection behavior while testing or debugging:

- Verify idle detection is working
- See state transitions in real-time
- Confirm configuration changes take effect

### 4. Professional Workflow

Provides status monitoring similar to other IDE features like:

- Language server status
- Git sync status
- Extension activity indicators

## Integration with Other Features

### Works With Notifications

- Status bar provides **always visible** status
- Notifications provide **one-time alerts** when idle
- Both can be enabled independently

### Works With Auto-Prompt

- Watch status bar to see when auto-prompts will trigger
- Status changes from Waiting → Idle → Active when auto-prompt fires
- Visual confirmation that auto-prompt feature executed

### Configuration Matrix

| Idle Detection | Show Status Bar | Result                                        |
| -------------- | --------------- | --------------------------------------------- |
| Disabled       | Any             | No status bar                                 |
| Enabled        | true            | Status bar visible                            |
| Enabled        | false           | Status bar hidden (but detection still works) |

## Visual Examples

### Location

The status bar appears in the **bottom-right corner** of VSCode, alongside other status items like:

- Git branch
- Language mode
- Line/column numbers
- Extension status indicators

### Size

- Compact and unobtrusive
- Uses standard VSCode status bar styling
- Fits naturally with other status items

## Tips

1. **Keep It Visible**: Leave the status bar enabled to always know Kilo Code's state

2. **Use With Auto-Prompt**: Combine with auto-prompt to see your tasks being processed automatically

3. **Monitor State Changes**: Watch the status bar during task execution to understand idle detection behavior

4. **Disable If Needed**: If the status bar feels cluttered, you can disable just the status bar while keeping idle detection enabled

5. **Color Customization**: The status bar uses VSCode theme colors, so it adapts to your theme automatically

## Troubleshooting

### Status Bar Not Appearing

**Check**: Is idle detection enabled?

```json
{
	"kilo-code.idleDetection.enabled": true
}
```

**Check**: Is showStatusBar enabled?

```json
{
	"kilo-code.idleDetection.showStatusBar": true
}
```

**Solution**: Both must be `true` for the status bar to appear.

### Status Bar Not Updating

1. Check the Output panel (View > Output, select "Kilo-Code")
2. Look for `[IdleDetection] Status changed to:` messages
3. Verify idle detection is actually enabled

### Status Bar Disappears

**Cause**: Configuration changed to disable it
**Solution**: Re-enable in settings

### Want It Back After Disabling

Just toggle the settings:

1. Open Settings
2. Search "kilo-code idle status"
3. Check "Show Status Bar"

## Technical Details

### Implementation

- Uses `vscode.window.createStatusBarItem()`
- Positioned at `StatusBarAlignment.Right` with priority `100`
- Updates via event listeners on `IdleDetectionService`
- Disposed automatically when disabled

### Performance

- Minimal performance impact
- Updates only on state changes (not constantly polling)
- Uses VSCode's built-in status bar API

### Events

The status bar listens to the `statusChanged` event from `IdleDetectionService`, which emits:

- `"active"` when a task starts
- `"waiting"` when a task completes
- `"idle"` when the timeout expires

## Related Documentation

- [IDLE_DETECTION_FEATURES.md](IDLE_DETECTION_FEATURES.md) - Full idle detection documentation
- [QUICK_START_IDLE_DETECTION.md](QUICK_START_IDLE_DETECTION.md) - Quick setup guide

## Changelog

### v4.106.0+

- Added idle status monitor to VSCode status bar
- Added `kilo-code.idleDetection.showStatusBar` setting
- Three states: Active (spinning), Waiting (clock), Idle (check)
- Real-time updates with visual indicators
- Dynamic show/hide based on configuration

---

**Note**: The status bar is a **live indicator**, not a historical record. It always shows the current state, not past states.
