# Idle Detection Methods

## Overview

Kilo Code now supports multiple methods for detecting when the AI becomes idle. You can choose the detection method that works best for your workflow through a dropdown setting.

## Available Detection Methods

### 1. Auto (Recommended - Default)

**Setting Value**: `auto`

Automatically chooses the best detection method based on Kilo Code's current state. Currently uses both button and event-based detection for maximum reliability.

**Best For**:

- Most users (recommended default)
- When you want the system to handle detection automatically
- Maximum reliability with minimal configuration

---

### 2. Button (Most Reliable)

**Setting Value**: `button`

Detects idle state by monitoring when the "Start New Task" button becomes visible in the Kilo Code interface.

**How It Works**:

- Monitors the internal task stack (`clineStack`)
- When stack becomes empty → "Start New Task" button appears → Idle timer starts
- When task added to stack → Button disappears → Marks as active

**Advantages**:

- **Most Reliable**: Directly tied to UI state
- **Accurate**: Button visibility precisely indicates idle state
- **Simple**: Easy to understand and debug

**Logs**:

```
[IdleDetection:Button] Start New Task button visible - starting idle timer
[IdleDetection:Button] Start New Task button hidden - marking as active
```

**Best For**:

- Users who want the most reliable detection
- When event-based detection isn't working correctly
- Primary recommendation once fully tested

---

### 3. Events (Legacy Method)

**Setting Value**: `events`

Detects idle state using task lifecycle events from the Kilo Code task system.

**How It Works**:

- Listens to `TaskStarted` event → Marks as active
- Listens to `TaskCompleted` and `TaskIdle` events → Starts idle timer
- Uses event-driven architecture

**Advantages**:

- Original implementation
- Event-driven, responds immediately to state changes

**Disadvantages**:

- May have timing issues
- Events might not fire in all scenarios
- Less reliable than button detection

**Logs**:

```
[IdleDetection:Events] Task started - marking as active
[IdleDetection:Events] Task completed or message sent - starting idle timer
```

**Best For**:

- Backward compatibility
- When you specifically need event-based detection
- Testing and comparison purposes

**Note**: This method may need improvements in the future. Use `button` or `hybrid` for more reliability.

---

### 4. Hybrid (Maximum Reliability)

**Setting Value**: `hybrid`

Uses **both** button and event-based detection simultaneously for redundant idle detection.

**How It Works**:

- Combines button visibility monitoring AND event listening
- Whichever method detects idle first triggers the detection
- Provides redundancy if one method fails

**Advantages**:

- **Maximum Reliability**: Two independent detection systems
- **Redundancy**: If one method fails, the other catches it
- **Best of Both**: Combines event responsiveness with button accuracy

**Logs**:

```
[IdleDetection:Button] Start New Task button visible - starting idle timer
[IdleDetection:Events] Task completed or message sent - starting idle timer
```

**Best For**:

- Critical workflows where idle detection must never fail
- When you want maximum confidence
- Testing to compare detection methods

---

## Configuration

### Via Settings UI

1. Open Settings: `Ctrl + ,` (or `Cmd + ,`)
2. Search: `kilo-code idle detection`
3. Find **"Detection Method"** dropdown
4. Select your preferred method:
    - Auto (recommended)
    - Button (most reliable)
    - Events (legacy)
    - Hybrid (maximum reliability)

### Via settings.json

```json
{
	"kilo-code.idleDetection.enabled": true,
	"kilo-code.idleDetection.detectionMethod": "auto"
}
```

**Options**: `"auto"`, `"button"`, `"events"`, or `"hybrid"`

---

## Comparison Table

| Method     | Reliability | Performance | Use Case                             |
| ---------- | ----------- | ----------- | ------------------------------------ |
| **Auto**   | ⭐⭐⭐⭐⭐  | Excellent   | Default - works for everyone         |
| **Button** | ⭐⭐⭐⭐⭐  | Excellent   | Most reliable, tied to UI            |
| **Events** | ⭐⭐⭐      | Excellent   | Legacy, may need improvements        |
| **Hybrid** | ⭐⭐⭐⭐⭐  | Very Good   | Maximum reliability, slight overhead |

