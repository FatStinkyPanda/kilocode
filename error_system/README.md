# Error Tracking and Logging System

This folder contains the complete error tracking, logging, and AI context generation system for the AI Document Generator application.

## Overview

The error system provides comprehensive error tracking, multi-destination logging, automatic AI context generation, and debugging support.

## Directory Structure

```
error_system/
├── backend/
│   ├── utils/                    # Core error handling utilities
│   │   ├── logger.py            # Multi-destination logging system
│   │   ├── error_handlers.py    # Error handling decorators and context managers
│   │   └── error_classes.py     # Error classes and enums
│   ├── services/
│   │   └── ai_context_service.py # AI context management service
│   ├── api/
│   │   └── ai_context_routes.py  # AI context API routes
│   └── models/
│       └── ai_context_usage.py   # AI context usage tracking model
├── errors/                        # Error logs and tracking
│   ├── Auto-Error_AI-Context.txt # AI-readable error context (auto-generated)
│   ├── error_summary.json        # Error summary statistics
│   ├── master_error_log.log      # Master error log
│   ├── by_component/             # Component-specific error logs
│   ├── by_date/                  # Date-specific error logs
│   ├── by_severity/              # Severity-specific error logs
│   ├── debug_snapshots/          # Critical error debug snapshots
│   └── error_patterns/           # Error pattern analysis
├── logs/                          # Session logs
│   └── current_session.log       # Current session log
└── ai_context/                    # AI context files
    ├── best_practices/           # Best practice documentation
    ├── examples/                 # Example templates
    ├── latex_packages/           # LaTeX package documentation
    └── templates/                # Template snippets

```

## Core Components

### 1. Error Handling System

#### Error Classes (`backend/utils/error_classes.py`)

- **ErrorSeverity**: CRITICAL, ERROR, WARNING, INFO
- **ErrorComponent**: AI, SCHEMA, FILE, TEMPLATE, LATEX, DATABASE, API, etc.
- **ErrorCategory**: API_KEY_INVALID, VALIDATION_FAILED, FILE_NOT_FOUND, etc.
- **AppError**: Base error class with context tracking
- Specialized error classes: AIProviderError, SchemaValidationError, FileProcessingError, etc.

#### Logger (`backend/utils/logger.py`)

**Features:**

- Multi-destination logging (console, files, component-specific logs)
- Automatic directory structure creation
- Error tracking by component, severity, and date
- Debug snapshots for critical errors
- AI context file auto-generation

**Usage:**

```python
from backend.utils.logger import get_logger

logger = get_logger()
logger.info("Operation started")
logger.error("Operation failed")
```

#### Error Handlers (`backend/utils/error_handlers.py`)

**Decorators:**

- `@handle_errors()` - Sync function error handling
- `@async_handle_errors()` - Async function error handling

**Context Managers:**

- `error_context()` - Context manager for error handling

**Utility Functions:**

- `log_and_raise()` - Log and raise error
- `try_or_log()` - Try operation, log errors, return default
- `validate_not_none()` - Validate non-null values
- `validate_file_exists()` - Validate file existence
- `validate_type()` - Validate value types

**Example Usage:**

```python
from backend.utils.error_handlers import handle_errors, error_context
from backend.utils.error_classes import ErrorComponent, ErrorCategory

@handle_errors(
    component=ErrorComponent.FILE,
    category=ErrorCategory.FILE_READ_ERROR,
    user_message="Failed to read file"
)
def read_file(path):
    # function code
    pass

with error_context(ErrorComponent.DATABASE, "Saving user data"):
    # code that might raise errors
    db.save(user)
```

### 2. AI Context System

#### AI Context Service (`backend/services/ai_context_service.py`)

**Features:**

- Loads and manages AI context from various sources
- Detects needed context based on task requirements
- Builds context-aware prompts
- Searches context files

**Methods:**

- `load_package_context()` - Load LaTeX package documentation
- `load_example_context()` - Load example templates
- `detect_needed_context()` - Auto-detect required context
- `build_context_prompt()` - Build context-enriched prompts
- `search_context()` - Search across context files

#### AI Context Routes (`backend/api/ai_context_routes.py`)

**Endpoints:**

- `POST /ai-context/detect` - Detect needed context
- `POST /ai-context/build-prompt` - Build context-enriched prompt
- `GET /ai-context/list` - List available context
- `POST /ai-context/search` - Search context files
- `GET /ai-context/status` - Get context system status

### 3. Error Logs Structure

#### By Component

Logs are organized by system component (API, Database, File, etc.) for targeted debugging.

#### By Date

Daily error logs in JSON format for temporal analysis.

#### By Severity

Logs grouped by severity level (critical, error, warning, info).

#### Debug Snapshots

Detailed snapshots created for critical errors, including:

- Full error details
- System information
- Recent log history

### 4. AI Context Files

#### Best Practices (`ai_context/best_practices/`)

- Color theory
- Resume design
- Typography

#### Examples (`ai_context/examples/`)

- Academic CV
- Complex layouts
- Creative resumes
- Two-column resumes

#### LaTeX Packages (`ai_context/latex_packages/`)

- biblatex, fontspec, geometry, hyperref, multicol, tikz, xcolor

#### Templates (`ai_context/templates/`)

- Header styles
- Section formats

## Auto-Generated Files

### Auto-Error_AI-Context.txt

This file is automatically updated by the logging system and contains:

- Error summary statistics
- Recent errors (last 10)
- Errors grouped by component and severity
- Debugging instructions for AI agents
- Component-to-source-file mapping

**Location:** `errors/Auto-Error_AI-Context.txt`

### error_summary.json

Real-time error statistics including:

- Total error count
- Last error details
- Errors by component
- Errors by severity
- Last updated timestamp

**Location:** `errors/error_summary.json`

## Integration Guide

### Using the Error System

1. **Import required modules:**

```python
from backend.utils.logger import get_logger
from backend.utils.error_handlers import handle_errors, error_context
from backend.utils.error_classes import (
    AppError,
    ErrorSeverity,
    ErrorComponent,
    ErrorCategory
)
```

2. **Create logger instance:**

```python
logger = get_logger()
```

3. **Use error handling decorators:**

```python
@handle_errors(
    component=ErrorComponent.AI,
    severity=ErrorSeverity.ERROR,
    category=ErrorCategory.API_CONNECTION,
    user_message="AI service unavailable"
)
def call_ai_service():
    # your code
    pass
```

4. **Use error context managers:**

```python
with error_context(
    ErrorComponent.DATABASE,
    "Creating user record",
    user_message="Failed to create user"
):
    db.create_user(data)
```

### Using AI Context

1. **Import AI context service:**

```python
from backend.services.ai_context_service import AIContextManager
```

2. **Initialize context manager:**

```python
context_manager = AIContextManager()
```

3. **Detect needed context:**

```python
context = context_manager.detect_needed_context(
    task_type="resume_generation",
    requirements=["two-column layout", "modern design"]
)
```

4. **Build context-enriched prompt:**

```python
prompt = context_manager.build_context_prompt(
    base_prompt="Generate a resume template",
    context_files=["examples/two_column_resume.tex"]
)
```

## Error Codes

Error codes follow the format: `{COMPONENT}-{UNIQUE_ID}`

Examples:

- `API-7CA17F7C` - API component error
- `DATABASE-A3F2B1C9` - Database component error
- `FILE-D4E5F6A7` - File component error

## Maintenance

### Log Rotation

- Session logs: Overwritten each session
- Error logs: Append-only, manual cleanup recommended
- Debug snapshots: One per critical error

### Context Updates

- Add new examples to `ai_context/examples/`
- Add package docs to `ai_context/latex_packages/`
- Add best practices to `ai_context/best_practices/`
- System auto-detects new files

## Support

For debugging:

1. Check `errors/Auto-Error_AI-Context.txt` for AI-readable error summary
2. Review `errors/error_summary.json` for statistics
3. Check component-specific logs in `errors/by_component/`
4. For critical errors, review `errors/debug_snapshots/`
5. Check session log at `logs/current_session.log`

## Version Information

This error system is part of the AI Document Generator application and includes:

- Comprehensive error tracking
- Multi-destination logging
- AI context management
- Automatic error analysis
- Debug snapshot generation
- AI-readable error reports