---

## How to Choose

### Use **Auto** if:

- ✅ You want the recommended default
- ✅ You trust the system to choose for you
- ✅ You don't want to think about it

### Use **Button** if:

- ✅ You want the most reliable method
- ✅ Event detection isn't working for you
- ✅ You want simple, predictable behavior

### Use **Events** if:

- ✅ You need backward compatibility
- ✅ You're testing different methods
- ✅ Button detection isn't available (future scenarios)

### Use **Hybrid** if:

- ✅ You need absolute reliability
- ✅ You don't mind slight redundancy
- ✅ Your workflow is critical and can't miss idle detection

---

## Technical Details

### Button Detection Implementation

**File**: `src/core/webview/ClineProvider.ts`

```typescript
async addClineToStack(task: Task) {
  const wasEmpty = this.clineStack.length === 0
  this.clineStack.push(task)

  // If stack was empty (button was visible), notify it's now hidden
  if (wasEmpty) {
    this.idleDetectionService?.notifyButtonHidden()
  }
}

async removeClineFromStack() {
  // ... remove task ...

  // If stack is now empty (button now visible)
  if (this.clineStack.length === 0) {
    this.idleDetectionService?.notifyButtonVisible()
  }
}
```

### Method Selection Logic

**File**: `src/services/idle-detection/IdleDetectionService.ts`

```typescript
private shouldUseEventDetection(): boolean {
  return (
    this.config.detectionMethod === "events" ||
    this.config.detectionMethod === "hybrid" ||
    this.config.detectionMethod === "auto"
  )
}

private shouldUseButtonDetection(): boolean {
  return (
    this.config.detectionMethod === "button" ||
    this.config.detectionMethod === "hybrid" ||
    this.config.detectionMethod === "auto"
  )
}
```

---

## Debugging

### Check Which Method Is Active

1. Open Output panel: `View > Output`
2. Select "Kilo-Code" from dropdown
3. Look for detection logs:

```
[IdleDetection:Button] Start New Task button visible - starting idle timer
[IdleDetection:Events] Task completed or message sent - starting idle timer
```

The prefix (`Button` or `Events`) tells you which method detected the idle state.

### Troubleshooting

**Problem**: Idle detection not working

**Solutions**:

1. Check that idle detection is enabled
2. Try switching to `"button"` method (most reliable)
3. Try `"hybrid"` method for redundancy
4. Check Output panel for detection logs
5. Verify idle timeout setting (default: 5000ms)

**Problem**: Detection triggering too soon/late

**Solutions**:

1. Adjust `idleTimeoutMs` setting
2. Check which detection method is being used
3. Review logs to see timing of detection

---

## Future Improvements

Potential future detection methods:

- **AI State Monitoring**: Detect based on AI model response completion
- **Activity Tracking**: Monitor user input/output activity
- **Custom Logic**: User-defined detection conditions
- **ML-Based**: Learn user patterns for optimal detection

The modular architecture makes it easy to add new methods in the future!

---

## Migration Guide

### From Previous Versions

If you're upgrading from a version without detection methods:

**Automatic Migration**:

- Existing installations default to `"auto"`
- No configuration changes needed
- All existing features continue to work

**Optional**:

- Experiment with `"button"` method for improved reliability
- Try `"hybrid"` if you experience detection issues

---

## Related Documentation

- [IDLE_DETECTION_FEATURES.md](IDLE_DETECTION_FEATURES.md) - Main idle detection documentation
- [STATUS_MONITOR_FEATURE.md](STATUS_MONITOR_FEATURE.md) - Status bar indicator documentation
- [QUICK_START_IDLE_DETECTION.md](QUICK_START_IDLE_DETECTION.md) - Quick setup guide

---

## Changelog

### v4.106.0+

- Added detection method dropdown setting
- Implemented button-based detection
- Added hybrid detection mode
- Enhanced logging with method prefixes
- Improved reliability with multiple detection methods

---

**Recommendation**: Start with `"auto"` (default), then switch to `"button"` if you experience any detection issues. Most users will find the default works perfectly!
